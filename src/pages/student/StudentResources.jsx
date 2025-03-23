import StudentSidebar from "@/components/student/StudentSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import { Eye, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL;

const StudentResources = () => {
  const studentProfile = useSelector((state) => state.userAuth.profile);
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState(studentProfile.courseEnrolled);
  const [course, setCourse] = useState("");
  const [filteredResources, setFilteredResources] = useState([]);
  const [capitalizedCourse, setCapitalizedCourse] = useState("");

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
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="flex">
      <StudentSidebar />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {filteredResources.map((resource, index) => (
                <Card
                  key={index}
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-500" size={24} />
                        <h3 className="font-medium">{resource.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          to={resource.lessonPlan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Eye
                            className="text-gray-600 hover:text-primary"
                            size={20}
                          />
                        </Link>
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

export default StudentResources;
