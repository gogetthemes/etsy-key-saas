"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Edit, Trash2, Info, Clock } from 'lucide-react';
import EditKeywordModal from "../components/EditKeywordModal";
import { addActionLog } from "../components/Sidebar";

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
    addActionLog("Загрузка ключевых слов", "pending", "Получаем список ключевых слов...");
    
    fetch(`/api/keywords?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setKeywords(data);
          addActionLog("Ключевые слова загружены", "success", `Найдено ${data.length} ключевых слов`);
        } else {
          setKeywords([]);
          addActionLog("Ключевые слова загружены", "success", "Список пуст");
        }
      })
      .catch(err => {
        addActionLog("Ошибка загрузки", "error", "Не удалось загрузить ключевые слова");
        console.error('Error fetching keywords:', err);
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
      const errorMsg = `Достигнут лимит ключевых слов (${keywordLimit}) для тарифа ${userPlan}.`;
      addActionLog("Ошибка добавления", "error", errorMsg);
      setError(errorMsg);
      return;
    }
    
    addActionLog("Добавление ключевого слова", "pending", `Добавляем: "${newKeyword}"`);
    
    const originalKeywords = keywords;
    setKeywords(prev => [...prev, {id: 'temp', keyword: newKeyword, status: 'pending'}]);
    setNewKeyword("");

    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, keyword: newKeyword }),
      });

      if (res.ok) {
        addActionLog("Ключевое слово добавлено", "success", `"${newKeyword}" успешно добавлено`);
        addActionLog("Отправка в n8n", "pending", "Запуск парсинга Etsy...");
        
        // Отправляем в n8n для парсинга
        try {
          const n8nRes = await fetch("/api/n8n/trigger", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyword: newKeyword, userId }),
          });
          
          if (n8nRes.ok) {
            addActionLog("n8n запрос отправлен", "success", "Парсинг запущен");
          } else {
            addActionLog("Ошибка n8n", "error", "Не удалось запустить парсинг");
          }
        } catch (n8nErr) {
          addActionLog("Ошибка n8n", "error", "Сетевая ошибка при отправке в n8n");
        }
      } else {
        const data = await res.json();
        const errorMsg = data.error || "Ошибка добавления ключа";
        addActionLog("Ошибка добавления", "error", errorMsg);
        setError(errorMsg);
        setKeywords(originalKeywords); // Revert on error
      }
    } catch (err) {
      addActionLog("Ошибка сети", "error", "Не удалось добавить ключевое слово");
      setError("Ошибка сети. Попробуйте еще раз.");
      setKeywords(originalKeywords);
    }

    fetchKeywords(); // Always refetch to get the final state
  }

  async function deleteKeyword(id: string) {
    if (!confirm('Вы уверены, что хотите удалить это ключевое слово?')) return;
    
    const keyword = keywords.find(k => k.id === id);
    addActionLog("Удаление ключевого слова", "pending", `Удаляем: "${keyword?.keyword}"`);
    
    const originalKeywords = keywords;
    setKeywords(prev => prev.filter(k => k.id !== id));

    try {
      const res = await fetch(`/api/keywords/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        addActionLog("Ключевое слово удалено", "success", `"${keyword?.keyword}" удалено`);
      } else {
        addActionLog("Ошибка удаления", "error", "Не удалось удалить ключевое слово");
        setError('Не удалось удалить ключевое слово. Попробуйте еще раз.');
        setKeywords(originalKeywords); // Revert on error
      }
    } catch (err) {
      addActionLog("Ошибка сети", "error", "Сетевая ошибка при удалении");
      setError('Ошибка сети. Попробуйте еще раз.');
      setKeywords(originalKeywords);
    }
  }
  
  async function handleSaveKeyword(id: string, newKeyword: string) {
    const originalKeyword = keywords.find(k => k.id === id);
    addActionLog("Редактирование ключевого слова", "pending", `Изменяем: "${originalKeyword?.keyword}" → "${newKeyword}"`);
    
    const originalKeywords = [...keywords];
    
    // Optimistically update UI
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, keyword: newKeyword } : k));
    setEditingKeyword(null);
    
    try {
      const res = await fetch(`/api/keywords/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword }),
      });

      if (res.ok) {
        addActionLog("Ключевое слово обновлено", "success", `"${newKeyword}" сохранено`);
      } else {
        addActionLog("Ошибка обновления", "error", "Не удалось сохранить изменения");
        setError('Не удалось сохранить ключевое слово. Попробуйте еще раз.');
        setKeywords(originalKeywords); // Revert on error
      }
    } catch (err) {
      addActionLog("Ошибка сети", "error", "Сетевая ошибка при обновлении");
      setError('Ошибка сети. Попробуйте еще раз.');
      setKeywords(originalKeywords);
    }
  }

  if (status === "loading") {
    return <div className="text-center">Загрузка...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Управление ключевыми словами</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Добавить новое ключевое слово</h2>
        <form onSubmit={addKeyword} className="flex gap-2">
          <input 
            value={newKeyword} 
            onChange={e => setNewKeyword(e.target.value)} 
            className="border p-2 rounded-md flex-1 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="например, 'handmade leather journal'" 
          />
          <button type="submit" className="bg-blue-600 text-white rounded-md px-6 py-2 hover:bg-blue-700 disabled:bg-blue-300" disabled={!newKeyword || loading}>
            Добавить
          </button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        <p className="text-sm text-gray-500 mt-2">
          Ваш тариф: <strong>{userPlan}</strong>. Лимит ключевых слов: {keywords.length} / {keywordLimit}.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Ваши ключевые слова</h2>
        <div className="space-y-3">
          {loading && keywords.length === 0 ? (
            <p>Загрузка ключевых слов...</p>
          ) : keywords.length > 0 ? (
             keywords.map(k => (
              <div key={k.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span className="font-medium">{k.keyword}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock size={16} className="mr-1 text-yellow-500" />
                    Статус: Обработка...
                  </span>
                  <Link href={`/keyword/${k.id}`} title="Просмотр деталей">
                    <Info size={20} className="text-gray-400 hover:text-blue-600" />
                  </Link>
                  <button onClick={() => setEditingKeyword(k)} title="Редактировать">
                    <Edit size={20} className="text-gray-400 hover:text-green-600" />
                  </button>
                   <button onClick={() => deleteKeyword(k.id)} title="Удалить">
                    <Trash2 size={20} className="text-gray-400 hover:text-red-600" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Вы еще не добавили ни одного ключевого слова.</p>
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
