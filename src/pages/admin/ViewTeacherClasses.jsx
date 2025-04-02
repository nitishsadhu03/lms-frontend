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
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  AlertCircle,
  Check,
  Ban,
  Pen,
  Eye,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const backend_url = import.meta.env.VITE_API_URL;

const ViewTeacherClasses = () => {
  const location = useLocation();
  const teacherData = location.state?.teacherData;
  const { teacherId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [type, setType] = useState("");
  const [penalty, setPenalty] = useState("");
  const [joinTime, setJoinTime] = useState("");
  const [amount, setAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [remarks, setRemarks] = useState("");
  const [disputeAction, setDisputeAction] = useState("resolve");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisputeSubmitting, setIsDisputeSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Filter state
  const [typeFilter, setTypeFilter] = useState("all");
  const [penaltyFilter, setPenaltyFilter] = useState("all");
  const [disputeFilter, setDisputeFilter] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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

  // Add these with your other handler functions
  const handleOpenViewDialog = (cls) => {
    setSelectedClass(cls);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Process classes data
  const processClassesData = (classes, teacherId) => {
    const currentDateTime = new Date();

    return classes
      .filter((cls) => cls.teacherId?._id === teacherId)
      .flatMap((cls) => {
        if (cls.isRecurring) {
          return cls.sessions
            .filter(
              (session) => new Date(session.startDateTime) <= currentDateTime
            )
            .map((session) => ({
              ...session,
              batchId: cls.batchId,
              classType: session.classType || cls.classType,
              topicsTaught: session.topicsTaught || "",
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
      .filter((cls) => cls !== null);
  };

  // Format date as dd/mm/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time as HH:MM AM/PM
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Open admin updates dialog
  const handleOpenUpdateDialog = (cls) => {
    setSelectedClass(cls);
    setType(cls.adminUpdates?.type || "");
    setPenalty(cls.adminUpdates?.penalty || "");
    if (cls.adminUpdates?.joinTime) {
      const date = new Date(cls.adminUpdates.joinTime);
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

  // Open dispute dialog
  const handleOpenDisputeDialog = (cls) => {
    setSelectedClass(cls);
    setRemarks(cls.dispute?.remarks || "");
    setIsDisputeDialogOpen(true);
  };

  // Save admin updates
  const handleSaveUpdate = async () => {
    try {
      setIsSubmitting(true);
      if (!selectedClass) return;

      const payload = {
        type,
        penalty,
        joinTime: new Date(joinTime).toISOString(),
        amount: parseFloat(amount),
      };

      if (selectedClass.isRecurring === false) {
        payload.classId = selectedClass._id;
      } else {
        payload.sessionId = selectedClass._id;
      }

      const response = await axiosInstance.post(
        `${backend_url}/admin/actions/update-by-admin`,
        payload
      );

      if (response.data?.success) {
        const updatedClasses = classes.map((cls) => {
          if (cls.isRecurring) {
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
        toast({
          title: "Success",
          description: "Session/Class updated successfully",
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update session/class",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUpdateDialogOpen(false);
      fetchData();
    }
  };

  // Handle dispute resolution
  const handleResolveDispute = async () => {
    try {
      setIsDisputeSubmitting(true);
      if (!selectedClass || !remarks) {
        toast({
          title: "Error",
          description: "Remarks are required",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        remarks,
        action: disputeAction,
        status: disputeAction === "resolve" ? "resolved" : "rejected",
      };

      if (selectedClass.isRecurring === false) {
        payload.classId = selectedClass._id;
      } else {
        payload.sessionId = selectedClass._id;
      }

      const response = await axiosInstance.post(
        `${backend_url}/admin/actions/resolve-dispute-by-admin`,
        payload
      );

      if (response.data?.success) {
        const updatedClasses = classes.map((cls) => {
          if (cls.isRecurring) {
            const updatedSessions = cls.sessions.map((session) => {
              if (session._id === selectedClass._id) {
                return {
                  ...session,
                  dispute: {
                    ...session.dispute,
                    status:
                      disputeAction === "resolve" ? "resolved" : "rejected",
                    remarks,
                  },
                };
              }
              return session;
            });
            return { ...cls, sessions: updatedSessions };
          } else if (cls._id === selectedClass._id) {
            return {
              ...cls,
              dispute: {
                ...cls.dispute,
                status: disputeAction === "resolve" ? "resolved" : "rejected",
                remarks,
              },
            };
          }
          return cls;
        });

        setClasses(updatedClasses);
        toast({
          title: "Success",
          description: `Dispute updated successfully`,
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to resolve dispute",
        variant: "destructive",
      });
    } finally {
      setIsDisputeSubmitting(false);
      setIsDisputeDialogOpen(false);
      fetchData();
    }
  };

  // Fetch data
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
  }, [typeFilter, penaltyFilter, disputeFilter]);

  // Filter classes
  const filteredClasses = processClassesData(classes, teacherId)
    .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime))
    .filter((cls) => {
      // Search filter
      if (searchQuery && cls.batchId) {
        if (!cls.batchId.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      // Type filter
      if (
        typeFilter &&
        typeFilter !== "all" &&
        cls.adminUpdates?.type !== typeFilter
      ) {
        return false;
      }

      // Penalty filter
      if (
        penaltyFilter &&
        penaltyFilter !== "all" &&
        cls.adminUpdates?.penalty !== penaltyFilter
      ) {
        return false;
      }

      // Dispute filter
      if (
        disputeFilter === "pending" &&
        (!cls.dispute?.reason || cls.dispute?.status !== "pending")
      ) {
        return false;
      }
      if (
        disputeFilter === "resolved" &&
        (!cls.dispute?.reason || cls.dispute?.status !== "resolved")
      ) {
        return false;
      }

      return true;
    });

  // Pagination
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

  const handleDisputeFilterChange = (value) => {
    setDisputeFilter(value);
  };

  // Clear all filters
  const clearFilters = () => {
    setTypeFilter("all");
    setPenaltyFilter("all");
    setDisputeFilter("all");
  };

  // Get dispute badge
  const getDisputeBadge = (dispute) => {
    if (!dispute?.reason) return null;

    switch (dispute.status) {
      case "resolved":
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-400">
            Resolved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500 text-white hover:bg-red-400">
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-400">
            Pending
          </Badge>
        );
      default:
        return null;
    }
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
            <Label htmlFor="typeFilter">Type</Label>
            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-[150px]">
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
            <Label htmlFor="penaltyFilter">Penalty</Label>
            <Select
              value={penaltyFilter}
              onValueChange={handlePenaltyFilterChange}
            >
              <SelectTrigger className="w-[150px]">
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="disputeFilter">Dispute</Label>
            <Select
              value={disputeFilter}
              onValueChange={handleDisputeFilterChange}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All disputes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All disputes</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(typeFilter !== "all" ||
            penaltyFilter !== "all" ||
            disputeFilter !== "all") && (
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        <hr className="my-1" />

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
                  <TableHead>Type</TableHead>
                  <TableHead>Penalty</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Dispute</TableHead>
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
                      <TableCell>{getDisputeBadge(cls.dispute)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenViewDialog(cls)}
                            className="hover:bg-gray-200 rounded-full"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenUpdateDialog(cls)}
                            className="hover:bg-gray-200 rounded-full"
                            disabled={!cls.classType || !cls.topicsTaught}
                            title={
                              !cls.classType || !cls.topicsTaught
                                ? "Cannot edit - Class type or topics not filled"
                                : ""
                            }
                          >
                            <Pen className="h-4 w-4" />
                          </Button>
                          {cls.dispute?.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDisputeDialog(cls)}
                              className="hover:bg-gray-200 rounded-full"
                            >
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            </Button>
                          )}
                        </div>
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

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={handleCloseViewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Class/Session Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <p className="p-2 bg-gray-100 rounded-md text-sm font-medium">
                  {selectedClass?.startDate}
                </p>
              </div>
              <div>
                <Label>Time</Label>
                <p className="p-2 bg-gray-100 rounded-md text-sm font-medium">
                  {selectedClass?.startTime}
                </p>
              </div>
            </div>

            <div>
              <Label>Class Type</Label>
              <p className="p-2 bg-gray-100 rounded-md capitalize text-sm font-medium">
                {selectedClass?.classType || "Not specified"}
              </p>
            </div>

            <div>
              <Label>Topics Taught</Label>
              <p className="p-2 bg-gray-100 rounded-md whitespace-pre-line text-sm font-medium">
                {selectedClass?.topicsTaught || "Not specified"}
              </p>
            </div>

            {selectedClass?.dispute && (
              <div className="border-t pt-4">
                <Label>Dispute Details</Label>
                <div className="space-y-2 mt-2">
                  <div>
                    <Label className="text-sm">Reason:</Label>
                    <p className="p-2 bg-gray-100 rounded-md text-sm font-medium">
                      {selectedClass.dispute.reason}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm">Status:</Label>
                    <div className="mt-1">
                      {getDisputeBadge(selectedClass.dispute)}
                    </div>
                  </div>
                  {selectedClass.dispute.remarks && (
                    <div>
                      <Label className="text-sm">Admin Remarks:</Label>
                      <p className="p-2 bg-gray-100 rounded-md text-sm font-medium">
                        {selectedClass.dispute.remarks}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleCloseViewDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Updates Dialog */}
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
                  {penaltyOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
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
            <Button
              type="button"
              onClick={handleSaveUpdate}
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Resolution Dialog */}
      <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Review and resolve the teacher&apos;s dispute for this
              session/class.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-4 bg-gray-100 rounded-md">
              <h4 className="font-medium mb-2">Teacher&apos;s Dispute:</h4>
              <p className="text-sm">{selectedClass?.dispute?.reason}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="action">Action</Label>
              <Select value={disputeAction} onValueChange={setDisputeAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resolve">Resolve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter your remarks..."
                className="min-h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDisputeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleResolveDispute}
              disabled={isDisputeSubmitting}
            >
              {disputeAction === "resolve" ? "Resolve" : "Reject"} Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewTeacherClasses;
