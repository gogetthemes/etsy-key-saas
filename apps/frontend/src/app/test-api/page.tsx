"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function TestApiPage() {
  const { data: session, status } = useSession();
  const [apiResult, setApiResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function testRegister() {
    setLoading(true);
    setApiResult("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: `test+${Date.now()}@example.com`, password: "testpass123" })
      });
      const data = await res.json();
      setApiResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setApiResult(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function testKeywords() {
    setLoading(true);
    setApiResult("");
    try {
      if (!session?.user?.id) {
        setApiResult("Not authenticated, no userId");
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/keywords?userId=${session.user.id}`);
      const data = await res.json();
      setApiResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setApiResult(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test API Connectivity</h1>
      <div className="mb-4">
        <button onClick={testRegister} className="bg-blue-600 text-white rounded px-4 py-2 mr-2" disabled={loading}>
          Test Registration
        </button>
        <button onClick={testKeywords} className="bg-green-600 text-white rounded px-4 py-2" disabled={loading}>
          Test Keywords (auth only)
        </button>
      </div>
      <div className="mb-4">
        <div className="font-bold">Session status: {status}</div>
        <div className="text-xs text-gray-600 break-all">User: {JSON.stringify(session?.user)}</div>
      </div>
      <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto min-h-[80px]">{apiResult}</pre>
    </main>
  );
} 