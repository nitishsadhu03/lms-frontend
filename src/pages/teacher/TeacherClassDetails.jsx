import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";

const backend_url = import.meta.env.VITE_API_URL;

const TeacherClassDetails = () => {
  const location = useLocation();
  const classData = location.state?.classData;
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [topicsTaught, setTopicsTaught] = useState("");
  const [classType, setClassType] = useState("regular"); // Default class type

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

  // Handle opening the update dialog
  const handleOpenUpdateDialog = (session) => {
    setSelectedSession(session);
    setTopicsTaught(session.topicsTaught || "");
    setClassType(session.classType || "regular"); // Set the class type from session data
    setIsUpdateDialogOpen(true);
  };

  // Handle saving the session update
  const handleSaveUpdate = async () => {
    try {
      if (!selectedSession) return;

      // Prepare the payload
      const payload = {
        sessionId: selectedSession._id,
        topicsTaught,
        classType,
      };

      // Call the updateByTeacher API
      const response = await axiosInstance.post(
        `${backend_url}/teacher/actions/update-by-teacher`,
        payload
      );

      if (response.data && response.data.success) {
        // Update the local state
        const updatedSessions = classData.sessions.map((session) => {
          if (session._id === selectedSession._id) {
            return { ...session, topicsTaught, classType };
          }
          return session;
        });

        // Update the classData state
        classData.sessions = updatedSessions;
      }
      // Show success toast
      toast({
        title: "Success",
        description: "Session updated successfully",
        variant: "success",
      });
    } catch (error) {
      // Show error toast if the API call fails
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update session",
        variant: "destructive",
      });
    } finally {
      // Close the dialog
      handleCloseDialog();
    }
  };

  // Handle closing the dialog properly
  const handleCloseDialog = () => {
    setIsUpdateDialogOpen(false);
    setTimeout(() => {
      setSelectedSession(null);
      setTopicsTaught("");
      setClassType("regular"); // Reset class type
    }, 100);
  };

  if (!classData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      <TeacherSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full h-full min-h-screen bg-gray-50">
        <h1 className="text-xl font-semibold">Class Details</h1>
        <hr className="my-2" />

        <div className="my-6">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-medium">{classData.batchId}</h2>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                classData.isRecurring
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {classData.isRecurring ? "Recurring" : "Single"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {classData.sessions.map((session) => (
              <Card key={session._id} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">
                        Session on {formatDate(session.startDateTime)}
                      </h3>
                      {/* <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sm font-medium"
                            onClick={() => handleOpenUpdateDialog(session)}
                          >
                            Update
                          </Button>
                        </PopoverContent>
                      </Popover> */}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Start:</span>{" "}
                        {formatTime(session.startDateTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">End:</span>{" "}
                        {formatTime(session.endDateTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Class Link:</span>{" "}
                        <a
                          href={
                            classData.classLink.startsWith("http")
                              ? classData.classLink
                              : `https://${classData.classLink}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Join Class
                        </a>
                      </p>
                      {session.topicsTaught && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Topics Taught:</span>{" "}
                          {session.topicsTaught}
                        </p>
                      )}
                      {session.classType && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Class Type:</span>{" "}
                          {session.classType}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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
            <Button type="button" onClick={handleSaveUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherClassDetails;
