/**
 * Root Layout
 * Main layout wrapper with theme provider and global setup
 */

import type { Metadata } from "next";

import Providers from "./provider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "TaskFlow AI - Productivity Assistant",
  description: "Smart goal and task management with AI-powered suggestions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers> {children}</Providers>
      </body>
    </html>
  );
}
