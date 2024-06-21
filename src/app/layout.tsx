import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { auth } from "@clerk/nextjs/server";
import { SyncActiveOrganization } from "./components/SyncActiveOrganization";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId, sessionClaims } = auth();
  return (
  <ClerkProvider>
    <SyncActiveOrganization membership={sessionClaims?.membership } />
    <html lang="en">
      <body className={inter.className }>{children}</body>
    </html></ClerkProvider>
  );
}
