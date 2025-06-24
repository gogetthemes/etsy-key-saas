"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => signIn("credentials", { email, password }), 1000);
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка регистрации");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Регистрация</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-2 w-full max-w-xs">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded" required />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded" required />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Успешно! Входим...</div>}
        <button type="submit" className="bg-blue-600 text-white rounded p-2 mt-2">Зарегистрироваться</button>
      </form>
      <button onClick={() => signIn("google")}
        className="mt-4 border p-2 rounded w-full max-w-xs hover:bg-gray-100">
        Зарегистрироваться через Google
      </button>
      <a href="/login" className="mt-2 text-blue-600">Уже есть аккаунт? Войти</a>
    </main>
  );
} 