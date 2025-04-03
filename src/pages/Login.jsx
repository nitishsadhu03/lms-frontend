import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  userClearError,
  forgotPassword,
} from "@/store/features/userAuthSlice";

const Login = () => {
  const [credentials, setCredentials] = useState({
    student: { userId: "", password: "" },
    teacher: { userId: "", password: "" },
  });

  const [activeTab, setActiveTab] = useState("student");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (token) {
      navigate(activeTab === "student" ? "/fcc_classroom" : "/fcc_staffroom");
    }
  }, [token, navigate, activeTab]);

  const handleInputChange = (e, userType) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [userType]: { ...prev[userType], [name]: value },
    }));
  };

  const handleForgotPassword = async () => {
    const username = credentials[activeTab].userId;
    if (!username) {
      dispatch(userClearError());
      return;
    }

    try {
      await dispatch(forgotPassword({ username, role: activeTab })).unwrap();
      setResetSent(true);
    } catch (error) {
      console.error("Failed to send reset email:", error);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setShowForgotPassword(false);
    setResetSent(false);
    dispatch(userClearError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const activeCredentials = credentials[activeTab];
    dispatch(
      loginUser({
        userId: activeCredentials.userId,
        password: activeCredentials.password,
        role: activeTab,
      })
    );
  };

  return (
    <div className="relative w-screen h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        {/* Mobile image (shown on small screens) */}
        <img
          src="/assets/login-mobile.png"
          alt="Learning"
          className="w-full h-full object-fill object-top md:hidden"
        />
        {/* Desktop image (shown on medium screens and up) */}
        <img
          src="/assets/login.jpg"
          alt="Learning"
          className="hidden md:block w-full h-full object-cover object-left md:object-center md:object-fill"
        />
      </div>

      {/* Login form container */}
      <div className="absolute inset-0 md:right-0 md:left-auto md:w-1/2 z-10 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white px-6 py-8 rounded-xl shadow-lg bg-opacity-80">
          {resetSent ? (
            <Card className="p-6 border-0 bg-transparent text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Check Your Email
              </h2>
              <p className="text-gray-600">
                We&apos;ve sent a password reset link to the email associated
                with your {activeTab} account.
              </p>
              <p className="text-sm text-gray-500">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
              <Button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSent(false);
                }}
                className="w-full mt-4"
              >
                Back to Login
              </Button>
            </Card>
          ) : showForgotPassword ? (
            <Card className="p-6 border-0 bg-transparent">
              <h2 className="text-2xl font-bold text-center mb-6">
                Reset Password
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {activeTab === "student" ? "Student ID" : "Teacher ID"}
                  </label>
                  <Input
                    type="text"
                    name="userId"
                    value={credentials[activeTab].userId}
                    onChange={(e) => handleInputChange(e, activeTab)}
                    placeholder={`Enter your ${activeTab} ID`}
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={handleForgotPassword}
                  className="w-full"
                  disabled={isLoading || !credentials[activeTab].userId}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8">
                Welcome to FcC
              </h1>

              {error && (
                <div className="text-red-500 text-sm text-center mb-4">
                  {error}
                </div>
              )}

              <Tabs
                defaultValue="student"
                className="w-full mb-6"
                onValueChange={handleTabChange}
              >
                <TabsList className="grid w-full grid-cols-2 bg-gray-200">
                  <TabsTrigger
                    value="student"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Student
                  </TabsTrigger>
                  <TabsTrigger
                    value="teacher"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Teacher
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="student">
                  <Card className="p-6 border-0 bg-transparent">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Student ID
                        </label>
                        <Input
                          type="text"
                          name="userId"
                          value={credentials.student.userId}
                          onChange={(e) => handleInputChange(e, "student")}
                          placeholder="Enter your student ID"
                          className="w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Password
                        </label>
                        <Input
                          type="password"
                          name="password"
                          value={credentials.student.password}
                          onChange={(e) => handleInputChange(e, "student")}
                          placeholder="Enter your password"
                          className="w-full"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Card>
                </TabsContent>

                <TabsContent value="teacher">
                  <Card className="p-6 border-0 bg-transparent">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Teacher ID
                        </label>
                        <Input
                          type="text"
                          name="userId"
                          value={credentials.teacher.userId}
                          onChange={(e) => handleInputChange(e, "teacher")}
                          placeholder="Enter your teacher ID"
                          className="w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Password
                        </label>
                        <Input
                          type="password"
                          name="password"
                          value={credentials.teacher.password}
                          onChange={(e) => handleInputChange(e, "teacher")}
                          placeholder="Enter your password"
                          className="w-full"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="text-center mt-4">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
