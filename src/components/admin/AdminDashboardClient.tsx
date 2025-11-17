/**
 * Admin Dashboard Client Component
 * 
 * Main client component for admin dashboard.
 * Displays platform statistics and admin navigation.
 */

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { StatsCards } from './StatsCards';
import { Spinner } from '@/components/ui/Spinner';

// Lazy load admin components for code splitting
const UserManagementClient = dynamic(() => import('./UserManagementClient').then(mod => ({ default: mod.UserManagementClient })), {
  loading: () => <div className="flex justify-center p-8"><Spinner size="lg" /></div>,
});

const ContentModerationClient = dynamic(() => import('./ContentModerationClient').then(mod => ({ default: mod.ContentModerationClient })), {
  loading: () => <div className="flex justify-center p-8"><Spinner size="lg" /></div>,
});

const AnalyticsDashboardClient = dynamic(() => import('./AnalyticsDashboardClient').then(mod => ({ default: mod.AnalyticsDashboardClient })), {
  loading: () => <div className="flex justify-center p-8"><Spinner size="lg" /></div>,
});

const SystemSettingsClient = dynamic(() => import('./SystemSettingsClient').then(mod => ({ default: mod.SystemSettingsClient })), {
  loading: () => <div className="flex justify-center p-8"><Spinner size="lg" /></div>,
});
import type { AdminStats } from '@/types/admin';

interface AdminDashboardClientProps {
  stats: AdminStats;
}

export function AdminDashboardClient({ stats: initialStats }: AdminDashboardClientProps) {
  const pathname = usePathname();
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [loading, setLoading] = useState(false);

  // Refresh stats periodically (every 30 seconds) - only on overview page
  useEffect(() => {
    if (pathname !== '/admin') return;

    const interval = setInterval(async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const newStats = await response.json();
          setStats(newStats);
        }
      } catch (error) {
        console.error('Error refreshing stats:', error);
      } finally {
        setLoading(false);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [pathname]);

  const renderContent = () => {
    if (pathname === '/admin/users') {
      return <UserManagementClient />;
    }
    
    if (pathname === '/admin/moderation') {
      return <ContentModerationClient />;
    }
    
    if (pathname === '/admin/analytics') {
      return <AnalyticsDashboardClient />;
    }
    
    if (pathname === '/admin/settings') {
      return <SystemSettingsClient />;
    }
    
    // Default: Overview with stats
    return (
      <>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Overview</h2>
          <p className="text-sm text-gray-400 mt-1">
            Platform statistics and key metrics
          </p>
        </div>
        <StatsCards stats={stats} loading={loading} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

