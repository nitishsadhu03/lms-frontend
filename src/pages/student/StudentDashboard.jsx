import StudentSidebar from "@/components/student/StudentSidebar";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Award, BookOpen, Calendar, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";
import { BellRing } from "lucide-react";
// Import Swiper components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const backend_url = import.meta.env.VITE_API_URL;

const StudentDashboard = () => {
  const studentProfile = useSelector((state) => state.userAuth.profile);
  const [classes, setClasses] = useState([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  const fetchClasses = async () => {
    try {
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
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setIsLoadingAnnouncements(true);
      const response = await axiosInstance.get(
        `${backend_url}/admin/actions/all-announcements`
      );
      const fetchedAnnouncements = response.data.announcements || [];
      setAnnouncements(fetchedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch announcements",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAnnouncements();
  }, []);

  // Filter certificates to only include those where isEligible is true
  const eligibleCertificates =
    studentProfile?.certificates?.filter((cert) => cert.isEligible === true) ||
    [];

  // Calculate total eligible certificates
  const totalEligibleCertificates = eligibleCertificates.length;

  // Calculate total enrolled courses
  const totalCoursesEnrolled = studentProfile?.courseEnrolled?.length || 0;

  // Function to format date as dd/mm/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time to 12-hour format (1:30 PM)
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isTodayClass = (classItem) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For non-recurring classes, check the startDate
    if (!classItem.isRecurring) {
      const classDate = new Date(classItem.startDate);
      classDate.setHours(0, 0, 0, 0);
      return classDate.getTime() === today.getTime();
    }

    // For recurring classes, check if any session is today
    if (classItem.isRecurring && classItem.sessions?.length > 0) {
      return classItem.sessions.some((session) => {
        const sessionDate = new Date(session.startDateTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      });
    }

    return false;
  };

  // Update getSessionForToday function to retrieve the correct session for today
  const getSessionForToday = (classItem) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If it's a recurring class with sessions
    if (classItem.isRecurring && classItem.sessions?.length > 0) {
      // Find the session that's scheduled for today
      return classItem.sessions.find((session) => {
        const sessionDate = new Date(session.startDateTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      });
    }

    // For non-recurring classes, return the class's start/end time
    return {
      startDateTime: classItem.startDateTime,
      endDateTime: classItem.endDateTime,
    };
  };

  // Calculate session duration in minutes
  const calculateDuration = (startDateTime, endDateTime) => {
    if (!startDateTime || !endDateTime) return "--";

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const durationMs = end - start;
    return Math.round(durationMs / (1000 * 60)); // Convert to minutes
  };

  // Filter classes for today
  const todayClasses = classes.filter(isTodayClass);

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full min-h-screen bg-gray-50">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <hr className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
          {/* Eligible Certificates Card */}
          <div className="rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-100 font-medium">
                    Verified Certificates
                  </p>
                  <h2 className="text-3xl font-bold mt-2 text-white">
                    {studentProfile ? (
                      totalEligibleCertificates
                    ) : (
                      <div className="h-8 w-16 bg-amber-400/50 rounded animate-pulse"></div>
                    )}
                  </h2>
                </div>
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-amber-100">
                  Eligible and verified certificates earned
                </span>
              </div>
            </div>
            <div className="bg-white px-6 py-3">
              <div className="flex justify-between items-center">
                <Link to="/fcc_classroom/certifications">
                  <span className="text-xs font-medium text-amber-600 hover:underline">
                    View all certificates
                  </span>
                </Link>
                <span className="text-xs text-gray-500">
                  {studentProfile && totalEligibleCertificates > 0
                    ? `Latest: ${formatDate(
                        eligibleCertificates[totalEligibleCertificates - 1]
                          .issuedAt
                      )}`
                    : "No eligible certificates yet"}
                </span>
              </div>
            </div>
          </div>

          {/* Courses Enrolled Card */}
          <div className="rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-100 font-medium">
                    Courses Enrolled
                  </p>
                  <h2 className="text-3xl font-bold mt-2 text-white">
                    {studentProfile ? (
                      totalCoursesEnrolled
                    ) : (
                      <div className="h-8 w-16 bg-teal-400/50 rounded animate-pulse"></div>
                    )}
                  </h2>
                </div>
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-teal-100">
                  Total courses you are currently enrolled in
                </span>
              </div>
            </div>
            <div className="bg-white px-6 py-3">
              <div className="flex justify-between items-center">
                <Link to="/fcc_classroom/resources">
                  <span className="text-xs font-medium text-teal-600 hover:underline">
                    View all courses
                  </span>
                </Link>
                <span className="text-xs text-gray-500">
                  {studentProfile && `Last updated: ${formatDate(new Date())}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Classes Section */}
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold">Today&apos;s Classes</h2>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {todayClasses.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {todayClasses.map((classItem) => {
                  const todaySession = getSessionForToday(classItem);
                  const duration = calculateDuration(
                    todaySession?.startDateTime,
                    todaySession?.endDateTime
                  );

                  return (
                    <div
                      key={classItem._id}
                      className="p-4 hover:bg-gray-50 transition-colors border"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {classItem.batchId}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Instructor: {classItem.teacherId.name}
                          </p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span className="mr-4">
                              {formatTime(todaySession?.startDateTime)}
                            </span>
                            <span>{duration} mins</span>
                          </div>
                        </div>
                        <a
                          href={
                            classItem.classLink.startsWith("http")
                              ? classItem.classLink
                              : `https://${classItem.classLink}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors"
                        >
                          Join <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-3 rounded-full mb-4">
                  <Calendar className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No Classes Today
                </h3>
                <p className="text-sm text-gray-500 max-w-md">
                  You don&apos;t have any scheduled classes for today. Check
                  your full schedule to see upcoming classes.
                </p>
                <Link
                  to="/fcc_classroom/classes"
                  className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View full schedule
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Section */}
        <div className="mt-12">
          <div className="flex items-center mb-4">
            <BellRing className="h-5 w-5 mr-2 text-amber-500" />
            <h2 className="text-lg font-semibold">Announcements</h2>
          </div>

          {/* Announcements Carousel */}
          {isLoadingAnnouncements ? (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="h-48 sm:h-64 w-full bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
              <BellRing className="h-10 w-10 text-amber-500 mx-auto mb-2 opacity-50" />
              <p className="text-gray-500">No announcements available</p>
              <p className="text-sm text-gray-400 mt-1">
                Check back later for important updates
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mx-2 sm:mx-6 md:mx-12 lg:mx-20 my-4 sm:my-8">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                className="w-full h-64 sm:h-80 md:h-96 rounded-lg"
              >
                {announcements.map((announcement) => (
                  <SwiperSlide key={announcement._id} className="relative">
                    <img
                      src={announcement.image}
                      alt="Announcement"
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-xs">
                      Posted: {formatDate(announcement.createdAt)}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
