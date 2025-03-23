import AdminSidebar from "@/components/admin/AdminSidebar";
import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Users,
  BookOpen,
  FileText,
  Shield,
  UserPlus,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import axios from "axios";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const backend_url = import.meta.env.VITE_API_URL;

const Home = () => {
  const adminProfile = useSelector((state) => state.adminAuth.profile);
  console.log(adminProfile);

  const [courses, setCourses] = useState([]);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const [studentForm, setStudentForm] = useState({
    studentId: "",
    name: "",
    email: "",
    age: "",
    password: "",
    parentName: "",
    sex: "",
    courseEnrolled: [],
    profileImage: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [teacherForm, setTeacherForm] = useState({
    teacherId: "",
    name: "",
    email: "",
    age: "",
    password: "",
    sex: "",
    profileImage: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    coursesTaught: [],
  });

  const [adminForm, setAdminForm] = useState({
    adminId: "",
    name: "",
    email: "",
    age: "",
    sex: "",
    profileImage: null,
    password: "",
  });

  const fetchUsers = async () => {
    try {
      const admins = await axiosInstance.get(`${backend_url}/profile/admin`);
      console.log("Admins:", admins.data.users);

      const teachers = await axiosInstance.get(
        `${backend_url}/profile/teacher`
      );
      console.log("Teachers:", teachers.data.users);

      const students = await axiosInstance.get(
        `${backend_url}/profile/student`
      );
      console.log("Students:", students.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCourses = async () => {
    try {
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
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/api/teacher/availabilities/all`
      );
      console.log("availability: ", response.data);

      // Process availability data if needed
      // You might want to format and store this data in state
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch availability data",
        variant: "destructive",
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/all-classes`
      );
      console.log("class: ", response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch class data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchAvailability();
    fetchClasses();
  }, []);

  const handleImageChange = (e, setForm) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (e, setForm) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (formData, type) => {
    try {
      let payload;
      switch (type) {
        case "student":
          payload = {
            studentId: formData.studentId,
            name: formData.name,
            email: formData.email,
            password: formData.password,
            age: formData.age,
            sex: formData.sex,
            parentName: formData.parentName,
            courseEnrolled: formData.courseEnrolled,
            profileImage: formData.profileImage,
            timezone: formData.timezone,
          };
          break;

        case "teacher":
          payload = {
            teacherId: formData.teacherId,
            name: formData.name,
            email: formData.email,
            password: formData.password,
            age: formData.age,
            sex: formData.sex,
            profileImage: formData.profileImage,
            timezone: formData.timezone,
            coursesTaught: formData.coursesTaught,
          };
          break;

        case "admin":
          payload = {
            adminId: formData.adminId,
            name: formData.name,
            email: formData.email,
            password: formData.password,
            age: formData.age,
            sex: formData.sex,
            profileImage: formData.profileImage,
          };
          break;
      }

      console.log(payload);

      let response;
      switch (type) {
        case "student":
          response = await axios.post(
            `${backend_url}/admin/actions/create-student`,
            payload
          );
          setStudentForm({
            studentId: "",
            name: "",
            email: "",
            age: "",
            password: "",
            parentName: "",
            sex: "",
            courseEnrolled: [],
            profileImage: null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
          setStudentModalOpen(false);
          toast({
            title: "Success",
            description: "Student created successfully",
            variant: "success",
          });
          break;

        case "teacher":
          response = await axios.post(
            `${backend_url}/admin/actions/create-teacher`,
            payload
          );
          setTeacherForm({
            teacherId: "",
            name: "",
            email: "",
            age: "",
            password: "",
            sex: "",
            profileImage: null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            coursesTaught: [],
          });
          setTeacherModalOpen(false);
          toast({
            title: "Success",
            description: "Teacher created successfully",
            variant: "success",
          });
          break;

        case "admin":
          response = await axios.post(
            `${backend_url}/admin/actions/create-admin`,
            payload
          );
          setAdminForm({
            adminId: "",
            name: "",
            email: "",
            age: "",
            password: "",
            sex: "",
            profileImage: null,
          });
          setAdminModalOpen(false);
          toast({
            title: "Success",
            description: "Admin created successfully",
            variant: "success",
          });
          break;
      }

      console.log(`Created new ${type}:`, response.data);
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const renderUserForm = (type, form, setForm, modalOpen, setModalOpen) => (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-[425px] max-h-[600px] lg:max-h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create New {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) => handleFormChange(e, setForm)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="id">ID</Label>
              <Input
                id={type + "Id"}
                name={type + "Id"}
                placeholder="Enter ID"
                value={form[type + "Id"]}
                onChange={(e) => handleFormChange(e, setForm)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={(e) => handleFormChange(e, setForm)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="Enter age in years"
                value={form.age}
                onChange={(e) => handleFormChange(e, setForm)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="id">Password</Label>
            <Input
              id="password"
              name="password"
              placeholder="Enter Password"
              value={form.password}
              onChange={(e) => handleFormChange(e, setForm)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sex">Gender</Label>
            <Select
              value={form.sex}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, sex: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "student" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="parentName">Parent Name</Label>
                <Input
                  id="parentName"
                  name="parentName"
                  placeholder="Enter parent name"
                  value={form.parentName}
                  onChange={(e) => handleFormChange(e, setForm)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="courseEnrolled">Course Enrolled</Label>
                <Select
                  value={form.courseEnrolled}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, courseEnrolled: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((courseItem) => (
                      <SelectItem key={courseItem._id} value={courseItem._id}>
                        {courseItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {type === "teacher" && (
            <div className="grid gap-2">
              <Label htmlFor="coursesTaught">Courses Taught</Label>
              <Select
                value={form.coursesTaught}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    coursesTaught: [...prev.coursesTaught, value], // Add selected course
                  }))
                }
                multiple // Allow multiple selections
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select courses taught" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((courseItem) => (
                    <SelectItem key={courseItem._id} value={courseItem._id}>
                      {courseItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Display selected courses */}
              <div className="flex flex-wrap gap-2 mt-2">
                {form.coursesTaught.map((courseId) => {
                  const course = courses.find((c) => c._id === courseId);
                  return (
                    <div
                      key={courseId}
                      className="bg-gray-100 px-2 py-1 rounded-md text-sm"
                    >
                      {course?.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(type === "student" || type === "teacher") && (
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={form.timezone}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, timezone: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {Intl.supportedValuesOf("timeZone").map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="profileImage">Profile Image</Label>
            <Input
              id="profileImage"
              name="profileImage"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setForm)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => handleSubmit(form, type)}>
            Create {type}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full h-full bg-gray-50">
        <h1 className="text-xl font-semibold">Welcome Back, Admin</h1>
        <hr className="my-2" />
        <div className="max-w-4xl mx-auto py-6">
          <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <img
                    src={adminProfile.profileImage || "/assets/pfp.jpg"}
                    alt={adminProfile.name}
                    className="rounded-full w-24 h-24 object-cover border-4 border-white shadow-md"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <CardTitle className="text-2xl font-bold">
                    {adminProfile.name}
                  </CardTitle>
                  <p className="text-indigo-100 mt-1">
                    Admin ID: {adminProfile.adminId}
                  </p>
                </div>
                <Link
                  to="/fcc_admin/edit-profile"
                  className="absolute top-4 right-4 md:static md:mt-0"
                >
                  <div className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition duration-300 ease-in-out">
                    <Edit size={20} className="text-white" />
                  </div>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 border-gray-200">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <Mail className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-700">{adminProfile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="text-gray-700">{adminProfile.age} years</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="text-gray-700 capitalize">
                        {adminProfile.sex}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          <h1 className="font-medium text-lg">Admin Actions</h1>
          <hr className="my-2" />
          <div className="container mx-auto lg:p-6 mt-4 mb-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student Card */}
              <Card className="flex flex-col w-72 shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                <div className="p-6 mx-auto">
                  <img
                    src="/assets/student-icon.png"
                    alt="Students"
                    className="rounded-full w-28 h-28 object-cover border-2 border-gray-200"
                  />
                </div>
                <CardContent className="">
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={() => setStudentModalOpen(true)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Student
                  </Button>
                </CardContent>
              </Card>

              {/* Teacher Card */}
              <Card className="flex flex-col w-72 shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                <div className="p-6 mx-auto">
                  <img
                    src="/assets/teacher-icon.png"
                    alt="Students"
                    className="rounded-full w-28 h-28 object-cover border-2 border-gray-200"
                  />
                </div>
                <CardContent className="">
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={() => setTeacherModalOpen(true)}
                  >
                    <Users className="w-4 h-4" />
                    Create Teacher
                  </Button>
                </CardContent>
              </Card>

              {/* Admin Card */}
              <Card className="flex flex-col w-72 shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                <div className="p-6 mx-auto">
                  <img
                    src="/assets/admin-icon.png"
                    alt="Students"
                    className="rounded-full w-28 h-28 object-cover border-2 border-gray-200"
                  />
                </div>
                <CardContent className="">
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600"
                    onClick={() => setAdminModalOpen(true)}
                  >
                    <Shield className="w-4 h-4" />
                    Create Admin
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        {/* Render Create User Modals */}
        {renderUserForm(
          "student",
          studentForm,
          setStudentForm,
          studentModalOpen,
          setStudentModalOpen
        )}
        {renderUserForm(
          "teacher",
          teacherForm,
          setTeacherForm,
          teacherModalOpen,
          setTeacherModalOpen
        )}
        {renderUserForm(
          "admin",
          adminForm,
          setAdminForm,
          adminModalOpen,
          setAdminModalOpen
        )}
      </div>
    </div>
  );
};

export default Home;
