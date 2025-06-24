'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Key, Search, List, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/keywords', label: 'Keywords', icon: Key },
  { href: '/search-hits', label: 'Search Hits', icon: Search },
  { href: '/listings', label: 'My Listings', icon: List },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-6 text-2xl font-bold text-blue-600">EtsyKey</div>
      <nav className="flex-1 px-4">
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
      <div className="p-4 border-t">
        <Link href="/profile">
           <span className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
             <User className="w-5 h-5 mr-3" />
             My Profile
           </span>
        </Link>
      </div>
    </aside>
  );
} 