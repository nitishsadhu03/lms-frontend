import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginAdmin, forgotAdminPassword, adminClearError } from "@/store/features/adminAuthSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    adminId: '',
    password: '',
  });
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
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

  const handleForgotPassword = async () => {
    if (!credentials.adminId) {
      dispatch(adminClearError());
      return;
    }

    try {
      await dispatch(forgotAdminPassword({ username: credentials.adminId })).unwrap();
      setResetSent(true);
    } catch (error) {
      console.error("Failed to send reset email:", error);
    }
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
            Welcome to FcC
          </h1>

          {resetSent ? (
            <Card className="p-6 lg:p-8 text-center space-y-6">
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
              <h2 className="text-2xl font-bold text-gray-800">Check Your Email</h2>
              <p className="text-gray-600">
                We&apos;ve sent a password reset link to your admin email address.
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
            <Card className="p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
              <div className="space-y-6">
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
                <Button
                  onClick={handleForgotPassword}
                  className="w-full h-12"
                  disabled={isLoading || !credentials.adminId}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full h-12"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          ) : (
            <>
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
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs lg:text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;