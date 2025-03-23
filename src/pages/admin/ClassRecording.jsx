import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import { SquarePlus, Trash2, Video, Filter, Calendar } from "lucide-react";
import React, { useEffect, useState } from "react";

const backend_url = import.meta.env.VITE_API_URL;

const ClassRecording = () => {
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    userType: "",
    userId: "",
    classDate: "",
    videoLink: "",
    course: "",
  });
  const [courses, setCourses] = useState([]);
  const [recordingCourses, setRecordingCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");

  const fetchTeachers = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/teacher`
      );
      setTeachers(response.data.users);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/student`
      );
      setStudents(response.data.users);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  const fetchRecordings = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/class-recordings`
      );
      const recordingsData = response.data.recordings || [];
      setRecordings(recordingsData);
      setFilteredRecordings(recordingsData);

      // Extract unique courses from recordings
      const uniqueCourses = [
        ...new Set(
          recordingsData
            .filter((rec) => rec.course && rec.course._id)
            .map((rec) =>
              JSON.stringify({ id: rec.course._id, name: rec.course.name })
            )
        ),
      ];

      setRecordingCourses(uniqueCourses.map((course) => JSON.parse(course)));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch recordings data",
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
    fetchTeachers();
    fetchStudents();
    fetchCourses();
    fetchRecordings();
  }, []);

  // Filter recordings by course
  useEffect(() => {
    if (selectedCourse === "all") {
      setFilteredRecordings(recordings);
    } else {
      setFilteredRecordings(
        recordings.filter(
          (recording) =>
            recording.course && recording.course._id === selectedCourse
        )
      );
    }
  }, [selectedCourse, recordings]);

  const handleCourseFilterChange = (courseId) => {
    setSelectedCourse(courseId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      course: value,
    }));
  };

  const handleUserTypeChange = (userType) => {
    setFormData((prev) => ({
      ...prev,
      userType,
      userId: "", // Reset user selection when type changes
    }));
  };

  const handleUserChange = (userId) => {
    setFormData((prev) => ({
      ...prev,
      userId,
    }));
  };

  const handleSubmit = async () => {
    try {
      const validatedLink = formData.videoLink.startsWith("http")
        ? formData.videoLink
        : `https://${formData.videoLink}`;

      const submissionData = {
        title: formData.title,
        userId: formData.userId,
        userType: formData.userType,
        classDate: formData.classDate,
        videoLink: validatedLink,
        course: formData.course,
      };

      await axiosInstance.post(
        `${backend_url}/admin/actions/class-recording`,
        submissionData
      );

      toast({
        title: "Success",
        description: `${formData.title} recording uploaded`,
        variant: "success",
      });

      setIsModalOpen(false);
      setFormData({
        title: "",
        userType: "",
        userId: "",
        classDate: "",
        videoLink: "",
        course: "",
      });
      fetchRecordings();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Recording upload failed",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (recording) => {
    setRecordingToDelete(recording);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(
        `${backend_url}/admin/actions/class-recording/${recordingToDelete._id}`
      );

      toast({
        title: "Success",
        description: "Recording deleted successfully",
        variant: "success",
      });

      setDeleteDialogOpen(false);
      setRecordingToDelete(null);
      fetchRecordings();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete recording",
        variant: "destructive",
      });
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full h-full min-h-screen bg-gray-50">
        <h1 className="text-xl font-semibold">Upload Class Recording</h1>
        <hr className="my-2" />
        <div className="my-8 w-full">
          <Card className="flex flex-col w-64 shadow-[0_3px_10px_rgb(0,0,0,0.2)] mx-auto">
            <div className="p-6 mx-auto">
              <Video size={70} />
            </div>
            <CardContent className="">
              <Button
                className="w-full bg-primary hover:bg-primary/85"
                onClick={() => setIsModalOpen(true)}
              >
                <SquarePlus className="w-5 h-5" />
                Upload Class Recording
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upload Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Class Recording</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter recording title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">User Type</Label>
                <Select
                  value={formData.userType}
                  onValueChange={handleUserTypeChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.userType && (
                <div className="space-y-2">
                  <Label htmlFor="userId">
                    {formData.userType === "Teacher" ? "Teacher" : "Student"}
                  </Label>
                  <Select
                    value={formData.userId}
                    onValueChange={handleUserChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${formData.userType}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.userType === "Teacher"
                        ? teachers
                        : students
                      ).map((user) => (
                        <SelectItem
                          key={user._id}
                          value={user._id}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                user.profileImage ||
                                (formData.userType === "Teacher"
                                  ? "/assets/teacher-icon.png"
                                  : "/assets/student-icon.png")
                              }
                              alt={user.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.course}
                  onValueChange={handleCourseChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem
                        key={course._id}
                        value={course._id}
                        className="cursor-pointer"
                      >
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classDate">Class Date</Label>
                <Input
                  id="classDate"
                  name="classDate"
                  type="date"
                  value={formData.classDate}
                  onChange={handleInputChange}
                  className="w-fit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoLink">Video Link</Label>
                <Input
                  id="videoLink"
                  name="videoLink"
                  placeholder="Enter video link"
                  value={formData.videoLink}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/85"
                onClick={handleSubmit}
              >
                Upload Recording
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the recording &quot;
                {recordingToDelete?.title}&quot;. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <h1 className="text-lg font-medium">Recently Uploaded Recordings</h1>
        <hr className="my-2" />

        {/* Course Filter Section */}
        <div className="my-4 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={16} className="text-primary" />
            <h2 className="text-sm font-medium">Filter Recordings</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-72">
              <Select
                value={selectedCourse}
                onValueChange={handleCourseFilterChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Courses</SelectItem>
                    {recordingCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {selectedCourse !== "all" && (
              <Button
                variant="ghost"
                className="self-end"
                onClick={() => setSelectedCourse("all")}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </div>

        {filteredRecordings.length === 0 ? (
          <p className="mt-8 text-center text-gray-500">
            {recordings.length === 0
              ? "No Recordings Available"
              : "No recordings match the selected filter"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
            {filteredRecordings.map((r) => (
              <Card key={r._id} className="max-w-sm shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {r.title}
                      </h3>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 font-medium">
                          {r.userType}: {r.userId.name}
                        </p>
                        <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                          <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {r.course?.name || "No Course"}
                          </span>
                        </p>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(r.classDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Recording Button */}
                      <a
                        href={r.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                      </a>
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteClick(r)}
                      >
                        <Trash2 className="text-red-500" size={15} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassRecording;
