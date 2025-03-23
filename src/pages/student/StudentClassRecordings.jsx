import StudentSidebar from "@/components/student/StudentSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Filter, Calendar, PlayCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

const backend_url = import.meta.env.VITE_API_URL;

const StudentClassRecordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");

  const fetchRecordings = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/student/recordings`
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

      setCourses(uniqueCourses.map((course) => JSON.parse(course)));
      console.log("recordings: ", recordingsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch recordings data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  // Filter recordings by course and search term
  useEffect(() => {
    let filtered = recordings;

    // Filter by course
    if (selectedCourse !== "all") {
      filtered = filtered.filter(
        (recording) =>
          recording.course && recording.course._id === selectedCourse
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((recording) =>
        recording.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecordings(filtered);
  }, [selectedCourse, searchTerm, recordings]);

  const handleCourseFilterChange = (courseId) => {
    setSelectedCourse(courseId);
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
      <StudentSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full h-full min-h-screen bg-gray-50">
        <h1 className="text-xl font-semibold">Class Recordings</h1>
        <hr className="my-2" />
        {/* Filter Section */}
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
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {(selectedCourse !== "all" || searchTerm) && (
              <Button
                variant="ghost"
                className="self-end"
                onClick={() => {
                  setSelectedCourse("all");
                  setSearchTerm("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredRecordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-xl font-medium">No recordings found</p>
            <p className="text-sm text-center">
              {recordings.length === 0
                ? "No recordings are currently available for your courses"
                : "No recordings match your current filter criteria"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
            {filteredRecordings.map((recording) => (
              <Card
                key={recording._id}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {recording.title}
                      </h3>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                          <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {recording.course?.name || "No Course"}
                          </span>
                        </p>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(recording.classDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <a
                      href={recording.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <PlayCircle className="h-5 w-5 mr-2" />
                      <p className="font-medium">Watch Recording</p>
                    </a>
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

export default StudentClassRecordings;
