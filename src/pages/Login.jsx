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
      userId: '',
      password: ''
    },
    teacher: {
      userId: '',
      password: ''
    }
  });
  
  const [activeTab, setActiveTab] = useState("student");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (token) {
      // Navigate based on role
      navigate(activeTab === 'student' ? '/fcc_classroom' : '/fcc_staffroom');
    }
  }, [token, navigate, activeTab]);

  const handleInputChange = (e, userType) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [userType]: {
        ...prev[userType],
        [name]: value
      }
    }));
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    dispatch(userClearError()); // Clear any existing errors when switching tabs
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const activeCredentials = credentials[activeTab];
    dispatch(loginUser({
      userId: activeCredentials.userId,
      password: activeCredentials.password,
      role: activeTab
    }));
  };

  return (
    <div className="w-screen h-screen flex bg-gray-50">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 h-full">
        <img
          src="/assets/login-screen.jpg"
          alt="Learning"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 h-full bg-gray-100 flex items-center justify-center px-6">
        <div className="lg:w-[75%] w-full bg-white lg:p-12 px-4 py-6 rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
          <h1 className="text-xl lg:text-4xl font-bold text-center mb-8 lg:mb-12">
            Welcome to LMS
          </h1>

          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}

          <Tabs 
            defaultValue="student" 
            className="w-full mb-4 lg:mb-8"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 lg:mb-8">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <Card className="p-6 lg:p-8">
                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm lg:text-lg font-medium mb-2">
                      Student ID
                    </label>
                    <Input
                      type="text"
                      name="userId"
                      placeholder="Enter your student ID"
                      className="w-full h-12"
                      value={credentials.student.userId}
                      onChange={(e) => handleInputChange(e, 'student')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm lg:text-lg font-medium mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      className="w-full h-12"
                      value={credentials.student.password}
                      onChange={(e) => handleInputChange(e, 'student')}
                      required
                    />
                  </div>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="teacher">
              <Card className="p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm lg:text-lg font-medium mb-2">
                      Teacher ID
                    </label>
                    <Input
                      type="text"
                      name="userId"
                      placeholder="Enter your teacher ID"
                      className="w-full h-12"
                      value={credentials.teacher.userId}
                      onChange={(e) => handleInputChange(e, 'teacher')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm lg:text-lg font-medium mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      className="w-full h-12"
                      value={credentials.teacher.password}
                      onChange={(e) => handleInputChange(e, 'teacher')}
                      required
                    />
                  </div>
                </form>
              </Card>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={handleSubmit}
            className="w-full h-10 lg:h-12 text-sm lg:text-lg mb-4 lg:mb-6"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          {/* <div className="text-center">
            <a
              href="#"
              className="text-xs lg:text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
