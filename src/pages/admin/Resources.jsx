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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Eye,
  SquarePlus,
  Trash2,
  Pencil,
  MoreVertical,
  GraduationCap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/services/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BACKEND_URL = import.meta.env.VITE_API_URL;

const ResourceForm = ({
  formData,
  handleInputChange,
  handleCourseChange,
  onSubmit,
  isLoading,
  selectedResource,
  courses,
}) => (
  <div className="space-y-4 py-4">
    <div className="space-y-2">
      <Label htmlFor="title">Resource Title</Label>
      <Input
        id="title"
        name="title"
        placeholder="Enter resource title"
        value={formData.title}
        onChange={handleInputChange}
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
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a course" />
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
      <Label htmlFor="visualAid">Visual Aid Link</Label>
      <Input
        id="visualAid"
        name="visualAid"
        placeholder="Enter link"
        value={formData.visualAid}
        onChange={handleInputChange}
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="lessonPlan">Lesson Plan Link</Label>
      <Input
        id="lessonPlan"
        name="lessonPlan"
        placeholder="Enter link"
        value={formData.lessonPlan}
        onChange={handleInputChange}
        required
      />
    </div>

    <DialogFooter>
      <Button
        className="w-full bg-primary hover:bg-primary/85"
        onClick={onSubmit}
        disabled={isLoading}
      >
        {selectedResource ? "Save Changes" : "Create Resource"}
      </Button>
    </DialogFooter>
  </div>
);

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [filteredResources, setFilteredResources] = useState([]);
  const [capitalizedCourse, setCapitalizedCourse] = useState("All Courses");
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    visualAid: "",
    lessonPlan: "",
  });
  const [newCourseData, setNewCourseData] = useState({
    name: "",
    sessions: "",
  });

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editCourseData, setEditCourseData] = useState({
    name: "",
    numberOfSessions: "",
  });

  const fectchResources = async () => {
    try {
      const response = await axiosInstance.get(
        `${BACKEND_URL}/profile/resources`
      );
      console.log(response.data.resources);
      const fetchedResources = response.data.resources.map((resource) => ({
        id: resource._id,
        title: resource.title,
        visualAid: resource.visualAid,
        lessonPlan: resource.lessonPlan,
        course: resource.course ? resource.course.name : "No Course Assigned",
      }));
      setResources(fetchedResources);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const response = await axiosInstance.get(
        `${BACKEND_URL}/profile/courses`
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

  useEffect(() => {
    fetchCourses();
    fectchResources();
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleNewCourseInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseChange = useCallback((value) => {
    setFormData((prev) => ({
      ...prev,
      course: value,
    }));
  }, []);

  const handleEdit = (resource) => {
    const courseObject = courses.find(
      (course) => course.name.toLowerCase() === resource.course.toLowerCase()
    );

    setSelectedResource(resource);
    setFormData({
      title: resource.title,
      course: courseObject?._id || "",
      visualAid: resource.visualAid,
      lessonPlan: resource.lessonPlan,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (resource) => {
    setSelectedResource(resource);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      const response = await axiosInstance.delete(
        `${BACKEND_URL}/admin/actions/delete-resource/${selectedResource.id}`
      );

      // Remove the resource from the resources state
      setResources((prev) =>
        prev.filter((item) => item.id !== selectedResource.id)
      );

      // Remove from filtered resources if present
      setFilteredResources((prev) =>
        prev.filter((item) => item.id !== selectedResource.id)
      );

      toast({
        title: "Success",
        description: "Resource deleted successfully",
        variant: "success",
      });

      setIsDeleteModalOpen(false);
      setSelectedResource(null);
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete resource",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // window.location.reload();
    }
  };

  // create resource
  const handleSubmit = async () => {
    if (
      !formData.visualAid.startsWith("http://") &&
      !formData.visualAid.startsWith("https://")
    ) {
      formData.visualAid = "https://" + formData.visualAid;
    }

    if (
      !formData.lessonPlan.startsWith("http://") &&
      !formData.lessonPlan.startsWith("https://")
    ) {
      formData.lessonPlan = "https://" + formData.lessonPlan;
    }
    try {
      setIsLoading(true);
      console.log(formData);
      const response = await axiosInstance.post(
        "/admin/actions/create-resource",
        {
          title: formData.title,
          courseId: formData.course,
          visualAid: formData.visualAid,
          lessonPlan: formData.lessonPlan,
        }
      );

      console.log(response);

      const selectedCourse = courses.find((c) => c._id === formData.course);
      const courseName = selectedCourse
        ? selectedCourse.name.toLowerCase()
        : "";

      const newResource = {
        id: response.data.resource._id,
        title: formData.title,
        course: courseName,
        visualAid: formData.visualAid,
        lessonPlan: formData.lessonPlan,
      };

      setResources((prev) => [...prev, newResource]);
      if (newResource.course === course) {
        setFilteredResources((prev) => [...prev, newResource]);
      }

      toast({
        title: "Success",
        description: "Resource created successfully",
        variant: "success",
      });

      resetForm();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating resource:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create resource",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // window.location.reload();
    }
  };

  // edit resource
  const handleEditSubmit = async () => {
    // Add URL prefix if missing for both visualAid and lessonPlan
    if (
      !formData.visualAid.startsWith("http://") &&
      !formData.visualAid.startsWith("https://")
    ) {
      formData.visualAid = "https://" + formData.visualAid;
    }

    if (
      !formData.lessonPlan.startsWith("http://") &&
      !formData.lessonPlan.startsWith("https://")
    ) {
      formData.lessonPlan = "https://" + formData.lessonPlan;
    }

    try {
      setIsLoading(true);

      const response = await axiosInstance.put(
        `${BACKEND_URL}/admin/actions/edit-resource/${selectedResource.id}`,
        {
          title: formData.title,
          courseId: formData.course,
          visualAid: formData.visualAid,
          lessonPlan: formData.lessonPlan,
        }
      );

      const selectedCourse = courses.find((c) => c._id === formData.course);
      const courseName = selectedCourse
        ? selectedCourse.name.toLowerCase()
        : "";

      const updatedResource = {
        ...selectedResource,
        title: formData.title,
        course: courseName,
        visualAid: formData.visualAid,
        lessonPlan: formData.lessonPlan,
      };

      setResources((prev) =>
        prev.map((item) =>
          item.id === selectedResource.id ? updatedResource : item
        )
      );

      // Update filtered resources if the resource is in the current filter
      if (course === updatedResource.course) {
        setFilteredResources((prev) =>
          prev.map((item) =>
            item.id === selectedResource.id ? updatedResource : item
          )
        );
      } else {
        setFilteredResources((prev) =>
          prev.filter((item) => item.id !== selectedResource.id)
        );
      }

      toast({
        title: "Success",
        description: "Resource updated successfully",
        variant: "success",
      });

      resetForm();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating resource:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update resource",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // create course
  const handleNewCourseSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        `${BACKEND_URL}/admin/actions/create-course`,
        {
          name: newCourseData.name,
          numberOfSessions: parseInt(newCourseData.sessions),
        }
      );

      toast({
        variant: "success",
        title: "Success",
        description: "Course created successfully",
      });

      // courseNames.push(newCourseData.name.toLowerCase());

      setNewCourseData({ name: "", sessions: "" });
      setIsCourseModalOpen(false);
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      window.location.reload();
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setEditCourseData({
      name: course.name,
      numberOfSessions: course.numberOfSessions.toString(),
    });
    setIsEditCourseModalOpen(true);
  };

  const handleEditCourseInputChange = (e) => {
    const { name, value } = e.target;
    setEditCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditCourseSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.put(
        `${BACKEND_URL}/admin/actions/edit-course/${selectedCourse._id}`,
        {
          name: editCourseData.name,
          numberOfSessions: parseInt(editCourseData.numberOfSessions),
        }
      );

      toast({
        variant: "success",
        title: "Success",
        description: "Course updated successfully",
      });

      // Refresh the courses list
      await fetchCourses();
      setIsEditCourseModalOpen(false);
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExistingCourseChange = (value) => {
    setCourse(value);
  };

  const handleFilter = () => {
    if (!course) {
      setFilteredResources(resources);
      setCapitalizedCourse("All Courses");
    } else {
      const filtered = resources.filter(
        (resource) =>
          (resource.course && resource.course.toLowerCase() === course) ||
          (!resource.course && course === "no course assigned")
      );
      setFilteredResources(filtered);
      setCapitalizedCourse(course.charAt(0).toUpperCase() + course.slice(1));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      course: "",
      visualAid: "",
      lessonPlan: "",
    });
    setSelectedResource(null);
  };

  // const capitalizedCourse = course.charAt(0).toUpperCase() + course.slice(1);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 overflow-x-hidden w-screen lg:w-full min-h-screen h-full bg-gray-50">
        <h1 className="text-xl font-semibold">Resources</h1>
        <hr className="my-2" />
        <div className="my-8 w-full flex flex-col lg:flex-row gap-8 items-center mb-12">
          <Card className="flex flex-col w-64 shadow-[0_3px_10px_rgb(0,0,0,0.2)] mx-auto">
            <div className="p-6 mx-auto">
              <FileText size={70} />
            </div>
            <CardContent className="">
              <Button
                className="w-full bg-primary hover:bg-primary/85"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <SquarePlus className="w-5 h-5" />
                Create Resource
              </Button>
            </CardContent>
          </Card>
          <Card className="flex flex-col w-64 shadow-[0_3px_10px_rgb(0,0,0,0.2)] mx-auto">
            <div className="p-6 mx-auto">
              <GraduationCap size={70} />
            </div>
            <CardContent className="">
              <Button
                className="w-full bg-primary hover:bg-primary/85"
                onClick={() => setIsCourseModalOpen(true)}
              >
                <SquarePlus className="w-5 h-5" />
                Create Course
              </Button>
            </CardContent>
          </Card>
        </div>
        {/* Create Resource Modal */}
        <Dialog
          open={isCreateModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              resetForm();
            }
            setIsCreateModalOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Resource</DialogTitle>
            </DialogHeader>
            <ResourceForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleCourseChange={handleCourseChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              selectedResource={selectedResource}
              courses={courses}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Resource Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
            </DialogHeader>
            <ResourceForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleCourseChange={handleCourseChange}
              onSubmit={handleEditSubmit}
              isLoading={isLoading}
              selectedResource={selectedResource}
              courses={courses}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Resource</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedResource?.title}
                &quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedResource(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Course Modal */}
        <Dialog
          open={isCourseModalOpen}
          onOpenChange={setIsCourseModalOpen}
          className="mx-2"
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                Create New Course
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter course name"
                  value={newCourseData.name}
                  onChange={handleNewCourseInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessions">Number Of Sessions</Label>
                <Input
                  id="sessions"
                  name="sessions"
                  type="number"
                  placeholder="Enter number of sessions in the course"
                  value={newCourseData.sessions}
                  onChange={handleNewCourseInputChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                className="w-full bg-primary hover:bg-primary/85"
                onClick={handleNewCourseSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Course"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <h1 className="text-lg font-medium">Recently Created Resources</h1>
        <hr className="my-2" />
        <div className="my-6">
          <h1 className="text-lg font-medium mb-3">Select Course</h1>
          <div className="flex gap-6">
            <div className="w-72">
              <Select value={course} onValueChange={handleExistingCourseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((courseItem) => (
                    <SelectItem
                      key={courseItem._id}
                      value={courseItem.name.toLowerCase()}
                    >
                      {courseItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleFilter}>Apply Filter</Button>
          </div>

          <h2 className="text-gray-600 mt-8 mb-4">
            Showing results for {capitalizedCourse}
          </h2>

          {/* Resource Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredResources.map((resource, index) => (
              <Card
                key={index}
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-500" size={24} />
                      <h3 className="font-medium">{resource.title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="text-gray-600" size={20} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleEdit(resource)}
                          >
                            <Pencil className="mr-2" size={16} />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(resource)}
                          >
                            <Trash2 className="mr-2" size={16} />
                            Delete
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              No resources found for this course.
            </div>
          )}
        </div>
        <hr className="my-6" />
        <div className="mt-12">
          <h1 className="text-lg font-medium">All Courses</h1>
          <hr className="mt-2 mb-4" />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">S.No.</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Number of Sessions</TableHead>
                  <TableHead className="text-right">Edit Course</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course, index) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.numberOfSessions}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          className="rounded-full bg-transparent hover:bg-gray-200 text-primary"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog
          open={isEditCourseModalOpen}
          onOpenChange={setIsEditCourseModalOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Course Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editCourseData.name}
                  onChange={handleEditCourseInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sessions">Number of Sessions</Label>
                <Input
                  id="edit-sessions"
                  name="numberOfSessions"
                  type="number"
                  value={editCourseData.numberOfSessions}
                  onChange={handleEditCourseInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditCourseSubmit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Resources;
