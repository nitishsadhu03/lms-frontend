import StudentSidebar from "@/components/student/StudentSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { BookOpen, Eye, Filter } from "lucide-react";
import React, { useEffect, useState } from "react";

const backend_url = import.meta.env.VITE_API_URL;

const StudentHomework = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [courses, setCourses] = useState([]);
  const [types, setTypes] = useState([]);
  const [filteredHomeworks, setFilteredHomeworks] = useState([]);

  const fetchHomeworks = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/homework`
      );
      console.log("homeworks: ", response.data.homework);
      const homeworkData = response.data.homework || [];
      setHomeworks(homeworkData);
      setFilteredHomeworks(homeworkData);

      // Extract unique courses
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

      // Extract unique types (classwork/homework)
      const uniqueTypes = [...new Set(homeworkData.map((hw) => hw.type))];
      setTypes(uniqueTypes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignment data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchHomeworks();
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
      <StudentSidebar />
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
      </div>
    </div>
  );
};

export default StudentHomework;
