/**
 * Analytics Dashboard Client Component
 * 
 * Displays platform analytics, metrics, and charts.
 */

'use client';

import { useState, useEffect } from 'react';
import { AnalyticsOverview } from './AnalyticsOverview';
import { AnalyticsCharts } from './AnalyticsCharts';
import { PopularStories } from './PopularStories';
import { BranchingAnalytics } from './BranchingAnalytics';

interface AnalyticsData {
  platform: {
    totalUsers: number;
    newUsers: number;
    totalStories: number;
    newStories: number;
    activeUsers24h?: number;
    activeUsers7d?: number;
    activeUsers30d?: number;
    retentionRate?: number;
  };
  engagement: {
    totalLikes: number;
    totalViews: number;
    totalComments: number;
    avgViewsPerStory: number;
    avgLikesPerStory: number;
    avgCommentsPerStory: number;
  };
  branching: {
    completionRate: number;
    avgDepth: number;
    totalProgress: number;
    completedProgress: number;
    topPaths: Array<{ path: string; count: number }>;
  };
  popularStories: Array<{
    id: string;
    title: string;
    author_id: string;
    views_count: number;
    likes_count: number;
    created_at: string;
    author: {
      id: string;
      username: string;
    };
  }>;
  dailyGrowth: Array<{
    date: string;
    users: number;
    stories: number;
  }>;
}

export function AnalyticsDashboardClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('7d');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-700/50 rounded-lg animate-pulse w-64" />
        <div className="h-96 bg-gray-800/80 rounded-2xl border border-gray-700/50 animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-12 text-center">
        <p className="text-red-400">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">
            Platform metrics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                period === p
                  ? 'bg-brand-iris/20 text-brand-cyan'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {p === 'all' ? 'All Time' : p}
            </button>
          ))}
        </div>
      </div>

      <AnalyticsOverview data={data} />
      <AnalyticsCharts data={data} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularStories stories={data.popularStories} />
        <BranchingAnalytics branching={data.branching} />
      </div>
    </div>
  );
}

