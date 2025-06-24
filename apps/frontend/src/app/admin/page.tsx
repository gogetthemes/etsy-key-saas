"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(setUsers);
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Админка</h1>
      <table className="w-full border mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Email</th>
            <th className="p-2">Тариф</th>
            <th className="p-2">Дата регистрации</th>
            <th className="p-2">Ключей</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.plan}</td>
              <td className="p-2">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="p-2">{u.keywords?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mb-2 font-bold">Логи (заглушка)</div>
    </main>
  );
} 