import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import {
  Calendar,
  Clock,
  MoreVertical,
  Search,
  SquarePlus,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const backend_url = import.meta.env.VITE_API_URL;

const CreateClass = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [classToReschedule, setClassToReschedule] = useState(null);
  const [newStartDateTime, setNewStartDateTime] = useState("");
  const [newEndDateTime, setNewEndDateTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

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

  // Format a datetime to show both date and time
  const formatDateTime = (dateString) => {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
  };

  // Redirect to the new page for creating a class
  const handleCreateClassClick = () => {
    navigate("/fcc_admin/create-class/create");
  };

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `${backend_url}/profile/classes/admin`
      );
      console.log("class: ", response.data.classes);
      setClasses(response.data.classes);
      setFilteredClasses(response.data.classes);
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

  const handleDeleteClick = (classItem) => {
    setClassToDelete(classItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(
        `${backend_url}/admin/actions/delete-class/${classToDelete._id}`
      );

      toast({
        title: "Success",
        description: `"${classToDelete.batchId}" has been deleted`,
        variant: "success",
      });

      // Refresh classes list after deletion
      fetchClasses();

      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const handleRescheduleClick = (classItem) => {
    setClassToReschedule(classItem);
    setNewStartDateTime(
      new Date(classItem.startDateTime).toISOString().slice(0, 16)
    );
    setNewEndDateTime(
      new Date(classItem.endDateTime).toISOString().slice(0, 16)
    );
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleConfirm = async () => {
    try {
      if (!newStartDateTime || !newEndDateTime) {
        toast({
          title: "Error",
          description: "Please provide valid start and end dates.",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        classId: classToReschedule._id,
        newStartDateTime: new Date(newStartDateTime).toISOString(),
        newEndDateTime: new Date(newEndDateTime).toISOString(),
      };

      await axiosInstance.put(
        `${backend_url}/admin/actions/classes/reschedule`,
        payload
      );

      toast({
        title: "Success",
        description: `"${classToReschedule.batchId}" has been rescheduled`,
        variant: "success",
      });

      // Refresh classes list after rescheduling
      fetchClasses();

      // Close dialog and reset state
      setRescheduleDialogOpen(false);
      setClassToReschedule(null);
      setNewStartDateTime("");
      setNewEndDateTime("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to reschedule class",
        variant: "destructive",
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full h-full bg-gray-50">
        <h1 className="text-xl font-semibold">Create Class</h1>
        <hr className="my-2" />
        <div className="my-8 w-full">
          <Card className="flex flex-col w-64 shadow-[0_3px_10px_rgb(0,0,0,0.2)] mx-auto">
            <div className="p-6 mx-auto">
              <Calendar size={70} />
            </div>
            <CardContent className="">
              <Button
                className="w-full bg-primary hover:bg-primary/85"
                onClick={handleCreateClassClick}
              >
                <SquarePlus className="w-5 h-5" />
                Create Class
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mt-12">
          <h1 className="text-lg font-medium">Recently Created Classes</h1>
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
        <hr className="my-4" />
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
                    className="w-full shadow-lg flex flex-col h-[220px]"
                  >
                    <CardHeader className="pb-1 shrink-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {classData.batchId}
                        </CardTitle>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 shrink-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-0">
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                className="w-full justify-start rounded-none text-red-500 hover:bg-gray-100 hover:text-red-500"
                                onClick={() => handleDeleteClick(classData)}
                              >
                                Delete
                              </Button>
                              {!classData.isRecurring && (
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start rounded-none text-blue-500 hover:bg-gray-100 hover:text-blue-500"
                                  onClick={() =>
                                    handleRescheduleClick(classData)
                                  }
                                >
                                  Reschedule
                                </Button>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
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
                          to={`/fcc_admin/class/${classData._id}`}
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

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Class</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{classToDelete?.batchId}
                &quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                className="w-full sm:w-auto"
              >
                Delete Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={rescheduleDialogOpen}
          onOpenChange={setRescheduleDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reschedule Class</DialogTitle>
              <DialogDescription>
                Choose a new date and time for &quot;
                {classToReschedule?.batchId}
                &quot;.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="startDateTime">New Start Date & Time</Label>
                <Input
                  id="startDateTime"
                  type="datetime-local"
                  value={newStartDateTime}
                  onChange={(e) => setNewStartDateTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDateTime">New End Date & Time</Label>
                <Input
                  id="endDateTime"
                  type="datetime-local"
                  value={newEndDateTime}
                  onChange={(e) => setNewEndDateTime(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setRescheduleDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRescheduleConfirm}
                className="w-full sm:w-auto"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CreateClass;
