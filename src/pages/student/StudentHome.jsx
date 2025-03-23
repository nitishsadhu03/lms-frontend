import StudentSidebar from "@/components/student/StudentSidebar";
import React, { useEffect, useState } from "react";
import { User, Mail, Calendar, Users, BookOpen, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const backend_url = import.meta.env.VITE_API_URL;

const StudentHome = () => {
  const studentProfile = useSelector((state) => state.userAuth.profile);
  console.log(studentProfile);

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full min-h-screen bg-gray-50">
        <h1 className="text-xl font-semibold">
          Welcome Back, {studentProfile.name}
        </h1>
        <hr className="my-2" />
        <div className="max-w-4xl mx-auto py-12">
          <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <img
                    src={studentProfile.profileImage || "/assets/pfp.jpg"}
                    alt={studentProfile.name}
                    className="rounded-full w-24 h-24 object-cover border-4 border-white shadow-md"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <CardTitle className="text-2xl font-bold">
                    {studentProfile.name}
                  </CardTitle>
                  <p className="text-indigo-100 mt-1">
                    Student ID: {studentProfile.studentId}
                  </p>
                </div>
                <Link
                  to="/fcc_classroom/edit-profile"
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
                      <p className="text-gray-700">{studentProfile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="text-gray-700">
                        {studentProfile.age} years
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="text-gray-700 capitalize">
                        {studentProfile.sex}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
