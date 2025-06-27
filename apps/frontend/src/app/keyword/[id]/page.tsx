"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function KeywordPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/keywords/${id}`)
      .then(r => r.json())
      .then(setData);
  }, [id]);

  if (!data) return <div className="p-8">Загрузка...</div>;

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{data.keyword}</h1>
      <div className="mb-2">Листингов: <b>{data.listingCount}</b></div>
      <div className="mb-2">Конкуренция: <b>{data.competition}</b></div>
      <div className="mb-2">Подсказки Etsy:</div>
      <ul className="mb-4 list-disc pl-6">
        {data.suggestions.map((s: string) => <li key={s}>{s}</li>)}
      </ul>
      <div className="mb-2">Связанные ключи (NLP): <span className="text-gray-500">[заглушка]</span></div>
      <div className="mb-2">СЧ/НЧ: <span className="text-gray-500">[заглушка]</span></div>
    </main>
  );
} 