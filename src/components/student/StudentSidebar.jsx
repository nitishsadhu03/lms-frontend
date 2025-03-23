import React from "react";
import Sidebar, { SidebarItem } from "@/components/Sidebar";
import {
  LayoutDashboard,
  Home,
  Calendar,
  ShieldCheck,
  NotebookPen,
  FileText,
  Layers,
  Video,
} from "lucide-react";
import { useLocation } from "react-router-dom";

const StudentSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/fcc_classroom") {
      return location.pathname === "/fcc_classroom";
    }
    return location.pathname === path;
  };

  return (
    <div className="flex sticky top-0 left-0 h-screen">
      <Sidebar>
        <SidebarItem
          icon={<Home size={20} />}
          text="Home"
          link="/fcc_classroom"
          active={isActive("/fcc_classroom")}
        />
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          link="/fcc_classroom/dashboard"
          text="Dashboard"
          active={isActive("/fcc_classroom/dashboard")}
        />
        <SidebarItem
          icon={<FileText size={20} />}
          text="Resources"
          link="/fcc_classroom/resources"
          active={isActive("/fcc_classroom/resources")}
        />
        <SidebarItem
          icon={<ShieldCheck size={20} />}
          text="Certifications"
          link="/fcc_classroom/certifications"
          active={isActive("/fcc_classroom/certifications")}
        />
        <SidebarItem
          icon={<Calendar size={20} />}
          text="Classes"
          link="/fcc_classroom/classes"
          active={isActive("/fcc_classroom/classes")}
        />
        <SidebarItem
          icon={<NotebookPen size={20} />}
          text="Assignments"
          link="/fcc_classroom/homework"
          active={isActive("/fcc_classroom/homework")}
        />
        <SidebarItem
          icon={<Layers size={20} />}
          text="Transactions"
          link="/fcc_classroom/transactions"
          active={isActive("/fcc_classroom/transactions")}
        />
        <SidebarItem
          icon={<Video size={20} />}
          text="Class Recordings"
          link="/fcc_classroom/recordings"
          active={isActive("/fcc_classroom/recordings")}
        />
      </Sidebar>
    </div>
  );
};

export default StudentSidebar;
