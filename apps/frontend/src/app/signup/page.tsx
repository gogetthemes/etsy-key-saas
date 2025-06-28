"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      console.log('[SIGNUP] Starting registration process...', { email });
      console.log('[SIGNUP] Sending request to /api/signup...');
      
      // Используем локальный API route вместо прямого запроса на backend
      const res = await fetch('/api/signup', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('[SIGNUP] Response received:', { 
        status: res.status, 
        statusText: res.statusText,
        ok: res.ok 
      });

      if (res.ok) {
        console.log('[SIGNUP] Registration successful!');
        setSuccess(true);
        // Временно отключаем автоматический вход
        // setTimeout(() => {
        //   console.log('[SIGNUP] Attempting to sign in...');
        //   signIn("credentials", { email, password });
        // }, 1000);
      } else {
        const data = await res.json();
        console.error('[SIGNUP] Registration failed:', data);
        setError(data.error || "Ошибка регистрации");
      }
    } catch (err) {
      console.error('[SIGNUP] Network error:', err);
      setError("Ошибка сети. Проверьте подключение к интернету.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Регистрация</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-2 w-full max-w-xs">
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="border p-2 rounded" 
          required 
          disabled={loading}
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="border p-2 rounded" 
          required 
          disabled={loading}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Регистрация успешна! Теперь можете войти.</div>}
        <button 
          type="submit" 
          className="bg-blue-600 text-white rounded p-2 mt-2 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </form>
      <button 
        onClick={() => signIn("google")}
        className="mt-4 border p-2 rounded w-full max-w-xs hover:bg-gray-100"
        disabled={loading}
      >
        Зарегистрироваться через Google
      </button>
      <a href="/login" className="mt-2 text-blue-600">Уже есть аккаунт? Войти</a>
    </main>
  );
} 