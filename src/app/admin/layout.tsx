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
    <div className="w-screen flex h-screen">
    
    <Sidebar />
    <div className=" flex-1 flex flex-col overflow-y-auto">
      
      {children}
      <div className='fixed top-5 right-8 text-white"'>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      </div>
    </div>
   
  </div>
  );
};

export default Layout;