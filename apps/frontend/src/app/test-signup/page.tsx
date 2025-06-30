"use client";
import { useState } from "react";

export default function TestSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      console.log('[TEST SIGNUP] Starting registration...');
      
      // Прямое обращение к backend
      const res = await fetch('https://etsy-key-saas.onrender.com/api/signup', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('[TEST SIGNUP] Response:', { 
        status: res.status, 
        statusText: res.statusText,
        ok: res.ok 
      });

      const data = await res.json();
      console.log('[TEST SIGNUP] Data:', data);

      if (res.ok) {
        setResult(`✅ Успешно! ID: ${data.id}, Email: ${data.email}, Plan: ${data.plan}`);
      } else {
        setResult(`❌ Ошибка: ${data.error}`);
      }
    } catch (err: any) {
      console.error('[TEST SIGNUP] Error:', err);
      setResult(`❌ Сетевая ошибка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function testLocalApi() {
    setLoading(true);
    setResult("");

    try {
      console.log('[TEST LOCAL API] Testing local API...');
      
      const res = await fetch('/api/signup', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          email: `test${Date.now()}@example.com`, 
          password: "testpass123" 
        }),
      });

      console.log('[TEST LOCAL API] Response:', { 
        status: res.status, 
        statusText: res.statusText,
        ok: res.ok 
      });

      const data = await res.json();
      console.log('[TEST LOCAL API] Data:', data);

      if (res.ok) {
        setResult(`✅ Local API работает! ID: ${data.id}, Email: ${data.email}`);
      } else {
        setResult(`❌ Local API ошибка: ${data.error}`);
      }
    } catch (err: any) {
      console.error('[TEST LOCAL API] Error:', err);
      setResult(`❌ Local API сетевая ошибка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Тест регистрации</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Прямое обращение к Backend</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full border p-2 rounded"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full border p-2 rounded"
                required
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Отправка..." : "Зарегистрироваться"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Тест Local API</h2>
          <p className="text-sm text-gray-600 mb-4">
            Тестирует Next.js API route с автоматическим email
          </p>
          <button 
            onClick={testLocalApi}
            className="w-full bg-green-600 text-white p-2 rounded disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Тестирование..." : "Тест Local API"}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-8 p-4 rounded-lg bg-gray-100">
          <h3 className="font-semibold mb-2">Результат:</h3>
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </main>
  );
} 