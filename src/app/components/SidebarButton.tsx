import React from 'react';

interface SidebarButtonProps {
  text: string;
  isCollapsed: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ text, isCollapsed }) => {
  return (
    <button className="sidebar-button">
      <span className={`transition-opacity duration-300 ${isCollapsed ? 'sidebar-item-hidden' : 'sidebar-item-visible'}`}>
        {text}
      </span>
    </button>
  );
};

export default SidebarButton;