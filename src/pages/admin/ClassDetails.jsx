import { useLocation } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const backend_url = import.meta.env.VITE_API_URL;

const ClassDetails = () => {
  const location = useLocation();
  const classData = location.state?.classData;
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState(null);
  const [newStartDateTime, setNewStartDateTime] = useState("");
  const [newEndDateTime, setNewEndDateTime] = useState("");

  // Format date to dd/mm/yyyy with day of week
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[date.getDay()];
    
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    
    return `${dd}/${mm}/${yyyy} (${day})`;
  };

  // Format time to show only hours and minutes
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${hours}:${minutes} ${ampm}`;
  };

  const handleRescheduleClick = (session) => {
    setSessionToReschedule(session);
    setNewStartDateTime(new Date(session.startDateTime).toISOString().slice(0, 16));
    setNewEndDateTime(new Date(session.endDateTime).toISOString().slice(0, 16));
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
        classId: classData._id,
        sessionId: sessionToReschedule._id,
        newStartDateTime: new Date(newStartDateTime).toISOString(),
        newEndDateTime: new Date(newEndDateTime).toISOString(),
      };

      const response = await axiosInstance.put(
        `${backend_url}/admin/actions/classes/reschedule`,
        payload
      );

      toast({
        title: "Success",
        description: `Session on ${formatDate(sessionToReschedule.startDateTime)} has been rescheduled`,
        variant: "success",
      });

      // Refresh the class data after rescheduling
      const updatedClassData = { ...classData };
      const updatedSessionIndex = updatedClassData.sessions.findIndex(
        (session) => session._id === sessionToReschedule._id
      );
      updatedClassData.sessions[updatedSessionIndex] = {
        ...sessionToReschedule,
        startDateTime: new Date(newStartDateTime).toISOString(),
        endDateTime: new Date(newEndDateTime).toISOString(),
        isRescheduled: true,
        rescheduledDateTime: new Date(newStartDateTime).toISOString(),
      };

      // Update the local state
      setSessionToReschedule(null);
      setNewStartDateTime("");
      setNewEndDateTime("");
      setRescheduleDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reschedule session",
        variant: "destructive",
      });
    }
  };

  if (!classData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      <AdminSidebar />
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
                          href={classData.classLink.startsWith('http') ? classData.classLink : `https://${classData.classLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Join Class
                        </a>
                      </p>

                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRescheduleClick(session)}
                          className="w-full"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reschedule Session</DialogTitle>
              <DialogDescription>
                Choose a new date and time for the session.
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
                onClick={() => {
                  setRescheduleDialogOpen(false);
                  setSessionToReschedule(null);
                  setNewStartDateTime("");
                  setNewEndDateTime("");
                }}
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

export default ClassDetails;