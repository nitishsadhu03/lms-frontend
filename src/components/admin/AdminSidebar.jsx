import React from 'react'
import Sidebar, { SidebarItem } from "@/components/Sidebar";
import {
  LayoutDashboard,
  Home,
  Layers,
  Calendar,
  Video,
  ShieldCheck,
  NotebookPen,
  FileText,
  User,
} from "lucide-react";
import { useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/fcc_admin') {
      return location.pathname === '/fcc_admin';
    }
    return location.pathname === path;
  };

  return (
    <div className="flex sticky top-0 left-0 h-screen">
        <Sidebar>
          <SidebarItem
            icon={<Home size={20} />}
            text="Home"
            link="/fcc_admin"
            active={isActive('/fcc_admin')}
          />
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            link="/fcc_admin/dashboard" 
            text="Dashboard" 
            active={isActive('/fcc_admin/dashboard')}
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            text="Resources" 
            link="/fcc_admin/resources"
            active={isActive('/fcc_admin/resources')}
          />
          <SidebarItem 
            icon={<Calendar size={20} />} 
            text="Create Class" 
            link="/fcc_admin/create-class"
            active={isActive('/fcc_admin/create-class')}
          />
          <SidebarItem 
            icon={<Layers size={20} />} 
            text="Payment" 
            link="/fcc_admin/payment"
            active={isActive('/fcc_admin/payment')}
          />
          <SidebarItem
            icon={<Video size={20} />}
            text="Upload Class Recording"
            link="/fcc_admin/upload-class-recording"
            active={isActive('/fcc_admin/upload-class-recording')}
          />
          {/* <SidebarItem
            icon={<ShieldCheck size={20} />}
            text="Create Certificate"
            link="/fcc_admin/create-certificate"
            active={isActive('/fcc_admin/create-certificate')}
          /> */}
          <SidebarItem
            icon={<NotebookPen size={20} />}
            text="Create Assignment"
            link="/fcc_admin/create-homework"
            active={isActive('/fcc_admin/create-homework')}
          />
          <SidebarItem
            icon={<User size={20} />}
            text="Users"
            link="/fcc_admin/users"
            active={isActive('/fcc_admin/users')}
          />
        </Sidebar>
      </div>
  )
}

export default AdminSidebar