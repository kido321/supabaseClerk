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



import React from 'react';
import Link from 'next/link';
import { useRouter  ,usePathname} from 'next/navigation';
import { Users, Ambulance, Calendar, ClipboardList, BarChart2, UserCircle, Settings } from 'lucide-react';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
console.log(router)
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

  return (
    <div className="w-64 bg-white shadow-md h-screen">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800">NEMT Admin</h1>
      </div>
      <nav className="mt-4">
        {navItems.map((item) => (
          <Link href={item.href} key={item.id}  legacyBehavior>
            <a
              className={`flex items-center w-full px-4 py-2 text-left ${
                pathname === item.href
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            ><item.icon className="mr-2 h-5 w-5" />
              {item.label}
              
            </a>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;