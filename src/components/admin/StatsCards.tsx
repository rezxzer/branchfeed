/**
 * Stats Cards Component
 * 
 * Displays platform statistics in card format.
 */

'use client';

import type { AdminStats } from '@/types/admin';

interface StatsCardsProps {
  stats: AdminStats;
  loading?: boolean;
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'blue',
    },
    {
      title: 'Active Users (24h)',
      value: stats.activeUsers,
      icon: '🟢',
      color: 'green',
    },
    {
      title: 'Total Stories',
      value: stats.totalStories,
      icon: '📖',
      color: 'purple',
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: '📝',
      color: 'indigo',
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes,
      icon: '❤️',
      color: 'pink',
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: '👁️',
      color: 'orange',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-level-1 p-6 hover:shadow-level-2 hover:border-brand-cyan/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{card.title}</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-700 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-white">
                  {card.value.toLocaleString()}
                </p>
              )}
            </div>
            <div className="text-4xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

