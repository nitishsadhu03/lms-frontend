import AdminSidebar from "@/components/admin/AdminSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const backend_url = import.meta.env.VITE_API_URL;

const ViewTeacherClasses = () => {
  const location = useLocation();
  const teacherData = location.state?.teacherData;
  const { teacherId } = useParams(); // Get teacherId from URL
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [type, setType] = useState("");
  const [penalty, setPenalty] = useState("");
  const [joinTime, setJoinTime] = useState("");
  const [amount, setAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Filter state
  const [typeFilter, setTypeFilter] = useState("all");
  const [penaltyFilter, setPenaltyFilter] = useState("all");

  // Filter options
  const typeOptions = ["paid", "cancelled", "rescheduled", "unsuccessful"];
  const penaltyOptions = [
    "No show",
    "Video Duration (<40min)",
    "Cancellation (<120min)",
    "1-7 class cancellation",
    "No",
    "Class Duration (<55min)",
    "Delayed Partial",
    "Delayed Full",
    "Summary not filled",
  ];

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

  // Process classes data to extract sessions, filter by teacherId, and filter by startDateTime
  const processClassesData = (classes, teacherId) => {
    const currentDateTime = new Date(); // Get current date and time

    return classes
      .filter((cls) => cls.teacherId?._id === teacherId) // Filter classes by teacherId
      .flatMap((cls) => {
        if (cls.isRecurring) {
          // For recurring classes, map each session to a row
          return cls.sessions
            .filter(
              (session) => new Date(session.startDateTime) <= currentDateTime
            ) // Filter sessions that have started
            .map((session) => ({
              ...session,
              batchId: cls.batchId,
              classType: cls.classType,
              adminUpdates: session.adminUpdates || cls.adminUpdates, // Use session-level adminUpdates if available, otherwise fallback to class-level
              startDate: session.startDateTime
                ? formatDate(session.startDateTime) // Format date
                : "-",
              startTime: session.startDateTime
                ? formatTime(session.startDateTime) // Format time
                : "-",
              startDateTime: session.startDateTime, // Keep original startDateTime for sorting
            }));
        } else {
          // For non-recurring classes, filter classes that have started
          if (new Date(cls.startDateTime) <= currentDateTime) {
            return {
              ...cls,
              startDate: cls.startDateTime
                ? formatDate(cls.startDateTime) // Format date
                : "-",
              startTime: cls.startDateTime
                ? formatTime(cls.startDateTime) // Format time
                : "-",
              startDateTime: cls.startDateTime, // Keep original startDateTime for sorting
            };
          }
          return null; // Skip classes that haven't started
        }
      })
      .filter((cls) => cls !== null); // Remove null entries
  };

  // Function to format date as dd/mm/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to format time as HH:MM AM/PM (12-hour format)
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1); // Reset to first page when clearing search
  };

  // Handle opening the update dialog
  const handleOpenUpdateDialog = (cls) => {
    setSelectedClass(cls);
    setType(cls.adminUpdates?.type || "");
    setPenalty(cls.adminUpdates?.penalty || "");
    // Convert UTC time to local time for the datetime-local input
    if (cls.adminUpdates?.joinTime) {
      const date = new Date(cls.adminUpdates.joinTime);
      // Format to YYYY-MM-DDThh:mm format required by datetime-local input
      setJoinTime(
        date.toLocaleDateString("en-CA") +
          "T" +
          date.toLocaleTimeString("en-GB").slice(0, 5)
      );
    } else {
      setJoinTime("");
    }
    setAmount(cls.adminUpdates?.amount || "");
    setIsUpdateDialogOpen(true);
  };

  // Handle saving the session/class update
  const handleSaveUpdate = async () => {
    try {
      if (!selectedClass) return;

      // Prepare the payload
      const payload = {
        type,
        penalty,
        joinTime: new Date(joinTime).toISOString(),
        amount: parseFloat(amount),
      };

      // Add sessionId or classId to the payload based on the type of class
      if (selectedClass.isRecurring === false) {
        payload.classId = selectedClass._id; // Use session ID for recurring classes
      } else {
        payload.sessionId = selectedClass._id;
      }

      // Call the update API
      const response = await axiosInstance.post(
        `${backend_url}/admin/actions/update-by-admin`,
        payload
      );

      if (response.data && response.data.success) {
        // Update the local state
        const updatedClasses = classes.map((cls) => {
          if (cls.isRecurring) {
            // For recurring classes, update the specific session
            const updatedSessions = cls.sessions.map((session) => {
              if (session._id === selectedClass._id) {
                return {
                  ...session,
                  adminUpdates: {
                    type,
                    penalty,
                    joinTime: new Date(joinTime).toISOString(),
                    amount: parseFloat(amount),
                  },
                };
              }
              return session;
            });
            return { ...cls, sessions: updatedSessions };
          } else if (cls._id === selectedClass._id) {
            // For single classes, update the class directly
            return {
              ...cls,
              adminUpdates: {
                type,
                penalty,
                joinTime: new Date(joinTime).toISOString(),
                amount: parseFloat(amount),
              },
            };
          }
          return cls;
        });

        setClasses(updatedClasses);
      }

      toast({
        title: "Success",
        description: "Session/Class updated successfully",
        variant: "success",
      });
    } catch (error) {
      // Log the error
      console.error("Error:", error.response?.data || error.message);

      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update session/class",
        variant: "destructive",
      });
    } finally {
      setIsUpdateDialogOpen(false);
      fetchData(); // Refresh data after update
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const classesResponse = await axiosInstance.get(
        `${backend_url}/profile/all-classes`
      );
      setClasses(classesResponse.data.classes || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch classes data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, penaltyFilter]);

  const filteredClasses = processClassesData(classes, teacherId)
    .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime))
    .filter((cls) => {
      // Apply search filter
      if (searchQuery && cls.batchId) {
        if (!cls.batchId.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      // Apply type filter if selected
      if (
        typeFilter &&
        typeFilter !== "all" &&
        cls.adminUpdates?.type !== typeFilter
      ) {
        return false;
      }

      // Apply penalty filter if selected
      if (
        penaltyFilter &&
        penaltyFilter !== "all" &&
        cls.adminUpdates?.penalty !== penaltyFilter
      ) {
        return false;
      }

      return true;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredClasses.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentClasses = filteredClasses.slice(startIndex, endIndex);

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

  // Handle filter changes
  const handleTypeFilterChange = (value) => {
    setTypeFilter(value);
  };

  const handlePenaltyFilterChange = (value) => {
    setPenaltyFilter(value);
  };

  // Clear all filters
  const clearFilters = () => {
    setTypeFilter("all");
    setPenaltyFilter("all");
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-2 sm:p-4 md:p-6 overflow-x-hidden w-full min-h-screen bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h1 className="text-lg sm:text-xl font-semibold">Classes</h1>

          {teacherData && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg shadow-md">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={teacherData.profileImage}
                  alt={teacherData.name}
                />
                <AvatarFallback className="text-black font-medium">
                  {getInitials(teacherData.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{teacherData.name}</p>
                <p className="text-xs text-white">{teacherData.teacherId}</p>
              </div>
            </div>
          )}
        </div>
        <hr className="mt-2 mb-4" />

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="searchQuery">Search</Label>
            <div className="relative w-64">
              <Input
                type="text"
                id="searchQuery"
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="typeFilter">Filter by Type</Label>
            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {typeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="penaltyFilter">Filter by Penalty</Label>
            <Select
              value={penaltyFilter}
              onValueChange={handlePenaltyFilterChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All penalties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All penalties</SelectItem>
                {penaltyOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(typeFilter || penaltyFilter) && (
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        <hr className="my-1" />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading classes data...</p>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Penalty</TableHead>
                  <TableHead>Amount (in rupees)</TableHead>
                  <TableHead>Join Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClasses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      {filteredClasses.length === 0
                        ? "No classes found matching the selected filters"
                        : "No started classes found for this teacher"}
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
                      <TableCell className="capitalize">
                        {cls.adminUpdates?.type || "-"}
                      </TableCell>
                      <TableCell className="capitalize">
                        {cls.adminUpdates?.penalty || "-"}
                      </TableCell>
                      <TableCell>{cls.adminUpdates?.amount || "-"}</TableCell>
                      <TableCell>
                        {cls.adminUpdates?.joinTime
                          ? formatTime(cls.adminUpdates.joinTime)
                          : "-"}
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
            {filteredClasses.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredClasses.length)} of{" "}
                  {filteredClasses.length} entries
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
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Session/Class Details</DialogTitle>
            <DialogDescription>
              Update the type, penalty, join time, and amount for this
              session/class.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  <SelectItem value="unsuccessful">Unsuccessful</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="penalty">Penalty</Label>
              <Select value={penalty} onValueChange={setPenalty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select penalty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No show">No show</SelectItem>
                  <SelectItem value="Video Duration (<40min)">
                    Video Duration (&lt;40min)
                  </SelectItem>
                  <SelectItem value="Cancellation (<120min)">
                    Cancellation (&lt;120min)
                  </SelectItem>
                  <SelectItem value="1-7 class cancellation">
                    1-7 class cancellation
                  </SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Class Duration (<55min)">
                    Class Duration (&lt;55min)
                  </SelectItem>
                  <SelectItem value="Delayed Partial">
                    Delayed Partial
                  </SelectItem>
                  <SelectItem value="Delayed Full">Delayed Full</SelectItem>
                  <SelectItem value="Summary not filled">
                    Summary not filled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="joinTime">Join Time</Label>
              <Input
                type="datetime-local"
                value={joinTime}
                onChange={(e) => setJoinTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewTeacherClasses;
