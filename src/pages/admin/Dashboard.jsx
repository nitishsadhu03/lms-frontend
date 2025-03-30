import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import React, { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  BellRing,
  Plus,
  X,
  Image,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// Import Swiper components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Input } from "@/components/ui/input";

const backend_url = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [isDeletingAnnouncement, setIsDeletingAnnouncement] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  const [link, setLink] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [teachersResponse, studentsResponse] = await Promise.all([
        axiosInstance.get(`${backend_url}/profile/teacher`),
        axiosInstance.get(`${backend_url}/profile/student`),
      ]);

      setTeachers(teachersResponse.data.users);
      setStudents(studentsResponse.data.users);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const response = await axiosInstance.get(
        `${backend_url}/profile/courses`
      );
      const fetchedCourses = response.data.courses;
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setIsLoadingAnnouncements(true);
      const response = await axiosInstance.get(
        `${backend_url}/admin/actions/announcements`
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB = 2097152 bytes)
    if (file.size > 2097152) {
      toast({
        title: "Error",
        description: "Image size must be less than 1MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Image must be JPG, JPEG, PNG, or GIF",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);

    // Create a preview URL and convert to base64
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  };

  const createAnnouncement = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image for the announcement",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAnnouncement(true);

    try {
      // Send image as base64 string directly
      await axiosInstance.post(`${backend_url}/admin/actions/announcement`, {
        image: previewUrl, // Sending the base64 string directly
        link: link || null,
      });

      toast({
        title: "Success",
        description: "Announcement created successfully",
        variant: "success",
      });

      // Fetch updated announcements
      fetchAnnouncements();

      // Reset form state
      setSelectedImage(null);
      setPreviewUrl(null);
      setLink("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create announcement",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = (id) => {
    setSelectedAnnouncementId(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteAnnouncement = async () => {
    if (!selectedAnnouncementId) return;

    setIsDeletingAnnouncement(true);
    try {
      await axiosInstance.delete(
        `${backend_url}/admin/actions/delete-announcement/${selectedAnnouncementId}`
      );

      // Update local state by removing the deleted announcement
      setAnnouncements((prev) =>
        prev.filter(
          (announcement) => announcement._id !== selectedAnnouncementId
        )
      );

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete announcement",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAnnouncement(false);
      setDeleteModalOpen(false);
      setSelectedAnnouncementId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchAnnouncements();
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 overflow-x-hidden w-screen min-h-screen lg:w-full h-full bg-gray-50">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <hr className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          {/* Teachers Card */}
          <div className="rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100 font-medium">
                    Total Teachers
                  </p>
                  <h2 className="text-3xl font-bold mt-2 text-white">
                    {isLoading ? (
                      <div className="h-8 w-16 bg-blue-400/50 rounded animate-pulse"></div>
                    ) : (
                      teachers.length
                    )}
                  </h2>
                </div>
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-blue-100">
                  Active educators in the system
                </span>
              </div>
            </div>
            <div className="bg-white px-6 py-3">
              <div className="flex justify-between items-center">
                <Link to="/fcc_admin/users">
                  <span className="text-xs font-medium text-blue-600 hover:underline">
                    View all teachers
                  </span>
                </Link>
                <span className="text-xs text-gray-500">
                  {!isLoading && `Last updated: ${formatDate(new Date())}`}
                </span>
              </div>
            </div>
          </div>

          {/* Students Card */}
          <div className="rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100 font-medium">
                    Total Students
                  </p>
                  <h2 className="text-3xl font-bold mt-2 text-white">
                    {isLoading ? (
                      <div className="h-8 w-16 bg-green-400/50 rounded animate-pulse"></div>
                    ) : (
                      students.length
                    )}
                  </h2>
                </div>
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-green-100">
                  Enrolled students across all courses
                </span>
              </div>
            </div>
            <div className="bg-white px-6 py-3">
              <div className="flex justify-between items-center">
                <Link to="/fcc_admin/users">
                  <span className="text-xs font-medium text-green-600 hover:underline">
                    View all students
                  </span>
                </Link>
                <span className="text-xs text-gray-500">
                  {!isLoading && `Last updated: ${formatDate(new Date())}`}
                </span>
              </div>
            </div>
          </div>

          {/* Courses Card */}
          <div className="rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100 font-medium">
                    Total Courses
                  </p>
                  <h2 className="text-3xl font-bold mt-2 text-white">
                    {isLoadingCourses ? (
                      <div className="h-8 w-16 bg-purple-400/50 rounded animate-pulse"></div>
                    ) : (
                      courses.length
                    )}
                  </h2>
                </div>
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-purple-100">
                  Available courses on the platform
                </span>
              </div>
            </div>
            <div className="bg-white px-6 py-3">
              <div className="flex justify-between items-center">
                <Link to="/fcc_admin/resources">
                  <span className="text-xs font-medium text-purple-600 hover:underline">
                    View all courses
                  </span>
                </Link>
                <span className="text-xs text-gray-500">
                  {!isLoading && `Last updated: ${formatDate(new Date())}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-lg font-semibold flex items-center">
              <BellRing className="h-5 w-5 mr-2 text-amber-500" />
              Announcements
            </h2>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Add Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-4 max-w-[calc(100%-2rem)]">
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">
                      Upload Announcement Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer">
                      {previewUrl ? (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Announcement preview"
                            className="max-h-64 mx-auto rounded-md"
                          />
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setPreviewUrl(null);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col items-center">
                              <Image className="h-10 w-10 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">
                                Click to upload an image
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                JPG, JPEG, PNG, GIF (Max 2MB)
                              </p>
                            </div>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">
                      Link (optional)
                    </label>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Add a URL that users will be directed to when clicking the
                      announcement
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    onClick={createAnnouncement}
                    disabled={!selectedImage || isCreatingAnnouncement}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    {isCreatingAnnouncement ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Announcement"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Announcement</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this announcement? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteAnnouncement}
                  disabled={isDeletingAnnouncement}
                >
                  {isDeletingAnnouncement ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                Create a new announcement to display important information to
                users
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
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      {announcement.link && (
                        <a
                          href={
                            announcement.link.startsWith("http")
                              ? announcement.link
                              : `https://${announcement.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 bg-white/90 hover:bg-gray-100"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() =>
                          handleDeleteAnnouncement(announcement._id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
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

export default Dashboard;
