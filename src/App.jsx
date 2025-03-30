import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Home from "./pages/admin/Home";
import Resources from "./pages/admin/Resources";
import CreateClass from "./pages/admin/CreateClass";
import Payment from "./pages/admin/Payment";
import ClassRecording from "./pages/admin/ClassRecording";
import CreateCertificate from "./pages/admin/CreateCertificate";
import CreateHomework from "./pages/admin/CreateHomework";
import TeacherHome from "./pages/teacher/TeacherHome";
import StudentHome from "./pages/student/StudentHome";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherResources from "./pages/teacher/TeacherResources";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherTimetable from "./pages/teacher/TeacherTimetable";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentResources from "./pages/student/StudentResources";
import StudentCertifications from "./pages/student/StudentCertifications";
import StudentClasses from "./pages/student/StudentClasses";
import StudentHomework from "./pages/student/StudentHomework";
import TeacherHomework from "./pages/teacher/TeacherHomework";
import TeacherTransaction from "./pages/teacher/TeacherTransaction";
import { Toaster } from "./components/ui/toaster";
import AdminEditProfile from "./pages/admin/AdminEditProfile";
import ClassDetails from "./pages/admin/ClassDetails";
import TeacherEditProfile from "./pages/teacher/TeacherEditProfile";
import StudentEditProfile from "./pages/student/StudentEditProfile";
import StudentTransaction from "./pages/student/StudentTransaction";
import TeacherClassDetails from "./pages/teacher/TeacherClassDetails";
import StudentClassDetails from "./pages/student/StudentClassDetails";
import Users from "./pages/admin/Users";
import Timetables from "./pages/admin/Timetables";
import EnrolledCourses from "./pages/admin/EnrolledCourses";
import StudentClassRecordings from "./pages/student/StudentClassRecordings";
import TeacherClassRecordings from "./pages/teacher/TeacherClassRecordings";
import CreateClassForm from "./pages/admin/CreateClassForm";
import ViewTeacherClasses from "./pages/admin/ViewTeacherClasses";
import TeacherCompletedClasses from "./pages/teacher/TeacherCompletedClasses";
import TeacherClassDipute from "./pages/teacher/TeacherClassDispute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    path: "/fcc_admin",
    element: <Home />,
  },
  {
    path: "/fcc_admin/edit-profile",
    element: <AdminEditProfile />,
  },
  {
    path: "/fcc_admin/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/fcc_admin/resources",
    element: <Resources />,
  },
  {
    path: "/fcc_admin/create-class",
    element: <CreateClass />,
  },
  {
    path: "/fcc_admin/create-class/create",
    element: <CreateClassForm />,
  },
  {
    path: "/fcc_admin/class/:id",
    element: <ClassDetails />,
  },
  {
    path: "/fcc_admin/payment",
    element: <Payment />,
  },
  {
    path: "/fcc_admin/upload-class-recording",
    element: <ClassRecording />,
  },
  {
    path: "/fcc_admin/create-certificate",
    element: <CreateCertificate />,
  },
  {
    path: "/fcc_admin/create-homework",
    element: <CreateHomework />,
  },
  {
    path: "/fcc_admin/users",
    element: <Users />,
  },
  {
    path: "/fcc_admin/users/timetable/:teacherId",
    element: <Timetables />,
  },
  {
    path: "/fcc_admin/users/classes/:teacherId",
    element: <ViewTeacherClasses />,
  },
  {
    path: "/fcc_admin/users/enrolled-courses/:studentId",
    element: <EnrolledCourses />,
  },
  {
    path: "/fcc_staffroom",
    element: <TeacherHome />,
  },
  {
    path: "/fcc_staffroom/edit-profile",
    element: <TeacherEditProfile />,
  },
  {
    path: "/fcc_staffroom/dashboard",
    element: <TeacherDashboard />,
  },
  {
    path: "/fcc_staffroom/resources",
    element: <TeacherResources />,
  },
  {
    path: "/fcc_staffroom/classes",
    element: <TeacherClasses />,
  },
  {
    path: "/fcc_staffroom/class/:id",
    element: <TeacherClassDetails />,
  },
  {
    path: "/fcc_staffroom/timetable",
    element: <TeacherTimetable />,
  },
  {
    path: "/fcc_staffroom/homework",
    element: <TeacherHomework />,
  },
  {
    path: "/fcc_staffroom/transactions",
    element: <TeacherTransaction />,
  },
  {
    path: "/fcc_staffroom/recordings",
    element: <TeacherClassRecordings />,
  },
  {
    path: "/fcc_staffroom/completed-classes",
    element: <TeacherCompletedClasses />,
  },
  {
    path: "/fcc_staffroom/class-updates",
    element: <TeacherClassDipute />,
  },
  {
    path: "/fcc_classroom",
    element: <StudentHome />,
  },
  {
    path: "/fcc_classroom/edit-profile",
    element: <StudentEditProfile />,
  },
  {
    path: "/fcc_classroom/dashboard",
    element: <StudentDashboard />,
  },
  {
    path: "/fcc_classroom/resources",
    element: <StudentResources />,
  },
  {
    path: "/fcc_classroom/certifications",
    element: <StudentCertifications />,
  },
  {
    path: "/fcc_classroom/classes",
    element: <StudentClasses />,
  },
  {
    path: "/fcc_classroom/class/:id",
    element: <StudentClassDetails />,
  },
  {
    path: "/fcc_classroom/homework",
    element: <StudentHomework />,
  },
  {
    path: "/fcc_classroom/transactions",
    element: <StudentTransaction />,
  },
  {
    path: "/fcc_classroom/recordings",
    element: <StudentClassRecordings />,
  },
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
}

export default App;
