'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, Key, Search, List, User, LogOut, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

// Тип для логов действий
export interface ActionLog {
  id: string;
  action: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
  details?: string;
}

// Глобальное состояние для логов
export const actionLogs: ActionLog[] = [];

export const addActionLog = (action: string, status: 'success' | 'error' | 'pending', details?: string) => {
  const log: ActionLog = {
    id: Date.now().toString(),
    action,
    status,
    timestamp: new Date(),
    details
  };
  actionLogs.unshift(log);
  if (actionLogs.length > 20) {
    actionLogs.pop();
  }
  window.dispatchEvent(new CustomEvent('actionLogsUpdated'));
};

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/keywords', label: 'Keywords', icon: Key },
  { href: '/search-hits', label: 'Search Hits', icon: Search },
  { href: '/listings', label: 'My Listings', icon: List },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    setLogs([...actionLogs]);
    
    const handleLogsUpdate = () => {
      setLogs([...actionLogs]);
    };

    window.addEventListener('actionLogsUpdated', handleLogsUpdate);
    return () => window.removeEventListener('actionLogsUpdated', handleLogsUpdate);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return 'ℹ️';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex">
      <aside className="w-64 bg-white shadow-md flex flex-col h-screen">
        <div className="p-6 border-b">
          <div className="text-2xl font-bold text-blue-600 mb-2">EtsyKey</div>
          {session?.user && (
            <div className="text-sm text-gray-600">
              👤 {session.user.name || session.user.email}
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <span
                    className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors
                      ${pathname === item.href
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-4 py-2">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Activity className="w-5 h-5 mr-3" />
            Логи действий ({logs.length})
          </button>
        </div>

        <div className="p-4 border-t">
          <Link href="/profile">
             <span className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
               <User className="w-5 h-5 mr-3" />
               Профиль
             </span>
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 mt-2"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Выйти
          </button>
        </div>
      </aside>

      {showLogs && (
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Логи действий</h3>
          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Нет действий для отображения</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-white p-3 rounded-lg shadow-sm border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatusIcon(log.status)}</span>
                        <span className="font-medium text-sm">{log.action}</span>
                      </div>
                      {log.details && (
                        <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{formatTime(log.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {logs.length > 0 && (
            <button
              onClick={() => {
                actionLogs.length = 0;
                setLogs([]);
              }}
              className="mt-4 w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
            >
              Очистить логи
            </button>
          )}
        </div>
      )}
    </div>
  );
}
