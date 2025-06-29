"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { addActionLog } from "../components/Sidebar";

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

    addActionLog("Начало регистрации", "pending", `Email: ${email}`);

    try {
      console.log('[SIGNUP] Starting registration process...', { email });
      addActionLog("Отправка запроса на регистрацию", "pending", "Отправляем данные на сервер...");
      
      // Используем локальный API route
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
        const data = await res.json();
        console.log('[SIGNUP] Registration successful!', data);
        addActionLog("Регистрация успешна", "success", `Пользователь ${email} создан`);
        setSuccess(true);
        
        // Автоматический вход после успешной регистрации
        setTimeout(() => {
          addActionLog("Автоматический вход", "pending", "Выполняем вход в систему...");
          signIn("credentials", { 
            email, 
            password,
            callbackUrl: "/dashboard"
          });
        }, 1000);
      } else {
        const data = await res.json();
        console.error('[SIGNUP] Registration failed:', data);
        const errorMessage = data.error || "Ошибка регистрации";
        addActionLog("Ошибка регистрации", "error", errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('[SIGNUP] Network error:', err);
      const errorMessage = "Ошибка сети. Проверьте подключение к интернету.";
      addActionLog("Ошибка сети", "error", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Регистрация</h1>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input 
              id="email"
              type="email" 
              placeholder="your@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input 
              id="password"
              type="password" 
              placeholder="Минимум 6 символов" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
              minLength={6}
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              ✅ Регистрация успешна! Выполняется вход в систему...
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white rounded-lg p-3 font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
        
        <div className="mt-6">
          <button 
            onClick={() => {
              addActionLog("Вход через Google", "pending", "Перенаправление на Google...");
              signIn("google");
            }}
            className="w-full border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Зарегистрироваться через Google
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-600 hover:text-blue-800 text-sm">
            Уже есть аккаунт? Войти
          </a>
        </div>
      </div>
    </main>
  );
} 