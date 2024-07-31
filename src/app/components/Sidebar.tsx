'use client'
// import React, { useState } from 'react';
// import SidebarItem from './SidebarItem';
// import SidebarButton from './SidebarButton';

// const Sidebar: React.FC = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const toggleSidebar = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   return (
//     <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed min-h-screen' : 'sidebar-expanded min-h-screen'}`}>
//       <button
//         onClick={toggleSidebar}
//         className="sidebar-toggle"
//       >
//         {isCollapsed ? '>' : '<'}
//       </button>
//       <h2 className={`sidebar-header ${isCollapsed ? 'sidebar-header-hidden' : 'sidebar-header-visible'}`}>
//         perplexity
//       </h2>
//       <SidebarItem name="Home" href="/" isCollapsed={isCollapsed} />
//       <SidebarItem name="Invite Driver" href="admin/adddriver" isCollapsed={isCollapsed} />
//       <SidebarItem name="Drivers" href="admin/drivers" isCollapsed={isCollapsed} />
//       <SidebarButton text="Task" isCollapsed={isCollapsed} />
//     </div>
//   );
// };

// export default Sidebar;

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Ambulance, Calendar, ClipboardList, BarChart2, UserCircle, Settings, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1008); // Adjust breakpoint as needed
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2, href: '/admin/dashboard' },
    { id: 'trips', label: 'Trips', icon: Ambulance, href: '/admin/trips' },
    { id: 'patients', label: 'Patients', icon: Users, href: '/admin/patients' },
    { id: 'drivers', label: 'Drivers', icon: UserCircle, href: '/admin/drivers' },
    { id: 'vehicles', label: 'Vehicles', icon: Ambulance, href: '/admin/vehicles' },
    { id: 'schedules', label: 'Schedules', icon: Calendar, href: '/admin/schedules' },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList, href: '/admin/tasks' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-blue-700 text-center">ADMIN</h1>
      </div>
      <nav className="mt-4 flex-grow">
        {navItems.map((item) => (
          <Link href={item.href} key={item.id} passHref>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start px-4 py-6 text-left text-base",
                pathname === item.href
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden md:block w-64 bg-white shadow-md h-screen">
      <SidebarContent />
    </div>
  );
};

export default Sidebar;