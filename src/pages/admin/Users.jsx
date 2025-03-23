import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Eye, MoreVertical, Search, Timer, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const backend_url = import.meta.env.VITE_API_URL;

const Users = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

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

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Filter teachers based on search input
  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name?.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  // Filter students based on search input
  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 overflow-x-auto w-full min-h-screen bg-gray-50">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Users</h1>
          <Button onClick={fetchUsers} variant="outline" disabled={isLoading}>
            Refresh
          </Button>
        </div>

        <hr className="mt-3 mb-6" />

        <Tabs defaultValue="teachers" className="w-full">
          <TabsList className="grid w-full max-w-screen mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="teachers">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-indigo-100 border-b border-indigo-100">
                <h2 className="text-lg font-medium text-indigo-900 mb-3">
                  Teachers List
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search teachers by name..."
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      className="pl-9 pr-10 py-2"
                    />
                    {teacherSearch && (
                      <button
                        onClick={() => setTeacherSearch("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-indigo-700 whitespace-nowrap">
                    Showing {filteredTeachers.length} of {teachers.length}{" "}
                    teachers
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading teachers data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">S.No.</TableHead>
                        <TableHead>Profile</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teacher ID</TableHead>
                        <TableHead className="text-right w-40">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-gray-500"
                          >
                            {teacherSearch
                              ? "No matching teachers found"
                              : "No teachers found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTeachers.map((teacher, index) => (
                          <TableRow key={teacher.teacherId || index}>
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <Avatar>
                                <AvatarImage
                                  src={teacher.profileImage}
                                  alt={teacher.name}
                                />
                                <AvatarFallback>
                                  {getInitials(teacher.name)}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell>{teacher.name}</TableCell>
                            <TableCell>{teacher.email}</TableCell>
                            <TableCell>{teacher.teacherId}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link
                                      to={`/fcc_admin/users/timetable/${teacher._id}`}
                                      state={{ teacherData: teacher }}
                                      className="w-full"
                                    >
                                      <Timer size={16} className="mr-2" />
                                      View Timetable
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      to={`/fcc_admin/users/classes/${teacher._id}`}
                                      state={{ teacherData: teacher }}
                                      className="w-full"
                                    >
                                      <Calendar size={16} className="mr-2" />
                                      View Classes
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="students">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-emerald-100 border-b border-emerald-100">
                <h2 className="text-lg font-medium text-emerald-900 mb-3">
                  Students List
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search students by name..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-9 pr-10 py-2"
                    />
                    {studentSearch && (
                      <button
                        onClick={() => setStudentSearch("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-emerald-700 whitespace-nowrap">
                    Showing {filteredStudents.length} of {students.length}{" "}
                    students
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading students data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">S.No.</TableHead>
                        <TableHead>Profile</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead className="text-right w-56">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-gray-500"
                          >
                            {studentSearch
                              ? "No matching students found"
                              : "No students found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudents.map((student, index) => (
                          <TableRow key={student.studentId || index}>
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <Avatar>
                                <AvatarImage
                                  src={student.profileImage}
                                  alt={student.name}
                                />
                                <AvatarFallback>
                                  {getInitials(student.name)}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell className="text-right">
                              <Link
                                to={`/fcc_admin/users/enrolled-courses/${student._id}`}
                                state={{ studentData: student }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full md:w-auto whitespace-nowrap"
                                >
                                  <Eye size={16} className="mr-1" />
                                  View Enrolled Courses
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Users;
