import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  BookOpen,
  Eye,
  Filter,
  Loader2,
  MoreVertical,
  NotebookPen,
  Pencil,
  SquarePlus,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const backend_url = import.meta.env.VITE_API_URL;

const HomeworkForm = ({
  onSubmit,
  formData,
  handleInputChange,
  handleCourseChange,
  handleTypeChange, // Add handleTypeChange prop
  courses,
  selectedHomework,
  setIsCreateModalOpen,
  setIsEditModalOpen,
  resetForm,
  isCreating,
  isEditing,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter homework title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter homework description"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="course">Course</Label>
        <Select
          value={formData.course}
          onValueChange={handleCourseChange}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem
                key={course._id}
                value={course._id}
                className="cursor-pointer"
              >
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={handleTypeChange} // Use handleTypeChange
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Homework">Homework</SelectItem>
            <SelectItem value="Classwork">Classwork</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="homeworkLink">Assignment Link</Label>
        <Input
          id="homeworkLink"
          name="homeworkLink"
          value={formData.homeworkLink}
          onChange={handleInputChange}
          placeholder="Enter homework link"
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (selectedHomework) {
              setIsEditModalOpen(false);
            } else {
              setIsCreateModalOpen(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isCreating || isEditing}>
          {isCreating || isEditing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {selectedHomework ? "Saving..." : "Creating..."}
            </div>
          ) : selectedHomework ? (
            "Save"
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </form>
  );
};

const CreateHomework = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [homeworks, setHomeworks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    homeworkLink: "",
    type: "Homework",
  });
  const [filteredHomeworks, setFilteredHomeworks] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [homeworkCourses, setHomeworkCourses] = useState([]);

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const response = await axiosInstance.get(
        `${backend_url}/profile/courses`
      );
      const fetchedCourses = response.data.courses;
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchHomeworks = async () => {
    try {
      const response = await axiosInstance.get(
        `${backend_url}/profile/homeworks`
      );
      const homeworkData = response.data.data || [];
      setHomeworks(homeworkData);
      setFilteredHomeworks(homeworkData);

      // Extract unique courses from homeworks
      const uniqueCourses = [
        ...new Set(
          homeworkData
            .filter((hw) => hw.course && hw.course._id)
            .map((hw) =>
              JSON.stringify({ id: hw.course._id, name: hw.course.name })
            )
        ),
      ];

      setHomeworkCourses(uniqueCourses.map((course) => JSON.parse(course)));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchHomeworks();
  }, []);

  useEffect(() => {
    // Filter homeworks based on selected course and type
    let filtered = homeworks;

    // Filter by course
    if (selectedCourse !== "all") {
      filtered = filtered.filter(
        (homework) => homework.course && homework.course._id === selectedCourse
      );
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((homework) => homework.type === selectedType);
    }

    setFilteredHomeworks(filtered);
  }, [selectedCourse, selectedType, homeworks]);

  const resetFilters = () => {
    setSelectedCourse("all");
    setSelectedType("all");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      course: value,
    }));
  };

  const handleTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handleEdit = (homework) => {
    setSelectedHomework(homework);
    setFormData({
      title: homework.title,
      description: homework.description,
      course: homework.course._id, // Update to use course._id
      homeworkLink: homework.homeworkLink,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (homework) => {
    setSelectedHomework(homework);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(
        `${backend_url}/admin/actions/delete-homework/${selectedHomework._id}`
      );

      // Update the local state to remove the deleted homework
      setHomeworks((prev) =>
        prev.filter((homework) => homework._id !== selectedHomework._id)
      );

      toast({
        title: "Success",
        description: "Assignment has been deleted successfully",
        variant: "success",
      });

      setIsDeleteModalOpen(false);
      setSelectedHomework(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete homework",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const validatedLink = formData.homeworkLink.startsWith("http")
        ? formData.homeworkLink
        : `https://${formData.homeworkLink}`;

      const submissionData = {
        title: formData.title,
        description: formData.description,
        course: formData.course,
        homeworkLink: validatedLink,
        type: formData.type, // Include type
      };

      const response = await axiosInstance.post(
        `${backend_url}/admin/actions/create-homework`,
        submissionData
      );

      toast({
        title: "Success",
        description: `${formData.title} has been created`,
        variant: "success",
      });

      fetchHomeworks();
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Assignment creation failed",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      const validatedLink = formData.homeworkLink.startsWith("http")
        ? formData.homeworkLink
        : `https://${formData.homeworkLink}`;

      const submissionData = {
        title: formData.title,
        description: formData.description,
        course: formData.course,
        homeworkLink: validatedLink,
        type: formData.type, // Include type
      };

      await axiosInstance.put(
        `${backend_url}/admin/actions/edit-homework/${selectedHomework._id}`,
        submissionData
      );

      setHomeworks((prev) =>
        prev.map((homework) =>
          homework._id === selectedHomework._id
            ? {
                ...homework,
                title: formData.title,
                description: formData.description,
                course: {
                  ...homework.course,
                  _id: formData.course,
                  name:
                    courses.find((c) => c._id === formData.course)?.name ||
                    homework.course.name,
                },
                homeworkLink: validatedLink,
                type: formData.type, // Update type
              }
            : homework
        )
      );

      toast({
        title: "Success",
        description: `${formData.title} has been updated`,
        variant: "success",
      });

      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      course: "",
      homeworkLink: "",
      type: "Homework",
    });
    setSelectedHomework(null);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 overflow-x-hidden min-h-screen w-screen lg:w-full h-full bg-gray-50">
        <h1 className="text-xl font-semibold">Create Assignment</h1>
        <hr className="my-2" />
        <div className="my-8 w-full">
          <Card className="flex flex-col w-64 shadow-[0_3px_10px_rgb(0,0,0,0.2)] mx-auto">
            <div className="p-6 mx-auto">
              <NotebookPen size={70} />
            </div>
            <CardContent>
              <Button
                className="w-full bg-primary hover:bg-primary/85"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <SquarePlus className="w-5 h-5" />
                Create Assignment
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <HomeworkForm
              onSubmit={handleSubmit}
              formData={formData}
              handleInputChange={handleInputChange}
              handleCourseChange={handleCourseChange}
              handleTypeChange={handleTypeChange}
              courses={courses}
              selectedHomework={selectedHomework}
              setIsCreateModalOpen={setIsCreateModalOpen}
              setIsEditModalOpen={setIsEditModalOpen}
              resetForm={resetForm}
              isCreating={isCreating}
              isEditing={isEditing}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
            </DialogHeader>
            <HomeworkForm
              onSubmit={handleEditSubmit}
              formData={formData}
              handleInputChange={handleInputChange}
              handleCourseChange={handleCourseChange}
              handleTypeChange={handleTypeChange}
              courses={courses}
              selectedHomework={selectedHomework}
              setIsCreateModalOpen={setIsCreateModalOpen}
              setIsEditModalOpen={setIsEditModalOpen}
              resetForm={resetForm}
              isCreating={isCreating}
              isEditing={isEditing}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Assignment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedHomework?.title}
                &quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedHomework(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <h1 className="text-lg font-medium">Recently Created Assignments</h1>
        <hr className="my-2" />

        {/* Filter Section */}
        <div className="my-4 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={16} className="text-primary" />
            <h2 className="text-sm font-medium">Filter Assignment</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-72">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Courses</SelectItem>
                    {homeworkCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Add this new select for type filtering */}
            <div className="w-full sm:w-72">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Homework">Homework</SelectItem>
                    <SelectItem value="Classwork">Classwork</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Update the clear filter button to clear both filters */}
            {(selectedCourse !== "all" || selectedType !== "all") && (
              <Button
                variant="ghost"
                className="self-end"
                onClick={resetFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {filteredHomeworks.length === 0 ? (
          <p className="mt-8 text-center text-gray-500">
            {homeworks.length === 0
              ? "No Assignment Available"
              : "No assignment matches the selected filter"}
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 my-6">
            {filteredHomeworks.map((h) => (
              <Card key={h._id} className="max-w-sm shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {h.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <BookOpen className="mr-1" size={14} />
                          <span>{h.course?.name || "No Course"}</span>
                          <span className="mx-1">•</span>
                          <span>{h.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={h.homeworkLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Eye
                            className="text-gray-600 hover:text-primary"
                            size={20}
                          />
                        </a>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical
                                className="text-gray-600"
                                size={20}
                              />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleEdit(h)}
                            >
                              <Pencil className="mr-2" size={16} />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(h)}
                            >
                              <Trash2 className="mr-2" size={16} />
                              Delete
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 font-medium">
                        {h.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateHomework;
