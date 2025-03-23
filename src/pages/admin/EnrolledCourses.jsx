import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, Calendar, Plus } from "lucide-react";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const backend_url = import.meta.env.VITE_API_URL;

const EnrolledCourses = () => {
  const location = useLocation();
  const studentData = location.state?.studentData;
  console.log(studentData);
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

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

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/courses`
      );
      const fetchedCourses = response.data.courses;
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch courses",
        variant: "destructive",
      });
    }
  };

  const handleSelectCourse = (courseId) => {
    const course = courses.find((c) => c._id === courseId);
    setSelectedCourse(course);
    setOpen(false);
    setConfirmDialogOpen(true);
  };

  const handleConfirmEnroll = async () => {
    try {
      // Construct the payload with the existing student data and the new course ID
      const payload = {
        studentId: studentData.studentId,
        name: studentData.name,
        email: studentData.email,
        age: studentData.age,
        sex: studentData.sex,
        parentName: studentData.parentName,
        profileImage: studentData.profileImage,
        courseEnrolled: [
          ...studentData.courseEnrolled,
          {
            _id: selectedCourse._id,
            name: selectedCourse.name,
            numberOfSessions: selectedCourse.numberOfSessions,
          },
        ],
      };

      // Make the API call to update the student's profile
      await axiosInstance.put(
        `${backend_url}/admin/actions/student/${studentData._id}`,
        payload
      );

      // Show success toast
      toast({
        title: "Enrollment Successful",
        description: `${studentData.name} has been enrolled in ${selectedCourse.name}`,
        variant: "success",
      });

      // Update the local state to reflect the new enrollment
      const updatedStudentData = {
        ...studentData,
        courseEnrolled: [
          ...studentData.courseEnrolled,
          {
            _id: selectedCourse._id,
            name: selectedCourse.name,
            numberOfSessions: selectedCourse.numberOfSessions,
          },
        ],
      };

      // Optionally, you can update the studentData in the location state or refetch the data
      // For simplicity, we'll just update the local state
      location.state.studentData = updatedStudentData;
    } catch (error) {
      // Show error toast
      toast({
        title: "Enrollment Failed",
        description:
          error.response?.data?.message || "Failed to enroll in course",
        variant: "destructive",
      });
    } finally {
      // Close the confirmation dialog and reset the selected course
      setConfirmDialogOpen(false);
      setSelectedCourse(null);
    }
  };

  // Filter out courses that the student is already enrolled in
  const getAvailableCourses = () => {
    if (!studentData || !studentData.courseEnrolled) return courses;

    const enrolledCourseIds = studentData.courseEnrolled.map(
      (course) => course._id
    );
    return courses.filter((course) => !enrolledCourseIds.includes(course._id));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-2 sm:p-4 md:p-6 overflow-x-hidden w-full min-h-screen bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h1 className="text-lg sm:text-xl font-semibold">Enrolled Courses</h1>

          {studentData && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg shadow-md">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={studentData.profileImage}
                  alt={studentData.name}
                />
                <AvatarFallback className="text-black font-medium">
                  {getInitials(studentData.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{studentData.name}</p>
                <p className="text-xs text-white">{studentData.studentId}</p>
              </div>
            </div>
          )}
        </div>

        <hr className="my-4" />

        {!studentData ? (
          <div className="bg-red-50 p-4 rounded-md text-red-600">
            Student data not available. Please go back to the user list.
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md font-medium">Current Enrollments</h2>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Enroll in Other Course
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-64" align="end">
                  <Command>
                    <CommandInput placeholder="Search courses..." />
                    <CommandList>
                      <CommandEmpty>No courses found</CommandEmpty>
                      <CommandGroup heading="Available Courses">
                        {getAvailableCourses().map((course) => (
                          <CommandItem
                            key={course._id}
                            onSelect={() => handleSelectCourse(course._id)}
                            className="cursor-pointer"
                          >
                            <Book className="mr-2 h-4 w-4 text-emerald-600" />
                            <span>{course.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {!studentData.courseEnrolled ||
            studentData.courseEnrolled.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-md text-yellow-800 text-center">
                <p>No courses enrolled yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {studentData.courseEnrolled.map((course) => (
                  <Card
                    key={course._id}
                    className="overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <CardHeader className="bg-emerald-100 p-4">
                      <CardTitle className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Book size={18} className="text-emerald-700" />
                          <span className="text-lg font-medium text-emerald-900">
                            {course.name}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700 font-semibold">
                          {course.numberOfSessions}{" "}
                          {course.numberOfSessions === 1
                            ? "Session"
                            : "Sessions"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Confirmation Dialog */}
            <AlertDialog
              open={confirmDialogOpen}
              onOpenChange={setConfirmDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Enrollment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to enroll {studentData?.name} in{" "}
                    <span className="font-medium text-emerald-600">
                      {selectedCourse?.name}
                    </span>
                    ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmEnroll}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Confirm Enrollment
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
};

export default EnrolledCourses;
