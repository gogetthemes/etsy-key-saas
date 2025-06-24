"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const PLAN_LIMITS = {
  FREE: 10,
  PRO: 100,
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [keywordCount, setKeywordCount] = useState(0);

  const user = session?.user as any;
  const userId = user?.id;
  const userPlan = user?.plan || 'FREE';
  const keywordLimit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || 10;

  useEffect(() => {
    if (status === "authenticated" && userId) {
      fetch(`/api/keywords?userId=${userId}`)
        .then(r => r.json())
        .then(data => setKeywordCount(data.length || 0));
    }
  }, [status, userId]);

  if (status === "loading") {
    return <div className="text-center">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center">Redirecting...</div>;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Your Plan</h2>
          <p className="text-3xl font-bold text-blue-600">{userPlan}</p>
          <p className="text-gray-600 mt-2">
            Keywords used: {keywordCount} / {keywordLimit}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(keywordCount / keywordLimit) * 100}%` }}></div>
          </div>
          {userPlan === 'FREE' && (
            <Link href="/upgrade" className="mt-4 inline-block w-full text-center px-4 py-2 rounded-md font-medium text-white bg-green-600 hover:bg-green-700">
              Upgrade to PRO
            </Link>
          )}
        </div>
        {/* Other stats cards can be added here */}
      </div>
    </div>
  );
} 