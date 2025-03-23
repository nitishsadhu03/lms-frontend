import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginAdmin } from "@/store/features/adminAuthSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    adminId: '',
    password: '',
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector((state) => state.adminAuth);

  useEffect(() => {
    if (token) {
      navigate('/fcc_admin');
    }
  }, [token, navigate]);

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginAdmin(credentials));
  };

  return (
    <section>
      <div className="w-full lg:w-screen h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="lg:w-[30%] w-full bg-white lg:p-12 px-4 py-6 rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
          <h1 className="text-xl lg:text-4xl font-bold text-center mb-8 lg:mb-12">
            Welcome to LMS
          </h1>

          <Card className="p-6 lg:p-8">
            <form className="space-y-8" onSubmit={handleSubmit}>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <div>
                <label className="block text-sm lg:text-lg font-medium mb-2">
                  Admin ID
                </label>
                <Input
                  type="text"
                  name="adminId"
                  placeholder="Enter your admin ID"
                  className="w-full h-12"
                  value={credentials.adminId}
                  onChange={handleInputChange}
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
                  value={credentials.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-10 lg:h-12 text-sm lg:text-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Card>

          <div className="text-center mt-4">
            <a
              href="#"
              className="text-xs lg:text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;
