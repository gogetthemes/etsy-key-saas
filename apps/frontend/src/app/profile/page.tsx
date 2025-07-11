"use client";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {status === 'authenticated' && user?.email
          ? user.email
          : "My Profile (Need sign in)"}
      </h1>
      <p>This is where user profile details will go.</p>
    </div>
  );
} 