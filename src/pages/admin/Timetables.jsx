import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, Link } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const backend_url = import.meta.env.VITE_API_URL;

const Timetables = () => {
  const location = useLocation();
  const teacherData = location.state?.teacherData;
  console.log(teacherData);
  const { teacherId } = useParams(); // Get teacherId from URL
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoverInfo, setHoverInfo] = useState({
    visible: false,
    classes: [],
    availability: null,
    day: null,
    position: { x: 0, y: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState([]); // All classes
  const [availabilities, setAvailabilities] = useState([]); // All availabilities
  const [filteredClasses, setFilteredClasses] = useState([]); // Filtered classes for the teacher
  const [filteredAvailabilities, setFilteredAvailabilities] = useState([]); // Filtered availabilities for the teacher
  const [showErrorDialog, setShowErrorDialog] = useState(false); // Error dialog for already available dates or classes
  const [teacherSchedule, setTeacherSchedule] = useState([]);

  // Fetch all classes and availabilities
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [classesResponse, availabilitiesResponse, scheduleResponse] =
          await Promise.all([
            axiosInstance.get(`${backend_url}/profile/all-classes`),
            axiosInstance.get(`${backend_url}/api/teacher/availabilities/all`),
            axiosInstance.get(`${backend_url}/api/teacher/all`),
          ]);

        const formattedClasses = classesResponse.data.classes
          .map((cls) => {
            // For recurring classes, use the sessions array
            if (cls.isRecurring && cls.sessions) {
              return cls.sessions.map((session) => ({
                ...session,
                batchId: cls.batchId,
                classLink: cls.classLink,
                teacherId: cls.teacherId,
                isRecurring: true,
                students: cls.studentIds,
              }));
            }
            // For single classes
            return {
              ...cls,
              startDateTime: cls.startDateTime || cls.startDate,
              endDateTime: cls.endDateTime || cls.endDate,
              students: cls.studentIds,
            };
          })
          .flat(); // Flatten the array

        setClasses(formattedClasses);
        setAvailabilities(availabilitiesResponse.data.data || []);
        console.log("schedule", scheduleResponse.data.data);
        if (scheduleResponse.data.data && teacherId) {
          const currentTeacherSchedule = scheduleResponse.data.data.find(
            (item) => item.teacherId._id === teacherId
          );
          setTeacherSchedule(currentTeacherSchedule?.schedule || []);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch timetable data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  // Filter classes and availabilities based on teacherId
  useEffect(() => {
    if (teacherId) {
      const teacherClasses = classes.filter(
        (cls) => cls.teacherId?._id === teacherId
      );

      // Flatten the availabilities array to extract all time slots for the teacher
      const teacherAvailabilities = availabilities
        .filter((avail) => avail.teacherId === teacherId)
        .flatMap((avail) => avail.availableTimeSlots);

      setFilteredClasses(teacherClasses);
      setFilteredAvailabilities(teacherAvailabilities);
      console.log("class", filteredClasses);
    }
  }, [teacherId, classes, availabilities]);

  // Helper functions for calendar rendering
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getClassesForDate = (day) => {
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    return filteredClasses.filter((cls) => {
      if (!cls.startDateTime) return false;

      const classDate = new Date(cls.startDateTime);

      return (
        classDate.getFullYear() === targetDate.getFullYear() &&
        classDate.getMonth() === targetDate.getMonth() &&
        classDate.getDate() === targetDate.getDate()
      );
    });
  };

  const getAvailabilityForDate = (day) => {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");

    const dateToCheck = new Date(`${year}-${month}-${dayStr}T00:00:00.000Z`);

    return filteredAvailabilities.find((avail) => {
      const availDate = new Date(avail.date);
      return (
        availDate.getFullYear() === dateToCheck.getFullYear() &&
        availDate.getMonth() === dateToCheck.getMonth() &&
        availDate.getDate() === dateToCheck.getDate()
      );
    });
  };

  const formatTime = (cls) => {
    if (!cls.startDateTime) return "N/A";

    // Create date object from the ISO string
    const date = new Date(cls.startDateTime);

    // Format in user's local timezone
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);

    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    // Return in dd/mm/yyyy format
    return `${day}/${month}/${year}`;
  };

  const handleMouseEnter = (day, event) => {
    const classes = getClassesForDate(day);
    const availability = getAvailabilityForDate(day);

    if (classes.length > 0 || availability) {
      const rect = event.currentTarget.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const popupHeight = classes.length > 0 && availability ? 400 : 300;

      const leftOffset = rect.left + window.scrollX;
      const xPos =
        leftOffset + 300 > viewportWidth
          ? Math.max(0, leftOffset - 280)
          : leftOffset;

      const yPos = rect.top + window.scrollY - popupHeight;

      setHoverInfo({
        visible: true,
        classes: classes,
        availability: availability,
        day: day,
        position: { x: xPos, y: Math.max(0, yPos) },
      });
    }
  };

  const handleMouseLeave = () => {
    setHoverInfo((prev) => ({ ...prev, visible: false }));
  };

  const filterUpcomingAvailabilitySlots = (slots) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    return slots.filter((slot) => {
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0); // Set to start of day
      return slotDate >= today;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for the first week
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-[60px] sm:min-h-[80px] md:min-h-[100px] border bg-white"
        ></div>
      );
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayClasses = getClassesForDate(day);
      const hasClasses = dayClasses.length > 0;
      const classCount = dayClasses.length;
      const isSelected = hoverInfo.visible && hoverInfo.day === day;
      const isAvailable = getAvailabilityForDate(day);

      days.push(
        <div
          key={day}
          className={`min-h-[60px] sm:min-h-[80px] md:min-h-[100px] border p-1 sm:p-2 relative cursor-pointer transition-colors
        ${hasClasses ? "bg-gray-100" : "hover:bg-gray-50"}
        ${isSelected ? "ring-2 ring-blue-500 z-10" : ""}`}
          onClick={() => {
            if (hasClasses) {
              setShowErrorDialog(true);
            }
          }}
          onMouseEnter={(e) => handleMouseEnter(day, e)}
          onMouseLeave={handleMouseLeave}
        >
          <span className="absolute top-1 left-1 text-xs sm:text-sm md:text-base font-medium">
            {day}
          </span>
          <div className="mt-6 sm:mt-8 space-y-1">
            {hasClasses && (
              <div
                className={`p-1 rounded-full text-center ${
                  isSelected ? "bg-green-600" : "bg-green-500"
                } hover:bg-green-600 transition-colors`}
              >
                <span className="text-[7.5px] sm:text-xs md:text-sm text-white lg:font-medium block">
                  {classCount > 1 ? `${classCount} Classes` : "1 Class"}
                </span>
              </div>
            )}
            {isAvailable && (
              <div className="p-1 rounded-full text-center bg-blue-500 hover:bg-blue-600 transition-colors">
                <span className="text-[7.5px] sm:text-xs md:text-sm text-white lg:font-medium block">
                  Available
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const getCurrentMonthName = () => {
    return currentDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-2 sm:p-4 md:p-6 overflow-x-hidden w-full min-h-screen bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h1 className="text-lg sm:text-xl font-semibold">Timetable</h1>

          {teacherData && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg shadow-md">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={teacherData.profileImage}
                  alt={teacherData.name}
                />
                <AvatarFallback className="text-black font-medium">
                  {getInitials(teacherData.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{teacherData.name}</p>
                <p className="text-xs text-white">{teacherData.teacherId}</p>
              </div>
            </div>
          )}
        </div>
        <hr className="my-2" />

        {isLoading ? (
          <div className="w-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto relative">
            <div className="min-w-full">
              {/* Calendar Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 mt-3 gap-2">
                <h2 className="text-lg sm:text-xl">{getCurrentMonthName()}</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setCurrentDate(newDate);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setCurrentDate(newDate);
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="h-8 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium bg-gray-200"
                    >
                      {day}
                    </div>
                  )
                )}
                {renderCalendar()}
              </div>

              {/* After the availability slots section */}
              <div className="my-8">
                <h3 className="text-lg sm:text-lg font-medium">
                  Weekly Schedule
                </h3>
                <hr className="my-3" />

                {teacherSchedule.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-center">
                    <p className="text-gray-600">
                      No weekly schedule set for this teacher.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {teacherSchedule.map((slot, index) => (
                      <div
                        key={index}
                        className="p-3 sm:p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="mt-2 text-sm sm:text-base">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                            <p className="font-medium">{slot.day}</p>
                          </span>
                          <p>Start Time: {slot.startTime}</p>
                          <p>End Time: {slot.endTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="my-8">
                <h3 className="text-lg sm:text-lg font-medium">
                  Availability Slots
                </h3>
                <hr className="my-3" />

                {filterUpcomingAvailabilitySlots(filteredAvailabilities)
                  .length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-center">
                    <p className="text-gray-600">No availability slots set.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filterUpcomingAvailabilitySlots(
                      filteredAvailabilities
                    ).map((slot, index) => (
                      <div
                        key={index}
                        className="p-3 sm:p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="mt-2 text-sm sm:text-base">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                            <p className="font-medium">
                              {new Date(slot.date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}{" "}
                              (
                              {new Date(slot.date).toLocaleDateString("en-GB", {
                                weekday: "long",
                              })}
                              )
                            </p>
                          </span>
                          <p>Start Time: {slot.startTime}</p>
                          <p>End Time: {slot.endTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover Popup for Class Details and Availability */}
              {hoverInfo.visible && (
                <div
                  className="fixed z-50 bg-white shadow-lg rounded-lg p-3 border border-gray-200 w-64 sm:w-80 transition-opacity duration-200 ease-in-out"
                  style={{
                    left: `${hoverInfo.position.x}px`,
                    top: `${hoverInfo.position.y}px`,
                    maxHeight: "400px",
                    overflowY: "auto",
                    opacity: hoverInfo.visible ? 1 : 0,
                    pointerEvents: hoverInfo.visible ? "auto" : "none",
                  }}
                  onMouseEnter={() =>
                    setHoverInfo((prev) => ({ ...prev, visible: true }))
                  }
                  onMouseLeave={handleMouseLeave}
                >
                  <h4 className="text-sm font-semibold mb-2">
                    {new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      hoverInfo.day
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </h4>

                  <div className="space-y-3">
                    {/* Show availability slot if exists */}
                    {hoverInfo.availability && (
                      <div className="p-2 border rounded-md bg-blue-50">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Available Slot</span>
                        </div>
                        <div className="text-xs mt-1">
                          <p>Start: {hoverInfo.availability.startTime}</p>
                          <p>End: {hoverInfo.availability.endTime}</p>
                        </div>
                      </div>
                    )}

                    {/* Show classes if they exist */}
                    {hoverInfo.classes.length > 0 && (
                      <>
                        <div className="text-xs font-medium text-gray-500">
                          Scheduled Classes
                        </div>
                        {hoverInfo.classes.map((cls, index) => (
                          <div
                            key={index}
                            className="p-2 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-sm">
                                Batch: {cls.batchId}
                              </span>
                            </div>
                            <div className="text-xs mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-500" />
                                <span>Time: {formatTime(cls)}</span>
                              </div>
                              {cls.duration && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3 text-gray-500" />
                                  <span>Duration: {cls.duration} minutes</span>
                                </div>
                              )}
                              {cls.classLink && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Link className="h-3 w-3 text-blue-500" />
                                  <a
                                    href={
                                      cls.classLink.startsWith("http")
                                        ? cls.classLink
                                        : `https://${cls.classLink}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Join Class
                                  </a>
                                </div>
                              )}
                              {cls.isRecurring && cls.sessionNumber && (
                                <div className="mt-1 text-gray-600">
                                  Session {cls.sessionNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Dialog */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Cannot Mark as Available
              </DialogTitle>
              <DialogDescription>
                You cannot mark this date as available because it either has
                scheduled classes or is already marked as available.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowErrorDialog(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Timetables;
