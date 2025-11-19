/**
 * Admin Header Component
 * 
 * Header for admin dashboard with logo, title, and user info.
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export function AdminHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="bg-gray-800/80 backdrop-blur-lg border-b border-gray-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">
            {t('admin.dashboard.title')}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            {t('admin.logout')}
          </button>
        </div>
      </div>
    </header>
  );
}

