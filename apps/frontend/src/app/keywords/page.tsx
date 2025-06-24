"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Edit, Trash2, Info, Clock } from 'lucide-react';
import EditKeywordModal from "../components/EditKeywordModal";

const PLAN_LIMITS = {
  FREE: 10,
  PRO: 100,
};

export default function KeywordsPage() {
  const { data: session, status } = useSession();
  const [keywords, setKeywords] = useState<any[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingKeyword, setEditingKeyword] = useState<any | null>(null);
  
  const user = session?.user as any;
  const userId = user?.id;
  const userPlan = user?.plan || 'FREE';
  const keywordLimit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || 10;

  const fetchKeywords = () => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/keywords?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setKeywords(data);
        } else {
          setKeywords([]);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchKeywords();
    }
  }, [status, userId]);

  async function addKeyword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newKeyword) return;
    if (keywords.length >= keywordLimit) {
      setError(`Достигнут лимит ключевых слов (${keywordLimit}) для тарифа ${userPlan}.`);
      return;
    }
    const originalKeywords = keywords;
    setKeywords(prev => [...prev, {id: 'temp', keyword: newKeyword, status: 'pending'}]);
    setNewKeyword("");

    const res = await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, keyword: newKeyword }),
    });

    fetchKeywords(); // Always refetch to get the final state

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ошибка добавления ключа");
      setKeywords(originalKeywords); // Revert on error
    }
  }

  async function deleteKeyword(id: string) {
    if (!confirm('Are you sure you want to delete this keyword?')) return;
    
    const originalKeywords = keywords;
    setKeywords(prev => prev.filter(k => k.id !== id));

    const res = await fetch(`/api/keywords/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      setError('Could not delete keyword. Please try again.');
      setKeywords(originalKeywords); // Revert on error
    }
  }
  
  async function handleSaveKeyword(id: string, newKeyword: string) {
    const originalKeywords = [...keywords];
    
    // Optimistically update UI
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, keyword: newKeyword } : k));
    setEditingKeyword(null);
    
    const res = await fetch(`/api/keywords/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: newKeyword }),
    });

    if (!res.ok) {
      setError('Could not save keyword. Please try again.');
      setKeywords(originalKeywords); // Revert on error
    }
  }

  if (status === "loading") {
    return <div className="text-center">Загрузка...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Keywords Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Keyword</h2>
        <form onSubmit={addKeyword} className="flex gap-2">
          <input 
            value={newKeyword} 
            onChange={e => setNewKeyword(e.target.value)} 
            className="border p-2 rounded-md flex-1 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="e.g., 'handmade leather journal'" 
          />
          <button type="submit" className="bg-blue-600 text-white rounded-md px-6 py-2 hover:bg-blue-700 disabled:bg-blue-300" disabled={!newKeyword || loading}>
            Add
          </button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        <p className="text-sm text-gray-500 mt-2">
          Your plan: <strong>{userPlan}</strong>. Keyword limit: {keywords.length} / {keywordLimit}.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Your Keywords</h2>
        <div className="space-y-3">
          {loading && keywords.length === 0 ? (
            <p>Loading keywords...</p>
          ) : keywords.length > 0 ? (
             keywords.map(k => (
              <div key={k.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span className="font-medium">{k.keyword}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock size={16} className="mr-1 text-yellow-500" />
                    Status: Pending...
                  </span>
                  <Link href={`/keyword/${k.id}`} title="View Details">
                    <Info size={20} className="text-gray-400 hover:text-blue-600" />
                  </Link>
                  <button onClick={() => setEditingKeyword(k)} title="Edit">
                    <Edit size={20} className="text-gray-400 hover:text-green-600" />
                  </button>
                   <button onClick={() => deleteKeyword(k.id)} title="Delete">
                    <Trash2 size={20} className="text-gray-400 hover:text-red-600" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">You haven't added any keywords yet.</p>
          )}
        </div>
      </div>

      {editingKeyword && (
        <EditKeywordModal
          isOpen={!!editingKeyword}
          keyword={editingKeyword}
          onClose={() => setEditingKeyword(null)}
          onSave={handleSaveKeyword}
        />
      )}
    </div>
  );
}
