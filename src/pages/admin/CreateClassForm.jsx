import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import { Calendar, Clock, SquarePlus } from "lucide-react";
import { useSelector } from "react-redux";
import AdminSidebar from "@/components/admin/AdminSidebar";

const backend_url = import.meta.env.VITE_API_URL;

const DAYS_OF_WEEK = [
  { value: "Monday", label: "M" },
  { value: "Tuesday", label: "T" },
  { value: "Wednesday", label: "W" },
  { value: "Thursday", label: "T" },
  { value: "Friday", label: "F" },
  { value: "Saturday", label: "S" },
  { value: "Sunday", label: "S" },
];

const CreateClassForm = () => {
  const adminProfile = useSelector((state) => state.adminAuth.profile);
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]); // State for courses
  const [formData, setFormData] = useState({
    batchId: "",
    classLink: "",
    teacherId: "",
    studentIds: [],
    isRecurring: false,
    startDate: "",
    startDateTime: "",
    endDateTime: "",
    repeatType: "weekly",
    repeatDays: [], // Array of objects: { day: "Monday", startTime: "14:00", endTime: "15:00" }
    numberOfSessions: 1,
    courseId: "", // Added courseId to formData
  });

  // Fetch teachers, students, and courses
  const fetchUsers = async () => {
    try {
      const [teachersResponse, studentsResponse] = await Promise.all([
        axiosInstance.get(`${backend_url}/profile/teacher`),
        axiosInstance.get(`${backend_url}/profile/student`),
      ]);
      setTeachers(teachersResponse.data.users);
      setStudents(studentsResponse.data.users);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    }
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

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeacherChange = (teacherId) => {
    setFormData((prev) => ({
      ...prev,
      teacherId,
    }));
  };

  const handleStudentChange = (studentId) => {
    setFormData((prev) => ({
      ...prev,
      studentIds: [studentId],
    }));
  };

  const handleCourseChange = (courseId) => {
    const selectedCourse = courses.find((course) => course._id === courseId);
    if (selectedCourse) {
      setFormData((prev) => ({
        ...prev,
        courseId,
        numberOfSessions: selectedCourse.numberOfSessions, // Set numberOfSessions from the selected course
      }));
    }
  };

  const handleRecurrenceToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isRecurring: checked,
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const existingDay = prev.repeatDays.find((d) => d.day === day);
      if (existingDay) {
        // Remove the day if it already exists
        return {
          ...prev,
          repeatDays: prev.repeatDays.filter((d) => d.day !== day),
        };
      } else {
        // Add the day with default start and end times
        return {
          ...prev,
          repeatDays: [
            ...prev.repeatDays,
            { day, startTime: "09:00", endTime: "10:00" },
          ],
        };
      }
    });
  };

  const handleTimeChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      repeatDays: prev.repeatDays.map((d) =>
        d.day === day ? { ...d, [field]: value } : d
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        batchId: formData.batchId,
        classLink: formData.classLink,
        teacherId: formData.teacherId,
        studentIds: formData.studentIds,
        isRecurring: formData.isRecurring,
        adminId: adminProfile._id, // Replace with the actual admin ID
      };

      if (formData.isRecurring) {
        // Convert IST to UTC for startDate
        const startDateIST = new Date(formData.startDate);
        const startDateUTC = new Date(
          startDateIST.getTime() - 5.5 * 60 * 60 * 1000
        ); // IST is UTC+5:30
        payload.startDate = startDateUTC.toISOString().split("T")[0];

        payload.repeatType = formData.repeatType;
        payload.numberOfSessions = formData.numberOfSessions;
        payload.courseId = formData.courseId;

        // Convert IST to UTC for repeatDays
        payload.repeatDays = formData.repeatDays.map((dayData) => {
          const startTimeIST = new Date(`1970-01-01T${dayData.startTime}:00Z`);
          const endTimeIST = new Date(`1970-01-01T${dayData.endTime}:00Z`);

          const startTimeUTC = new Date(
            startTimeIST.getTime() - 5.5 * 60 * 60 * 1000
          );
          const endTimeUTC = new Date(
            endTimeIST.getTime() - 5.5 * 60 * 60 * 1000
          );

          return {
            day: dayData.day,
            startTime: startTimeUTC.toISOString().split("T")[1].substring(0, 5),
            endTime: endTimeUTC.toISOString().split("T")[1].substring(0, 5),
          };
        });
      } else {
        payload.startDateTime = formData.startDateTime;
        payload.endDateTime = formData.endDateTime;
      }

      const response = await axiosInstance.post(
        `${backend_url}/admin/actions/create-class`,
        payload
      );

      toast({
        title: "Success",
        description: "Class created successfully",
        variant: "success",
      });

      navigate("/fcc_admin/create-class"); // Redirect to the classes list page
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Class creation failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full h-full bg-gray-50">
        <h1 className="text-xl font-semibold">Create Class</h1>
        <hr className="my-2" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batchId">Batch ID</Label>
            <Input
              id="batchId"
              name="batchId"
              value={formData.batchId}
              onChange={handleInputChange}
              placeholder="Enter batch ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classLink">Class Link</Label>
            <Input
              id="classLink"
              name="classLink"
              value={formData.classLink}
              onChange={handleInputChange}
              placeholder="Enter class link"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher</Label>
            <Select
              value={formData.teacherId}
              onValueChange={handleTeacherChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select
              value={formData.studentIds[0]}
              onValueChange={handleStudentChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student._id} value={student._id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="recurring">Recurring Class</Label>
            <Switch
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={handleRecurrenceToggle}
            />
          </div>

          {formData.isRecurring ? (
            <div className="space-y-4">
              {/* Course Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={handleCourseChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.name} ({course.numberOfSessions} sessions)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Repeat on</Label>
                <div className="flex gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day.value}
                      className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                        formData.repeatDays.some((d) => d.day === day.value)
                          ? "bg-primary text-white"
                          : "bg-gray-100"
                      }`}
                      onClick={() => handleDayToggle(day.value)}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
              </div>

              {formData.repeatDays.map((dayData) => (
                <div key={dayData.day} className="space-y-2">
                  <Label>{dayData.day}</Label>
                  <div className="flex gap-4">
                    <Input
                      type="time"
                      value={dayData.startTime}
                      onChange={(e) =>
                        handleTimeChange(
                          dayData.day,
                          "startTime",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      type="time"
                      value={dayData.endTime}
                      onChange={(e) =>
                        handleTimeChange(dayData.day, "endTime", e.target.value)
                      }
                    />
                    <span className="font-medium text-sm flex items-center">
                      IST
                    </span>
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <Label>Number of Sessions</Label>
                <Input
                  type="number"
                  value={formData.numberOfSessions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      numberOfSessions: parseInt(e.target.value),
                    }))
                  }
                  disabled // Disable input as it's populated from the course
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDateTime: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.endDateTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDateTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}

          <Button
            className="w-full bg-primary hover:bg-primary/85"
            onClick={handleSubmit}
          >
            Create Class
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateClassForm;
