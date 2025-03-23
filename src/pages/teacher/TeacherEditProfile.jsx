import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera } from "lucide-react";
import axiosInstance from "@/services/axios";
import { toast } from "@/hooks/use-toast";
import { updateProfile } from "@/store/features/userAuthSlice";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";

const backend_url = import.meta.env.VITE_API_URL;

const TeacherEditProfile = () => {
  const dispatch = useDispatch();
  const teacherProfile = useSelector((state) => state.userAuth.profile);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: teacherProfile.name || "",
    email: teacherProfile.email || "",
    age: teacherProfile.age || "",
    sex: teacherProfile.sex || "",
    teacherId: teacherProfile.teacherId || "",
    profileImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState(teacherProfile.profileImage);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSexChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      sex: value,
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(URL.createObjectURL(file));
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        teacherId: formData.teacherId,
        name: formData.name,
        email: formData.email,
        age: formData.age,
        sex: formData.sex,
        profileImage: formData.profileImage,
      };
      console.log("payload", payload);

      const response = await axiosInstance.put(
        `${backend_url}/admin/actions/teacher/${teacherProfile._id}`,
        payload
      );

      dispatch(updateProfile(response.data.teacher));

      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <TeacherSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full h-full bg-gray-50">
        <h1 className="text-xl font-semibold">Edit Profile</h1>
        <hr className="my-4" />

        <Card className="max-w-4xl mx-auto my-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleImageClick}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute bottom-0 right-0"
                    onClick={handleImageClick}
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Teacher ID */}
              <div className="space-y-2">
                <Label htmlFor="teacherId">Teacher ID</Label>
                <Input
                  id="teacherId"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Sex */}
              <div className="space-y-2">
                <Label>Sex</Label>
                <Select value={formData.sex} onValueChange={handleSexChange}>
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

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                {/* <Button
                  type="button"
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Change Password
                </Button> */}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherEditProfile;
