import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";

const StudentClassDetails = () => {
  const location = useLocation();
  const classData = location.state?.classData;

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

  if (!classData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      <StudentSidebar />
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassDetails;
