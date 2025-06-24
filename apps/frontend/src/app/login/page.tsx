"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) setError("Неверный email или пароль");
    else window.location.href = "/dashboard";
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Вход</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-2 w-full max-w-xs">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded" required />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded" required />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white rounded p-2 mt-2">Войти</button>
      </form>
      <button onClick={() => signIn("google")}
        className="mt-4 border p-2 rounded w-full max-w-xs hover:bg-gray-100">
        Войти через Google
      </button>
      <a href="/signup" className="mt-2 text-blue-600">Нет аккаунта? Зарегистрироваться</a>
    </main>
  );
} 