import StudentSidebar from "@/components/student/StudentSidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import {
  Calendar,
  Clock,
  Eye,
  MoreVertical,
  Search,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const backend_url = import.meta.env.VITE_API_URL;

const StudentClasses = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `${backend_url}/profile/classes/student`
      );
      console.log("class: ", response.data.classes);
      setClasses(response.data.classes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch class data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Effect for filtering classes based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClasses(classes);
    } else {
      const filtered = classes.filter((classItem) =>
        classItem.batchId.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClasses(filtered);
    }
  }, [searchQuery, classes]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Format date to dd/mm/yyyy with day of week
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const day = days[date.getDay()];

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${dd}/${mm}/${yyyy} (${day})`;
  };

  // Format time to show only hours and minutes
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full min-h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <h1 className="text-xl font-semibold">Classes</h1>
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search by Batch ID"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {searchQuery ? (
                <X
                  className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={handleClearSearch}
                />
              ) : (
                <Search className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>
        <hr className="my-2" />
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div>
            {filteredClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="text-gray-500">
                  No classes found matching &quot;{searchQuery}&quot;
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 my-6">
                {filteredClasses.map((classData) => (
                  <Card
                    key={classData._id}
                    className="w-full shadow-lg flex flex-col h-[235px]"
                  >
                    <CardHeader className="pb-1 shrink-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {classData.batchId}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            classData.isRecurring
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {classData.isRecurring ? "Recurring" : "Single"}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {classData.isRecurring
                              ? `Start Date: ${formatDate(classData.startDate)}`
                              : `Start: ${formatDate(
                                  classData.startDateTime
                                )} at ${formatTime(classData.startDateTime)}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Teacher: {classData.teacherId.name}</span>
                        </div>

                        {classData.isRecurring && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Sessions: {classData.sessions.length}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="mt-auto pt-0 shrink-0">
                      {!classData.isRecurring ? (
                        <a
                          href={
                            classData.classLink.startsWith("http")
                              ? classData.classLink
                              : `https://${classData.classLink}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button className="w-full bg-primary hover:bg-primary/85">
                            Join Class
                          </Button>
                        </a>
                      ) : (
                        <Link
                          to={`/fcc_classroom/class/${classData._id}`}
                          state={{ classData }}
                          className="w-full"
                        >
                          <Button className="w-full bg-primary hover:bg-primary/85">
                            View Details
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentClasses;
