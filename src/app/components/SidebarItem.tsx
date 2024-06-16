import React from 'react';
import Link from 'next/link';

interface SidebarItemProps {
  name: string;
  href: string;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> =  ({ name, href, isCollapsed }) => {
  return (
    <Link href={href} legacyBehavior>
      <a className="sidebar-item">
        <span className={`transition-opacity duration-300 ${isCollapsed ? 'sidebar-item-hidden' : 'sidebar-item-visible'}`}>
          {name}
        </span>
      </a>
    </Link>
  );
};

export default SidebarItem;