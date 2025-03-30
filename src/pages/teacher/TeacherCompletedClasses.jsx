import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pen, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const backend_url = import.meta.env.VITE_API_URL;

const TeacherCompletedClasses = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classType, setClassType] = useState("");
  const [topicsTaught, setTopicsTaught] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Function to format date as dd/mm/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to format time as HH:MM AM/PM (12-hour format)
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // Process classes data to extract sessions and filter by startDateTime
  const processClassesData = (classes, search = "") => {
    const currentDateTime = new Date();
    const searchLower = search.toLowerCase();

    return classes
      .flatMap((cls) => {
        if (cls.isRecurring) {
          // For recurring classes, map each session to a row
          return cls.sessions
            .filter(
              (session) => new Date(session.startDateTime) <= currentDateTime
            )
            .map((session) => ({
              ...session,
              batchId: cls.batchId,
              courseId: cls.courseId,
              classType: session.classType || cls.classType,
              topicsTaught: session.topicsTaught || "",
              startDate: session.startDateTime
                ? formatDate(session.startDateTime)
                : "-",
              startTime: session.startDateTime
                ? formatTime(session.startDateTime)
                : "-",
              startDateTime: session.startDateTime,
            }));
        } else {
          // For non-recurring classes, filter classes that have started
          if (new Date(cls.startDateTime) <= currentDateTime) {
            return {
              ...cls,
              topicsTaught: cls.topicsTaught || "",
              startDate: cls.startDateTime
                ? formatDate(cls.startDateTime)
                : "-",
              startTime: cls.startDateTime
                ? formatTime(cls.startDateTime)
                : "-",
              startDateTime: cls.startDateTime,
            };
          }
          return null;
        }
      })
      .filter((cls) => cls !== null)
      .filter(
        (cls) =>
          !search ||
          (cls.batchId && cls.batchId.toLowerCase().includes(searchLower))
      )
      .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));
  };

  // Handle opening the update dialog
  const handleOpenUpdateDialog = (cls) => {
    setSelectedClass(cls);
    setClassType(cls.classType || "");
    setTopicsTaught(cls.topicsTaught || "");
    setIsUpdateDialogOpen(true);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setIsUpdateDialogOpen(false);
  };

  // Handle saving the session/class update
  const handleSaveUpdate = async () => {
    try {
      setIsSubmitting(true);
      if (!selectedClass) return;

      // Prepare the payload
      const payload = {
        topicsTaught,
        classType,
      };

      // Add classId or sessionId to the payload based on the type of class
      if (selectedClass.isRecurring === false) {
        payload.classId = selectedClass._id; // Use session ID for recurring classes
      } else {
        payload.sessionId = selectedClass._id; // Use class ID for single classes
      }

      // Log the payload
      console.log("Payload:", payload);

      // Call the updateByTeacher API
      const response = await axiosInstance.post(
        `${backend_url}/teacher/actions/update-by-teacher`,
        payload
      );

      // Log the response
      console.log("Response:", response.data);

      if (response.data && response.data.success) {
        // Update the local state
        const updatedClasses = classes.map((classItem) => {
          if (classItem.isRecurring) {
            // For recurring classes, update the specific session
            const updatedSessions = classItem.sessions.map((session) => {
              if (session._id === selectedClass._id) {
                return {
                  ...session,
                  topicsTaught,
                  classType,
                };
              }
              return session;
            });
            return { ...classItem, sessions: updatedSessions };
          } else if (classItem._id === selectedClass._id) {
            // For single classes, update the class directly
            return {
              ...classItem,
              topicsTaught,
              classType,
            };
          }
          return classItem;
        });

        setClasses(updatedClasses);
      }
      toast({
        title: "Success",
        description: "Class/Session updated successfully",
        variant: "success",
      });
    } catch (error) {
      // Log the error
      console.error("Error:", error.response?.data || error.message);

      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update class/session",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      handleCloseDialog();
      fetchClasses();
    }
  };

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/teacher/classes`
      );
      setClasses(response.data.classes || []);
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

  // Apply pagination
  const processedClasses = processClassesData(classes, searchTerm);
  const totalPages = Math.ceil(processedClasses.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentClasses = processedClasses.slice(startIndex, endIndex);

  // Pagination controls
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1); // Reset to first page when clearing search
  };

  const formatClassType = (type) => {
    if (!type) return "-";

    const typeMap = {
      regular: "Regular",
      student_absent: "Student Absent",
      ptm: "PTM",
      test: "Test",
    };

    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="flex">
      <TeacherSidebar />
      <div className="p-6 overflow-x-hidden w-full min-h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <h1 className="text-xl font-semibold">Classes Summary Fill</h1>
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search by Batch ID"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {searchTerm ? (
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
        <hr className="my-4" />

        {isLoading ? (
          <div className="w-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">S.No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Class Type</TableHead>
                  <TableHead>Topics Taught</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClasses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No completed classes found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentClasses.map((cls, index) => (
                    <TableRow key={cls._id || index}>
                      <TableCell className="font-medium">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>{cls.startDate}</TableCell>
                      <TableCell>{cls.startTime}</TableCell>
                      <TableCell>{cls.batchId}</TableCell>
                      <TableCell>{cls.courseId?.name || "-"}</TableCell>
                      <TableCell>{formatClassType(cls.classType)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {cls.topicsTaught || "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenUpdateDialog(cls)}
                          className="hover:bg-gray-200 rounded-full"
                        >
                          <Pen className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {processedClasses.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, processedClasses.length)} of{" "}
                  {processedClasses.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant=""
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant=""
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Session Details</DialogTitle>
            <DialogDescription>
              Add the topics taught and class type for this session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="topicsTaught">Topics Taught</Label>
              <Textarea
                id="topicsTaught"
                value={topicsTaught}
                onChange={(e) => setTopicsTaught(e.target.value)}
                placeholder="Enter topics covered in this session..."
                className="min-h-32"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="classType">Type of Class</Label>
              <Select
                value={classType}
                onValueChange={(value) => setClassType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="student_absent">Student Absent</SelectItem>
                  <SelectItem value="ptm">PTM</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveUpdate} disabled={isSubmitting}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherCompletedClasses;
