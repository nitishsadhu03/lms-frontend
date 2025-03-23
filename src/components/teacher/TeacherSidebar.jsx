import React from "react";
import Sidebar, { SidebarItem } from "@/components/Sidebar";
import {
  LayoutDashboard,
  Home,
  Calendar,
  FileText,
  Timer,
  NotebookPen,
  Layers,
  Video,
} from "lucide-react";
import { useLocation } from "react-router-dom";

const TeacherSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/fcc_staffroom") {
      return location.pathname === "/fcc_staffroom";
    }
    return location.pathname === path;
  };

  return (
    <div className="flex sticky top-0 left-0 h-screen">
      <Sidebar>
        <SidebarItem
          icon={<Home size={20} />}
          text="Home"
          link="/fcc_staffroom"
          active={isActive("/fcc_staffroom")}
        />
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          link="/fcc_staffroom/dashboard"
          text="Dashboard"
          active={isActive("/fcc_staffroom/dashboard")}
        />
        <SidebarItem
          icon={<FileText size={20} />}
          text="Resources"
          link="/fcc_staffroom/resources"
          active={isActive("/fcc_staffroom/resources")}
        />
        <SidebarItem
          icon={<Calendar size={20} />}
          text="Classes"
          link="/fcc_staffroom/classes"
          active={isActive("/fcc_staffroom/classes")}
        />
        <SidebarItem
          icon={<Timer size={20} />}
          text="Timetable"
          link="/fcc_staffroom/timetable"
          active={isActive("/fcc_staffroom/timetable")}
        />
        <SidebarItem
          icon={<NotebookPen size={20} />}
          text="Assignments"
          link="/fcc_staffroom/homework"
          active={isActive("/fcc_staffroom/homework")}
        />
        <SidebarItem
          icon={<Layers size={20} />}
          text="Transactions"
          link="/fcc_staffroom/transactions"
          active={isActive("/fcc_staffroom/transactions")}
        />
        <SidebarItem
          icon={<Video size={20} />}
          text="Class Recordings"
          link="/fcc_staffroom/recordings"
          active={isActive("/fcc_staffroom/recordings")}
        />
      </Sidebar>
    </div>
  );
};

export default TeacherSidebar;
