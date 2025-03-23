import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, FileText, Image, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BACKEND_URL = import.meta.env.VITE_API_URL;

const TeacherResources = () => {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [filteredResources, setFilteredResources] = useState([]);
  const [capitalizedCourse, setCapitalizedCourse] = useState("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const handleExistingCourseChange = (value) => {
    setCourse(value);
  };

  const handleFilter = () => {
    if (!course) {
      setFilteredResources(resources);
      setCapitalizedCourse("All Courses");
    } else {
      const filtered = resources.filter(
        (resource) =>
          (resource.course &&
            resource.course.toLowerCase() === course.toLowerCase()) ||
          (!resource.course && course === "no course assigned")
      );
      setFilteredResources(filtered);
      setCapitalizedCourse(course.charAt(0).toUpperCase() + course.slice(1));
    }
  };

  const fetchResources = async () => {
    try {
      const response = await axiosInstance.get(
        `${BACKEND_URL}/profile/resources`
      );
      console.log(response.data.resources);
      const fetchedResources = response.data.resources.map((resource) => ({
        id: resource._id,
        title: resource.title,
        visualAid: resource.visualAid,
        lessonPlan: resource.lessonPlan,
        course: resource.course ? resource.course.name : "No Course Assigned",
      }));
      setResources(fetchedResources);
      setFilteredResources(fetchedResources); // Initialize filtered resources with all resources
      setCapitalizedCourse("All Courses"); // Set default view title
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch resources",
        variant: "destructive",
      });
    }
  };

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const response = await axiosInstance.get(
        `${BACKEND_URL}/profile/courses`
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
    } finally {
      setIsLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchResources();
  }, []);

  return (
    <div className="flex">
      <TeacherSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full min-h-screen bg-gray-50">
        <h1 className="text-xl font-semibold">Resources</h1>
        <hr className="my-2" />
        <div className="flex gap-6 my-8">
          <div className="w-72">
            <Select value={course} onValueChange={handleExistingCourseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((courseItem) => (
                  <SelectItem
                    key={courseItem._id}
                    value={courseItem.name.toLowerCase()}
                  >
                    {courseItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleFilter}>Apply Filter</Button>
        </div>

        {capitalizedCourse ? (
          <>
            <h2 className="text-gray-600 mt-8 mb-4">
              Showing results for {capitalizedCourse}
            </h2>

            {/* Resource Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {filteredResources.map((resource, index) => (
                <Card
                  key={index}
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <FileText className="text-blue-500" size={24} />
                          <h3 className="font-medium">{resource.title}</h3>
                        </div>
                      </div>

                      <div className="flex items-center justify-start gap-3 mt-2">
                        {/* Lesson Plan Link */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={resource.lessonPlan}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                              >
                                <FileText size={16} />
                                <span className="text-sm">Lesson Plan</span>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View lesson plan</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Visual Aid Link - Only show if available */}
                        {resource.visualAid && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  to={resource.visualAid}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                                >
                                  <Image size={16} />
                                  <span className="text-sm">Visual Aid</span>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View visual aid</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                No resources found for this course.
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            Please select a course and apply filter to view resources.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherResources;
