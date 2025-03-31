import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, userClearError } from "@/store/features/userAuthSlice";

const Login = () => {
  const [credentials, setCredentials] = useState({
    student: {
      userId: "",
      password: "",
    },
    teacher: {
      userId: "",
      password: "",
    },
  });

  const [activeTab, setActiveTab] = useState("student");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (token) {
      // Navigate based on role
      navigate(activeTab === "student" ? "/fcc_classroom" : "/fcc_staffroom");
    }
  }, [token, navigate, activeTab]);

  const handleInputChange = (e, userType) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [userType]: {
        ...prev[userType],
        [name]: value,
      },
    }));
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    dispatch(userClearError()); // Clear any existing errors when switching tabs
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
      {/* Full-screen background image with responsive handling */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/login.jpg"
          alt="Learning"
          className="w-full h-full object-cover object-left md:object-center md:object-fill"
        />
      </div>

      {/* Login form container - full width on mobile, half width on desktop */}
      <div className="absolute inset-0 md:right-0 md:left-auto md:w-1/2 z-10 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white px-4 sm:px-6 py-6 sm:py-8 rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-opacity-80 md:bg-opacity-60">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 lg:mb-8">
            Welcome to FcC
          </h1>

          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}

          <Tabs
            defaultValue="student"
            className="w-full mb-4"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-gray-200">
              <TabsTrigger
                value="student"
                className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600"
              >
                Student
              </TabsTrigger>
              <TabsTrigger
                value="teacher"
                className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600"
              >
                Teacher
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <Card className="p-4 sm:p-6 lg:p-8 bg-transparent border-0 shadow-none">
                <form
                  className="space-y-4 sm:space-y-6"
                  onSubmit={handleSubmit}
                >
                  <div>
                    <label className="block text-sm sm:text-base lg:text-lg font-medium mb-2">
                      Student ID
                    </label>
                    <Input
                      type="text"
                      name="userId"
                      placeholder="Enter your student ID"
                      className="w-full h-10 sm:h-12 border-primary border-2 bg-white bg-opacity-60"
                      value={credentials.student.userId}
                      onChange={(e) => handleInputChange(e, "student")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base lg:text-lg font-medium mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      className="w-full h-10 sm:h-12 border-primary border-2 bg-white bg-opacity-60"
                      value={credentials.student.password}
                      onChange={(e) => handleInputChange(e, "student")}
                      required
                    />
                  </div>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="teacher">
              <Card className="p-4 sm:p-6 lg:p-8 bg-transparent border-0 shadow-none">
                <form
                  className="space-y-4 sm:space-y-6"
                  onSubmit={handleSubmit}
                >
                  <div>
                    <label className="block text-sm sm:text-base lg:text-lg font-medium mb-2">
                      Teacher ID
                    </label>
                    <Input
                      type="text"
                      name="userId"
                      placeholder="Enter your teacher ID"
                      className="w-full h-10 sm:h-12 border-primary border-2 bg-white bg-opacity-60"
                      value={credentials.teacher.userId}
                      onChange={(e) => handleInputChange(e, "teacher")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base lg:text-lg font-medium mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      className="w-full h-10 sm:h-12 border-primary border-2 bg-white bg-opacity-60"
                      value={credentials.teacher.password}
                      onChange={(e) => handleInputChange(e, "teacher")}
                      required
                    />
                  </div>
                </form>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleSubmit}
            className="w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base lg:text-lg mt-4 mb-2 sm:mb-4"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
