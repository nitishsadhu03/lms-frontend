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
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  AlertCircle,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const backend_url = import.meta.env.VITE_API_URL;

const TeacherClassDispute = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
              adminUpdates: session.adminUpdates || cls.adminUpdates,
              dispute: session.dispute || cls.dispute,
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
              adminUpdates: cls.adminUpdates || {},
              dispute: cls.dispute || {},
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

  // Handle opening the dispute dialog
  const handleOpenDisputeDialog = (cls) => {
    setSelectedClass(cls);
    setDisputeReason(cls.dispute?.reason || "");
    setIsDisputeDialogOpen(true);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setIsDisputeDialogOpen(false);
  };

  // Handle raising a dispute
  const handleRaiseDispute = async () => {
    try {
      if (!selectedClass || !disputeReason) {
        toast({
          title: "Error",
          description: "Dispute reason is required",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        reason: disputeReason,
      };

      // Determine if we're disputing a session or a class
      if (selectedClass.isRecurring === false) {
        payload.classId = selectedClass._id;
      } else {
        payload.sessionId = selectedClass._id;
      }

      const response = await axiosInstance.post(
        `${backend_url}/teacher/actions/raise-dispute-by-teacher`,
        payload
      );

      if (response.data && response.data.success) {
        // Update the local state
        const updatedClasses = classes.map((classItem) => {
          if (classItem.isRecurring) {
            // For recurring classes, update the specific session
            const updatedSessions = classItem.sessions.map((session) => {
              if (session._id === selectedClass._id) {
                return {
                  ...session,
                  dispute: {
                    reason: disputeReason,
                    isResolved: false,
                    raisedAt: new Date().toISOString(),
                  },
                };
              }
              return session;
            });
            return { ...classItem, sessions: updatedSessions };
          } else if (classItem._id === selectedClass._id) {
            // For single classes, update the class directly
            return {
              ...classItem,
              dispute: {
                reason: disputeReason,
                isResolved: false,
                raisedAt: new Date().toISOString(),
              },
            };
          }
          return classItem;
        });

        setClasses(updatedClasses);
        toast({
          title: "Success",
          description: "Dispute raised successfully",
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to raise dispute",
        variant: "destructive",
      });
    } finally {
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

  const formatAdminUpdates = (adminUpdates) => {
    if (!adminUpdates) return "-";

    let result = [];
    if (adminUpdates.type) result.push(`Type: ${adminUpdates.type}`);
    if (adminUpdates.amount) result.push(`Amount: ₹${adminUpdates.amount}`);
    if (adminUpdates.penalty) result.push(`Penalty: ${adminUpdates.penalty}`);
    if (adminUpdates.joinTime)
      result.push(`Joined: ${formatTime(adminUpdates.joinTime)}`);

    return result.join(" | ") || "-";
  };

  const getDisputeStatusBadge = (dispute) => {
    if (!dispute || !dispute.reason) return null;

    if (dispute.isResolved) {
      return <Badge className="bg-green-500 text-white">Resolved</Badge>;
    }
    return <Badge variant="destructive">Pending</Badge>;
  };

  return (
    <div className="flex">
      <TeacherSidebar />
      <div className="p-6 overflow-x-hidden w-full min-h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <h1 className="text-xl font-semibold">Class Updates</h1>
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
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Penalty</TableHead>
                  <TableHead>Join Time</TableHead>
                  <TableHead>Dispute Status</TableHead>
                  <TableHead>Raise Dispute</TableHead>
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
                      <TableCell className="capitalize">
                        {cls.adminUpdates?.type || "-"}
                      </TableCell>
                      <TableCell>
                        {cls.adminUpdates?.amount
                          ? `₹${cls.adminUpdates.amount}`
                          : "-"}
                      </TableCell>
                      <TableCell>{cls.adminUpdates?.penalty || "-"}</TableCell>
                      <TableCell>
                        {cls.adminUpdates?.joinTime
                          ? formatTime(cls.adminUpdates.joinTime)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {getDisputeStatusBadge(cls.dispute)}
                      </TableCell>
                      <TableCell>
                        {(!cls.dispute || !cls.dispute.reason) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDisputeDialog(cls)}
                            className="hover:bg-gray-200 rounded-full"
                          >
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          </Button>
                        )}
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

      {/* Dispute Dialog */}
      <Dialog open={isDisputeDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Raise Dispute</DialogTitle>
            <DialogDescription>
              Please provide details about the issue you&apos;re disputing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="disputeReason">Reason for Dispute</Label>
              <Textarea
                id="disputeReason"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe the issue you're disputing..."
                className="min-h-32"
              />
            </div>
            {selectedClass?.adminUpdates && (
              <div className="p-4 bg-gray-100 rounded-md">
                <h4 className="font-medium mb-2">Admin Updates:</h4>
                <p className="text-sm">
                  {formatAdminUpdates(selectedClass.adminUpdates)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button type="button" onClick={handleRaiseDispute}>
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherClassDispute;
