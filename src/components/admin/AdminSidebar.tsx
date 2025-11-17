/**
 * Admin Sidebar Component
 * 
 * Navigation sidebar for admin dashboard.
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
  { id: 'overview', label: 'Overview', path: '/admin', icon: '📊' },
  { id: 'users', label: 'Users', path: '/admin/users', icon: '👥' },
  { id: 'moderation', label: 'Moderation', path: '/admin/moderation', icon: '🛡️' },
  { id: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { id: 'settings', label: 'Settings', path: '/admin/settings', icon: '⚙️' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800/80 backdrop-blur-lg border-r border-gray-700/50 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.id}>
                <Link
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-brand-iris/20 text-brand-cyan font-medium'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-brand-cyan'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

