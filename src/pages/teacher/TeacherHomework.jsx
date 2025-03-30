import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, MoreVertical, BookOpen, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";

const backend_url = import.meta.env.VITE_API_URL;

const TeacherHomework = () => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [homeworks, setHomeworks] = useState([]);
  const [filteredHomeworks, setFilteredHomeworks] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [courses, setCourses] = useState([]);
  const [types, setTypes] = useState([]);
  const [classes, setClasses] = useState([]);

  const getUniqueStudentsFromClasses = (classes) => {
    const uniqueStudents = new Map();

    classes.forEach((classItem) => {
      classItem.studentIds?.forEach((student) => {
        if (!uniqueStudents.has(student._id)) {
          uniqueStudents.set(student._id, student);
        }
      });
    });

    return Array.from(uniqueStudents.values());
  };

  const handleAssignClick = (homework) => {
    setSelectedHomework(homework);
    setIsAssignModalOpen(true);
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Send the correct fields to the backend
      await axiosInstance.post(
        `${backend_url}/teacher/actions/assign-homework`,
        {
          homeworkId: selectedHomework._id, // Send the homework ID
          studentIds: [selectedStudent], // Send the student ID as an array
        }
      );

      // Show success message
      toast({
        title: "Success",
        description: "Assignment assigned successfully",
        variant: "success",
      });

      // Close the modal and reset the selection
      setIsAssignModalOpen(false);
      setSelectedStudent("");
    } catch (error) {
      console.error("Error assigning homework:", error);
      // Show error message
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to assign assignment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHomeworks = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/all-homework`
      );
      const homeworkData = response.data.data || [];
      setHomeworks(homeworkData);
      setFilteredHomeworks(homeworkData);

      // Extract unique courses from homeworks
      const uniqueCourses = [
        ...new Set(
          homeworkData
            .filter((hw) => hw.course && hw.course._id)
            .map((hw) =>
              JSON.stringify({ id: hw.course._id, name: hw.course.name })
            )
        ),
      ];

      setCourses(uniqueCourses.map((course) => JSON.parse(course)));

      // Extract unique types from homeworks
      const uniqueTypes = [...new Set(homeworkData.map((hw) => hw.type))];
      setTypes(uniqueTypes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments data",
        variant: "destructive",
      });
    }
  };

  // const fetchStudents = async () => {
  //   try {
  //     const students = await axiosInstance.get(
  //       `${backend_url}/profile/student`
  //     );
  //     setStudents(students.data.users || []);
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch student data",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/teacher/classes`
      );
      setClasses(response.data.classes);
      const studentsFromClasses = getUniqueStudentsFromClasses(
        response.data.classes
      );
      setStudents(studentsFromClasses);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch class data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchHomeworks();
    // fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    // Filter homeworks based on selected course and type
    let filtered = homeworks;

    // Apply course filter
    if (selectedCourse !== "all") {
      filtered = filtered.filter(
        (homework) => homework.course && homework.course._id === selectedCourse
      );
    }

    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((homework) => homework.type === selectedType);
    }

    setFilteredHomeworks(filtered);
  }, [selectedCourse, selectedType, homeworks]);

  const clearFilters = () => {
    setSelectedCourse("all");
    setSelectedType("all");
  };

  return (
    <div className="flex">
      <TeacherSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full min-h-screen bg-gray-50">
        <h1 className="text-xl font-semibold">Assignment</h1>
        <hr className="my-2" />

        {/* Filter Section */}
        <div className="my-4 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={16} className="text-primary" />
            <h2 className="text-sm font-medium">Filter Assignment</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-72">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-72">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {(selectedCourse !== "all" || selectedType !== "all") && (
              <Button
                variant="ghost"
                className="self-end"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {filteredHomeworks.length === 0 ? (
          <p className="mt-8 text-center text-gray-500">
            {homeworks.length === 0
              ? "No Assignment Available"
              : "No assignment matches the selected filters"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
            {filteredHomeworks.map((h) => (
              <Card
                key={h._id}
                className="max-w-sm hover:shadow-xl transition-shadow duration-300 shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {h.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <BookOpen className="mr-1" size={14} />
                          <span>{h.course?.name || "No Course"}</span>
                          <span className="mx-1">•</span>
                          <span>{h.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={h.homeworkLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Eye className="text-primary" size={20} />
                        </a>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreVertical
                                className="text-gray-600 hover:text-primary"
                                size={20}
                              />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-1">
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => handleAssignClick(h)}
                            >
                              Assign Student
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 font-medium">
                        {h.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Assignment to Student</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {selectedHomework && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <h3 className="font-medium">{selectedHomework.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedHomework.description}
                  </p>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <BookOpen className="mr-1" size={14} />
                    <span>{selectedHomework.course?.name || "No Course"}</span>
                    <span className="mx-1">•</span>
                    <span>{selectedHomework.type}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="studentSelect">Select Student</Label>
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Students</SelectLabel>
                      {students.length === 0 ? (
                        <SelectItem value="no-students" disabled>
                          No students available in your classes
                        </SelectItem>
                      ) : (
                        students.map((student) => (
                          <SelectItem
                            key={student._id}
                            value={student._id}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  student.profileImage ||
                                  "/assets/student-icon.png"
                                }
                                alt={student.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span>{student.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignStudent}
                  disabled={!selectedStudent || isLoading}
                >
                  {isLoading ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeacherHomework;
