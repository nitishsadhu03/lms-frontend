import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle2, Clock, Link } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";

const backend_url = import.meta.env.VITE_API_URL;

const TeacherTimetable = () => {
  const teacherProfile = useSelector((state) => state.userAuth.profile);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showMarkFreeModal, setShowMarkFreeModal] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [availabilityList, setAvailabilityList] = useState([]);
  const [hoverInfo, setHoverInfo] = useState({
    visible: false,
    classes: [],
    availability: null,
    day: null,
    position: { x: 0, y: 0 },
  });
  const [availabilityData, setAvailabilityData] = useState({
    startTime: "09:00",
    endTime: "17:00",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState([
    { day: "Sunday", startTime: "09:00", endTime: "17:00" },
    { day: "Monday", startTime: "09:00", endTime: "17:00" },
    { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
    { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
    { day: "Thursday", startTime: "09:00", endTime: "17:00" },
    { day: "Friday", startTime: "09:00", endTime: "17:00" },
    { day: "Saturday", startTime: "09:00", endTime: "17:00" },
  ]);
  const [fetchedSchedule, setFetchedSchedule] = useState(null);

  const popupTimeoutRef = useRef(null);
  const popupRef = useRef(null);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/teacher/classes`
      );

      // console.log("API Response:", response.data); // Debugging: Log the API response

      // if (
      //   !response.data ||
      //   !response.data.classes ||
      //   response.data.classes.length === 0
      // ) {
      //   throw new Error("No classes found in the response");
      // }

      // Access the `classes` array from the response
      const classesData = response.data.classes;

      // Format the classes data to match the new structure
      const formattedClasses = classesData
        .map((cls) => {
          if (cls.isRecurring) {
            // For recurring classes, use the sessions array
            return cls.sessions.map((session) => ({
              ...session,
              batchId: cls.batchId,
              classLink: cls.classLink,
              isRecurring: true,
              students: cls.studentIds,
            }));
          } else {
            // For single classes, use the startDateTime and endDateTime
            return {
              ...cls,
              startDateTime: cls.startDateTime || cls.startDate,
              endDateTime: cls.endDateTime || cls.endDate,
              students: cls.studentIds,
            };
          }
        })
        .flat(); // Flatten the array to handle recurring sessions

      setClasses(formattedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error); // Debugging: Log the error
      toast({
        title: "Error",
        description: "Failed to fetch class data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate sessions from a recurring class pattern
  const generateSessionsFromPattern = (cls) => {
    if (!cls.recurrencePattern || !cls.recurrencePattern.startDate) {
      return [cls]; // Return the class as is if no pattern is defined
    }

    const startDate = new Date(cls.recurrencePattern.startDate);
    const repeatDays = cls.recurrencePattern.repeatDays || [];
    const totalSessions = cls.totalSessions || 1;

    // Convert days to numbers (0 = Sunday, 1 = Monday, etc.)
    const dayToNumber = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    // Convert repeat days to numbers and sort them
    const repeatDayNumbers = repeatDays
      .map((day) => dayToNumber[day])
      .sort((a, b) => a - b);

    const sessions = [];
    let currentDate = new Date(startDate);
    let sessionsScheduled = 0;

    // Generate sessions until we reach the total count
    while (sessionsScheduled < totalSessions) {
      const currentDay = currentDate.getDay();

      // Check if current day is in repeat days
      if (repeatDayNumbers.includes(currentDay)) {
        // Create a session for this date
        const sessionTime = new Date(currentDate);

        // If the class has a specific time, set it
        if (cls.scheduledTime) {
          const timeComponents = cls.scheduledTime.split(":");
          sessionTime.setHours(parseInt(timeComponents[0], 10));
          sessionTime.setMinutes(parseInt(timeComponents[1], 10));
        }

        sessions.push({
          ...cls,
          startTime: sessionTime.toISOString(),
          sessionNumber: sessionsScheduled + 1,
        });

        sessionsScheduled++;
      }

      // Move to next day
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    return sessions;
  };

  const fetchAvailability = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/api/teacher/availability/${teacherProfile._id}`
      );
      setAvailabilityList(response.data.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch availability data",
        variant: "destructive",
      });
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/api/teacher/my-schedule`
      );

      // Check if response.data.data exists and has a schedule property
      if (response.data.data && response.data.data.schedule) {
        setFetchedSchedule(response.data.data);
      } else {
        setFetchedSchedule(null); // Set to null if there's no schedule
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch schedule data",
        variant: "destructive",
      });
      setFetchedSchedule(null);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAvailability();
    fetchSchedule();
  }, []);

  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setHoverInfo((prev) => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getClassesForDate = (day) => {
    return classes.filter((cls) => {
      const classDate = new Date(cls.startDateTime);
      return (
        classDate.getFullYear() === currentDate.getFullYear() &&
        classDate.getMonth() === currentDate.getMonth() &&
        classDate.getDate() === day
      );
    });
  };

  // Helper function to check if a date is available (previously "free")
  const getAvailabilityForDate = (day) => {
    // Create a date string in the format of the availability data
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");

    // Create a date object for comparison (beginning of the day)
    const dateToCheck = new Date(`${year}-${month}-${dayStr}T00:00:00.000Z`);

    // Find any availability entry for this date
    return availabilityList.find((avail) => {
      const availDate = new Date(avail.date);
      return (
        availDate.getFullYear() === dateToCheck.getFullYear() &&
        availDate.getMonth() === dateToCheck.getMonth() &&
        availDate.getDate() === dateToCheck.getDate()
      );
    });
  };

  // Filter classes for the current selected month
  const getClassesForCurrentMonth = () => {
    return classes.filter((cls) => {
      const classDate = new Date(cls.startTime);
      return (
        classDate.getFullYear() === currentDate.getFullYear() &&
        classDate.getMonth() === currentDate.getMonth()
      );
    });
  };

  const hasClassesOnDate = (day) => {
    return getClassesForDate(day).length > 0;
  };

  const isDateAvailable = (day) => {
    return getAvailabilityForDate(day) !== undefined;
  };

  const handleDateClick = (day) => {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const dateStr = `${year}-${month}-${dayStr}`;

    // Check if the date is already marked as available
    const isAlreadyAvailable = availabilityList.some((avail) => {
      const availDate = new Date(avail.date);
      return (
        availDate.getFullYear() === year &&
        availDate.getMonth() + 1 === parseInt(month) &&
        availDate.getDate() === day
      );
    });

    if (isAlreadyAvailable) {
      // Show a dialog box for already available dates
      setShowErrorDialog(true);
      return;
    }

    if (hasClassesOnDate(day)) {
      setShowErrorDialog(true);
      return;
    }

    setSelectedDate(dateStr);
    setShowMarkFreeModal(true);
  };

  const handleInputChange = (field, value) => {
    setAvailabilityData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const markDateAsFree = async () => {
    if (availabilityData.date) {
      setIsSubmitting(true);
      try {
        const payload = {
          date: availabilityData.date,
          startTime: availabilityData.startTime,
          endTime: availabilityData.endTime,
        };

        // Make API call
        await axiosInstance.post(
          `${backend_url}/api/teacher/availability`,
          payload
        );

        // Refresh availability data
        await fetchAvailability();

        setShowMarkFreeModal(false);
        setShowSuccessDialog(true);

        toast({
          title: "Success",
          description: "Availability slot has been successfully set",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Error",
          description:
            "Failed to set availability slot: " +
            (error.response?.data?.message || error.message),
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
        fetchAvailability();
      }
    }
  };

  // Handle day selection for scheduling
  const handleScheduleChange = (day, checked) => {
    setScheduleData((prev) => ({
      ...prev,
      days: checked
        ? [...prev.days, day] // Add day if checked
        : prev.days.filter((d) => d !== day), // Remove day if unchecked
    }));
  };

  // Handle time change for a specific day
  const handleScheduleTimeChange = (day, field, value) => {
    setScheduleData((prev) =>
      prev.map((schedule) =>
        schedule.day === day ? { ...schedule, [field]: value } : schedule
      )
    );
  };

  // Handle day selection (enable/disable a day)
  const handleDayToggle = (day, checked) => {
    setScheduleData((prev) =>
      prev.map((schedule) =>
        schedule.day === day ? { ...schedule, enabled: checked } : schedule
      )
    );
  };

  // Submit schedule to the backend
  const submitSchedule = async () => {
    const enabledSchedules = scheduleData.filter(
      (schedule) => schedule.enabled
    );

    if (enabledSchedules.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one day",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        teacherId: teacherProfile._id,
        schedule: enabledSchedules.map((schedule) => ({
          day: schedule.day,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        })),
      };

      await axiosInstance.post(
        `${backend_url}/api/teacher/weekly-schedule`,
        payload
      );

      toast({
        title: "Success",
        description: "Schedule has been successfully set",
        variant: "success",
      });
      setShowScheduleModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to set schedule: " +
          (error.response?.data?.message || error.message),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      fetchSchedule();
    }
  };

  const formatTime = (cls) => {
    if (!cls.startDateTime) return "N/A";
    const date = new Date(cls.startDateTime);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

    if (classes.length > 0) {
      // Clear any existing timeout
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }

      // Calculate the position for the popup
      const rect = event.currentTarget.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const popupHeight = 300; // Adjusted height for classes content

      // If cell is in the right portion of the screen, show popup to the left
      const leftOffset = rect.left + window.scrollX;
      const xPos =
        leftOffset + 300 > viewportWidth
          ? Math.max(0, leftOffset - 280)
          : leftOffset;

      // Position the popup above the cell instead of below
      const yPos = rect.top + window.scrollY - popupHeight;

      // Set a small delay before showing the popup to avoid flickering
      popupTimeoutRef.current = setTimeout(() => {
        setHoverInfo({
          visible: true,
          classes: classes,
          availability: null, // Always set availability to null
          day: day,
          position: {
            x: xPos,
            y: Math.max(0, yPos), // Ensure popup doesn't go above viewport
          },
        });
      }, 200);
    }
  };

  const handleMouseLeave = () => {
    // Clear any existing timeout
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }

    // Set a small delay before hiding the popup to improve user experience
    popupTimeoutRef.current = setTimeout(() => {
      setHoverInfo((prev) => ({ ...prev, visible: false }));
    }, 300);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-[60px] sm:min-h-[80px] md:min-h-[100px] border bg-white"
        ></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayClasses = getClassesForDate(day);
      const hasClasses = dayClasses.length > 0;
      const classCount = dayClasses.length;

      days.push(
        <div
          key={day}
          className={`min-h-[60px] sm:min-h-[80px] md:min-h-[100px] border p-1 sm:p-2 relative cursor-pointer transition-colors
            ${hasClasses ? "bg-gray-100" : "hover:bg-gray-50"}`}
          onClick={() => handleDateClick(day)}
          onMouseEnter={(e) => handleMouseEnter(day, e)}
          onMouseLeave={handleMouseLeave}
        >
          <span className="absolute top-1 left-1 text-xs sm:text-sm md:text-base font-medium">
            {day}
          </span>
          <div className="mt-6 sm:mt-8 space-y-1">
            {hasClasses && (
              <div
                className={`p-1 rounded-full text-center bg-green-500 hover:bg-green-600 transition-colors`}
              >
                <span className="text-[7.5px] sm:text-xs md:text-sm text-white lg:font-medium block">
                  {classCount > 1 ? `${classCount} Classes` : "1 Class"}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  // Group classes by date for the class schedule display
  const getGroupedClasses = () => {
    const grouped = {};
    const currentMonthClasses = classes.filter((cls) => {
      const classDate = new Date(cls.startDateTime);
      return (
        classDate.getFullYear() === currentDate.getFullYear() &&
        classDate.getMonth() === currentDate.getMonth()
      );
    });

    currentMonthClasses.forEach((cls) => {
      const date = new Date(cls.startDateTime);
      const dateStr = date.toLocaleDateString();

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }

      grouped[dateStr].push(cls);
    });

    return grouped;
  };

  // Format month name for display
  const getCurrentMonthName = () => {
    return currentDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  // Generate time options for dropdown
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of ["00", "30"]) {
        const time = `${hour.toString().padStart(2, "0")}:${minute}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="flex">
      <TeacherSidebar />
      <div className="p-2 sm:p-4 md:p-6 overflow-x-hidden w-full min-h-screen bg-gray-50">
        <div className="flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-semibold">Timetable</h1>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="text-xs sm:text-sm"
              onClick={() => setShowMarkFreeModal(true)}
            >
              Set Slot
            </Button>
            <Button
              variant="default"
              size="sm"
              className="text-xs sm:text-sm"
              onClick={() => setShowScheduleModal(true)}
            >
              Set Schedule
            </Button>
          </div>
        </div>
        <hr className="mt-4 mb-2" />

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
                  {/* <Button
                    variant="default"
                    size="sm"
                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                    onClick={() => setShowMarkFreeModal(true)} // Open the dialog
                  >
                    Set Slot
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    Schedule
                  </Button> */}
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

              <div className="my-8">
                {/* Display Fetched Schedule */}
                {fetchedSchedule && fetchedSchedule.schedule ? (
                  <>
                    <h3 className="text-lg sm:text-lg font-medium">
                      Weekly Schedule
                    </h3>
                    <hr className="mt-2 mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {fetchedSchedule.schedule.map((slot, index) => (
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
                  </>
                ) : (
                  <>
                    <h3 className="text-lg sm:text-lg font-medium">
                      Weekly Schedule
                    </h3>
                    <hr className="mt-2 mb-4" />
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-center">
                      <p className="text-gray-600">No weekly schedule set.</p>
                    </div>
                  </>
                )}

                {/* Availability Slots Section */}
                <h3 className="text-lg sm:text-lg font-medium mt-8">
                  Availability Slots
                </h3>
                <hr className="mt-2 mb-4" />
                {availabilityList.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-center">
                    <p className="text-gray-600">No availability slots set.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {availabilityList.map((slot, index) => (
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
                  ref={popupRef}
                  className="fixed z-50 bg-white shadow-lg rounded-lg p-3 border border-gray-200 w-64 sm:w-80 transition-opacity duration-200 ease-in-out"
                  style={{
                    left: `${hoverInfo.position.x}px`,
                    top: `${hoverInfo.position.y}px`,
                    maxHeight: "300px",
                    overflowY: "auto",
                    opacity: hoverInfo.visible ? 1 : 0,
                    pointerEvents: hoverInfo.visible ? "auto" : "none",
                  }}
                  onMouseEnter={() => {
                    if (popupTimeoutRef.current) {
                      clearTimeout(popupTimeoutRef.current);
                    }
                  }}
                  onMouseLeave={handleMouseLeave}
                >
                  <h4 className="text-sm font-semibold mb-2">
                    {hoverInfo.classes.length > 0 &&
                      `Classes on ${formatDate(
                        hoverInfo.classes[0]?.startTime
                      )}`}
                  </h4>
                  <div className="space-y-3">
                    {/* Display classes information */}
                    {hoverInfo.visible && (
                      <div
                        ref={popupRef}
                        className="fixed z-50 bg-white shadow-lg rounded-lg p-3 border border-gray-200 w-64 sm:w-80 transition-opacity duration-200 ease-in-out"
                        style={{
                          left: `${hoverInfo.position.x}px`,
                          top: `${hoverInfo.position.y}px`,
                          maxHeight: "300px",
                          overflowY: "auto",
                          opacity: hoverInfo.visible ? 1 : 0,
                          pointerEvents: hoverInfo.visible ? "auto" : "none",
                        }}
                        onMouseEnter={() => {
                          if (popupTimeoutRef.current) {
                            clearTimeout(popupTimeoutRef.current);
                          }
                        }}
                        onMouseLeave={handleMouseLeave}
                      >
                        <h4 className="text-sm font-semibold mb-2">
                          {hoverInfo.classes.length > 0 &&
                            `Classes on ${formatDate(
                              hoverInfo.classes[0]?.startDateTime // Use startDateTime instead of startTime
                            )}`}
                        </h4>
                        <div className="space-y-3">
                          {/* Display classes information */}
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
                                    <span>
                                      Duration: {cls.duration} minutes
                                    </span>
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
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Class Schedule - Now filtered for current month only */}
        {/* <div className="my-8">
          <h3 className="text-lg sm:text-lg font-medium">
            {getCurrentMonthName()} Class Schedule
          </h3>
          <hr className="my-2" />

          {isLoading ? (
            <div className="w-full flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : Object.keys(getGroupedClasses()).length > 0 ? (
            Object.entries(getGroupedClasses()).map(([dateStr, classes]) => (
              <div key={dateStr} className="mb-6">
                <h4 className="text-md font-medium mb-2">{dateStr}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((cls, index) => (
                    <div
                      key={`${cls._id || cls.batchId}-${index}`}
                      className="p-3 sm:p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        <span className="font-medium text-sm sm:text-base">
                          Batch: {cls.batchId}
                        </span>
                      </div>
                      <div className="mt-2 text-sm sm:text-base">
                        <p>Time: {formatTime(cls)}</p>
                        {cls.duration && (
                          <p>Duration: {cls.duration} minutes</p>
                        )}
                        {cls.isRecurring && cls.sessionNumber && (
                          <p>Session: {cls.sessionNumber}</p>
                        )}
                        {cls.students && cls.students.length > 0 && (
                          <p>Student: {cls.students[0].name}</p>
                        )}
                        {cls.classLink && (
                          <div className="flex items-center gap-1 mt-1">
                            <Link className="h-4 w-4 text-blue-500" />
                            <a
                              href={cls.classLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Join Class
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-center">
              <p className="text-gray-600">
                No classes scheduled for {getCurrentMonthName()}
              </p>
            </div>
          )}
        </div> */}

        {/* Updated Mark Free Dialog */}
        <Dialog open={showMarkFreeModal} onOpenChange={setShowMarkFreeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Availability Slot</DialogTitle>
              <DialogDescription>
                Enter the date, start time, and end time for your availability.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <input
                  type="date"
                  id="date"
                  value={availabilityData.date || ""}
                  onChange={(e) =>
                    setAvailabilityData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Select
                  value={availabilityData.startTime}
                  onValueChange={(value) =>
                    handleInputChange("startTime", value)
                  }
                >
                  <SelectTrigger id="startTime">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Select
                  value={availabilityData.endTime}
                  onValueChange={(value) => handleInputChange("endTime", value)}
                >
                  <SelectTrigger id="endTime">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`end-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Validation Error */}
              {availabilityData.startTime >= availabilityData.endTime && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    End time must be after start time
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowMarkFreeModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={markDateAsFree}
                disabled={
                  isSubmitting ||
                  availabilityData.startTime >= availabilityData.endTime ||
                  !availabilityData.date
                }
              >
                {isSubmitting ? "Submitting..." : "Set Slot"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                {hasClassesOnDate(hoverInfo.day)
                  ? "Cannot Mark as Available"
                  : "Date Already Available"}
              </DialogTitle>
              <DialogDescription>
                {hasClassesOnDate(hoverInfo.day)
                  ? "You cannot mark this date as available because you have scheduled classes on this date."
                  : "This date is already marked as available."}
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

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Success
              </DialogTitle>
              <DialogDescription>
                Date has been marked as available from{" "}
                {availabilityData.startTime} to {availabilityData.endTime}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowSuccessDialog(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Set Weekly Schedule</DialogTitle>
              <DialogDescription>
                Select the days of the week and set their respective start and
                end times.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {scheduleData.map((schedule) => (
                <div key={schedule.day} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={schedule.day}
                      checked={schedule.enabled || false}
                      onChange={(e) =>
                        handleDayToggle(schedule.day, e.target.checked)
                      }
                    />
                    <Label htmlFor={schedule.day}>{schedule.day}</Label>
                  </div>

                  {schedule.enabled && (
                    <div className="grid grid-cols-2 gap-2">
                      {/* Start Time */}
                      <div className="space-y-1">
                        <Label htmlFor={`startTime-${schedule.day}`}>
                          Start Time
                        </Label>
                        <Select
                          value={schedule.startTime}
                          onValueChange={(value) =>
                            handleScheduleTimeChange(
                              schedule.day,
                              "startTime",
                              value
                            )
                          }
                        >
                          <SelectTrigger id={`startTime-${schedule.day}`}>
                            <SelectValue placeholder="Select start time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={`start-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* End Time */}
                      <div className="space-y-1">
                        <Label htmlFor={`endTime-${schedule.day}`}>
                          End Time
                        </Label>
                        <Select
                          value={schedule.endTime}
                          onValueChange={(value) =>
                            handleScheduleTimeChange(
                              schedule.day,
                              "endTime",
                              value
                            )
                          }
                        >
                          <SelectTrigger id={`endTime-${schedule.day}`}>
                            <SelectValue placeholder="Select end time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={`end-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Validation Error */}
                  {schedule.enabled &&
                    schedule.startTime >= schedule.endTime && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          End time must be after start time
                        </AlertDescription>
                      </Alert>
                    )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitSchedule}
                disabled={
                  isSubmitting ||
                  scheduleData.some(
                    (schedule) =>
                      schedule.enabled && schedule.startTime >= schedule.endTime
                  )
                }
              >
                {isSubmitting ? "Submitting..." : "Set Schedule"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeacherTimetable;
