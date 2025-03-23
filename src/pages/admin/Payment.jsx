import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import { Layers, SquarePlus, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";

const backend_url = import.meta.env.VITE_API_URL;

const Payment = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userType: "",
    userId: "",
    date: "",
    receiptImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchTeachers = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/teacher`
      );
      setTeachers(response.data.users);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/student`
      );
      setStudents(response.data.users);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axiosInstance.get(`${backend_url}/profile/payments`);
      console.log("payments: ", response.data.payments)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payments data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchStudents();
    fetchPayments();
  }, []);

  const handleUserTypeChange = (userType) => {
    setFormData((prev) => ({
      ...prev,
      userType,
      userId: "", // Reset user selection when type changes
    }));
  };

  const handleUserChange = (userId) => {
    setFormData((prev) => ({
      ...prev,
      userId,
    }));
  };

  const handleDateChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      date: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({
          ...prev,
          receiptImage: base64String,
        }));
        // For preview
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      userType: "",
      userId: "",
      date: "",
      receiptImage: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (
        !formData.userType ||
        !formData.userId ||
        !formData.date ||
        !formData.receiptImage
      ) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const response = await axiosInstance.post(
        `${backend_url}/admin/actions/create-payment`,
        {
          userType: formData.userType,
          userId: formData.userId,
          date: formData.date,
          receiptImage: formData.receiptImage,
        }
      );

      toast({
        title: "Success",
        description: "Payment receipt has been uploaded successfully",
        variant: "success",
      });

      setIsModalOpen(false);
      resetForm();
      setPreviewUrl(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to upload payment receipt",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full min-h-screen h-full bg-gray-50">
        <h1 className="text-xl font-semibold">Payment</h1>
        <hr className="my-2" />
        <div className="my-16 w-full">
          <Card className="flex flex-col w-64 shadow-[0_3px_10px_rgb(0,0,0,0.2)] mx-auto">
            <div className="p-6 mx-auto">
              <Layers size={70} />
            </div>
            <CardContent className="">
              <Button
                className="w-full bg-primary hover:bg-primary/85"
                onClick={() => setIsModalOpen(true)}
              >
                <SquarePlus className="w-5 h-5" />
                Add Payment Receipt
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upload Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Payment Receipt</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userType">User Type</Label>
                <Select
                  value={formData.userType}
                  onValueChange={handleUserTypeChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.userType && (
                <div className="space-y-2">
                  <Label htmlFor="userId">
                    {formData.userType === "Teacher" ? "Teacher" : "Student"}
                  </Label>
                  <Select
                    value={formData.userId}
                    onValueChange={handleUserChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${formData.userType}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.userType === "Teacher"
                        ? teachers
                        : students
                      ).map((user) => (
                        <SelectItem
                          key={user._id}
                          value={user._id}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                user.profileImage ||
                                (formData.userType === "Teacher"
                                  ? "/assets/teacher-icon.png"
                                  : "/assets/student-icon.png")
                              }
                              alt={user.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="date">Payment Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleDateChange}
                  className="w-fit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptImage">Receipt Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Click to upload receipt image
                    </span>
                    <Input
                      id="receiptImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {previewUrl && (
                  <div className="mt-4">
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="max-h-40 rounded-lg mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setPreviewUrl(null);
                }}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/85"
                onClick={handleSubmit}
              >
                Upload Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Payment;
