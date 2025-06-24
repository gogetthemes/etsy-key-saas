"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import { debounce } from "lodash";
import Link from "next/link";

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSuggestions = useCallback(
    debounce(async (q: string) => {
      setLoading(true);
      setError('');
      setSuggestions([]);
      if (!q) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/etsy-suggest?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          if (!data.suggestions || data.suggestions.length === 0) {
            setError('Подсказки не найдены.');
          }
        } else {
          console.error("Failed to fetch suggestions");
          setError('Ошибка при загрузке подсказок.');
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setError('Не удалось связаться с сервером.');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    fetchSuggestions(e.target.value);
  };

  return (
    <div className="relative min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="absolute top-0 right-0 p-4">
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
            Войти
          </Link>
          <Link href="/signup" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Регистрация
          </Link>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center pt-20">
        <h1 className="text-4xl font-bold mb-2">EtsyKeywordWatcher</h1>
        <p className="text-lg text-gray-600 mb-8">Ваш помощник в мире ключевых слов Etsy</p>
        <div className="w-full max-w-md">
          <input
            className="border p-3 rounded-lg w-full"
            placeholder="Введите ключевое слово..."
            value={query}
            onChange={handleInputChange}
          />
          <div className="mt-4 w-full max-w-md h-24">
            {loading && <div className="text-center text-gray-500">Загрузка...</div>}
            {error && !loading && <div className="text-center text-red-500">{error}</div>}
            {!loading && !error && suggestions.map(s => (
              <button
                key={s}
                className="block w-full text-left p-2 hover:bg-gray-100 rounded"
                onClick={() => window.location.href = "/signup"}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
            <p className="font-bold text-lg">Этот шаблонный текст можно будет заменить на описание преимуществ</p>
            <p className="text-gray-500">Например, здесь можно рассказать про тарифные планы</p>
        </div>

      </main>
    </div>
  );
}
