import React, { useState } from "react";
import { User, Mail, Calendar, Users, BookOpen, Edit, CircleDollarSign, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const TeacherHome = () => {
  const teacherProfile = useSelector((state) => state.userAuth.profile);
  console.log(teacherProfile);

  return (
    <div className="flex">
      <TeacherSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full min-h-screen bg-gray-50">
        <h1 className="text-xl font-semibold">
          Welcome Back, {teacherProfile.name}
        </h1>
        <hr className="my-2" />
        <div className="max-w-4xl mx-auto py-12">
          <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <img
                    src={teacherProfile.profileImage || "/assets/pfp.jpg"}
                    alt={teacherProfile.name}
                    className="rounded-full w-24 h-24 object-cover border-4 border-white shadow-md"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <CardTitle className="text-2xl font-bold">
                    {teacherProfile.name}
                  </CardTitle>
                  <p className="text-indigo-100 mt-1">
                    Teacher ID: {teacherProfile.teacherId}
                  </p>
                </div>
                <Link
                  to="/fcc_staffroom/edit-profile"
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
                      <p className="text-gray-700">{teacherProfile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="text-gray-700">
                        {teacherProfile.age} years
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
                        {teacherProfile.sex}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Earnings Card - Add this before the profile card */}
          <Card className="bg-white shadow-lg border-2 rounded-xl overflow-hidden my-12">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-4 rounded-full">
                  <CircleDollarSign size={28} color="green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Total Earnings
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{teacherProfile.totalEarnings || 0}
                    </p>
                  </div>
                </div>
                <Link
                  to="/fcc_staffroom/completed-classes"
                  className="mt-4 md:mt-0 px-4 py-2 bg-primary hover:bg-primary/85 text-white rounded-md transition duration-300 ease-in-out flex items-center text-sm font-medium"
                >
                  View Details
                  <ChevronRight size={20} />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;
