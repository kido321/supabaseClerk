import React from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from "@/component/ui/themeprovider"
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="w-screen h-screen flex">
    
    <Sidebar />
    <div className="bg-gray-800 flex-1 flex flex-col dark">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      {children}
    </div>
   
  </div>
  );
};

export default Layout;