'use client'
import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import SidebarButton from './SidebarButton';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <button
        onClick={toggleSidebar}
        className="sidebar-toggle"
      >
        {isCollapsed ? '>' : '<'}
      </button>
      <h2 className={`sidebar-header ${isCollapsed ? 'sidebar-header-hidden' : 'sidebar-header-visible'}`}>
        perplexity
      </h2>
      <SidebarItem name="Home" href="/" isCollapsed={isCollapsed} />
      <SidebarItem name="Invite Driver" href="admin/adddriver" isCollapsed={isCollapsed} />
      <SidebarItem name="Drivers" href="admin/drivers" isCollapsed={isCollapsed} />
      <SidebarButton text="Task" isCollapsed={isCollapsed} />
    </div>
  );
};

export default Sidebar;
