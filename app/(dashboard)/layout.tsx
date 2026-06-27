/**
 * Dashboard Group Layout
 * Protected layout for dashboard pages with sidebar and navbar
 */

"use client";

import { ReactNode } from "react";
import { Box } from "@mui/material";
import Sidebar from "@/components/common/Sidebar";
import Navbar from "@/components/common/Navbar";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
    <Box className="flex h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <Box component="main" className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </Box>
      </Box>
    </Box>
    </SessionProvider>
  );
}
