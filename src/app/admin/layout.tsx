import React from 'react';
import Sidebar from '../components/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="container">
      <Sidebar />
      <div className="flex-1 p-5">
        {children}
      </div>
    </div>
  );
};

export default Layout;