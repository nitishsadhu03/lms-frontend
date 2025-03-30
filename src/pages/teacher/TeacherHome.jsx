import React, { useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Users,
  BookOpen,
  Edit,
  CircleDollarSign,
  ChevronRight,
  FileEdit,
  Wallet,
} from "lucide-react";
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
        <div className="max-w-4xl mx-auto py-12 space-y-8">
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
          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-green-500 flex items-center justify-between flex-col lg:flex-row space-y-4">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100/50 p-3 rounded-full">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Earnings
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  ₹{teacherProfile.totalEarnings || 0}
                </p>
                <p className="text-sm text-gray-600">
                  Your total earnings from classes
                </p>
              </div>
            </div>
            <Link
              to="/fcc_staffroom/class-updates"
              className="flex items-center justify-center space-x-2 px-4 py-2 font-medium text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 ease-in-out group"
            >
              <span>View Details</span>
              <ChevronRight
                size={20}
                className="transform group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-primary flex items-center justify-between flex-col lg:flex-row space-y-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <FileEdit className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Complete Your Class Summary
                </h3>
                <p className="text-sm text-gray-600">
                  Ensure all your class details are up to date
                </p>
              </div>
            </div>
            <Link
              to="/fcc_staffroom/completed-classes"
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary font-medium text-sm text-white rounded-md hover:bg-primary/90 transition duration-300 ease-in-out group"
            >
              <span>Fill Summary</span>
              <ChevronRight
                size={20}
                className="transform group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;
