'use client';

import { useSession } from "next-auth/react";
import Sidebar from "./components/Sidebar";

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // For pages that don't require auth (like login, signup, landing), show them as is.
  if (status !== 'authenticated') {
    return <>{children}</>;
  }
  
  // For authenticated users, show the main layout with a sidebar.
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
} 