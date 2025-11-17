/**
 * Analytics Overview Component
 * 
 * Displays key platform metrics in cards.
 */

'use client';

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
}

interface AnalyticsOverviewProps {
  data: AnalyticsData;
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const metrics = [
    {
      title: 'Total Users',
      value: data.platform.totalUsers.toLocaleString(),
      change: `+${data.platform.newUsers.toLocaleString()} new`,
      icon: '👥',
      color: 'blue',
    },
    {
      title: 'Active Users (24h)',
      value: (data.platform.activeUsers24h || 0).toLocaleString(),
      change: data.platform.activeUsers7d ? `${data.platform.activeUsers7d.toLocaleString()} (7d)` : 'N/A',
      icon: '🟢',
      color: 'green',
    },
    {
      title: 'Retention Rate',
      value: data.platform.retentionRate ? `${data.platform.retentionRate.toFixed(1)}%` : 'N/A',
      change: data.platform.activeUsers30d ? `${data.platform.activeUsers30d.toLocaleString()} (30d)` : 'N/A',
      icon: '📊',
      color: 'cyan',
    },
    {
      title: 'Total Stories',
      value: data.platform.totalStories.toLocaleString(),
      change: `+${data.platform.newStories.toLocaleString()} new`,
      icon: '📖',
      color: 'purple',
    },
    {
      title: 'Total Views',
      value: data.engagement.totalViews.toLocaleString(),
      change: `${Math.round(data.engagement.avgViewsPerStory)} avg/story`,
      icon: '👁️',
      color: 'orange',
    },
    {
      title: 'Total Likes',
      value: data.engagement.totalLikes.toLocaleString(),
      change: `${Math.round(data.engagement.avgLikesPerStory)} avg/story`,
      icon: '❤️',
      color: 'pink',
    },
    {
      title: 'Total Comments',
      value: (data.engagement.totalComments || 0).toLocaleString(),
      change: `${Math.round(data.engagement.avgCommentsPerStory || 0)} avg/story`,
      icon: '💬',
      color: 'indigo',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.title}
          className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 hover:shadow-level-2 hover:border-brand-cyan/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">{metric.icon}</div>
            <div className="text-xs text-gray-300">{metric.change}</div>
          </div>
          <div className="text-sm text-gray-300 mb-1">{metric.title}</div>
          <div className="text-3xl font-bold text-white">{metric.value}</div>
        </div>
      ))}
    </div>
  );
}

