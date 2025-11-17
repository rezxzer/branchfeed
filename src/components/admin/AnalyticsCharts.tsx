/**
 * Analytics Charts Component
 * 
 * Displays growth charts and trends.
 */

'use client';

interface DailyGrowth {
  date: string;
  users: number;
  stories: number;
}

interface AnalyticsData {
  dailyGrowth: DailyGrowth[];
}

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  if (!data.dailyGrowth || data.dailyGrowth.length === 0) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Daily Growth</h3>
        <p className="text-gray-400 text-sm">No growth data yet</p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.dailyGrowth.map(d => Math.max(d.users, d.stories)),
    1
  );

  return (
    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
      <h3 className="text-xl font-bold text-white mb-6">Daily Growth</h3>
      <div className="space-y-4">
        {data.dailyGrowth.map((day) => {
          const date = new Date(day.date);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          return (
            <div key={day.date} className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{dateStr}</span>
                <div className="flex items-center gap-4">
                  <span>👥 {day.users}</span>
                  <span>📖 {day.stories}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 bg-gray-900/50 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-blue-500/50 h-full flex items-center justify-center text-xs text-white"
                    style={{ width: `${(day.users / maxValue) * 100}%` }}
                  >
                    {day.users > 0 && day.users}
                  </div>
                  <div
                    className="bg-purple-500/50 h-full flex items-center justify-center text-xs text-white"
                    style={{ width: `${(day.stories / maxValue) * 100}%` }}
                  >
                    {day.stories > 0 && day.stories}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500/50 rounded"></div>
          <span>New Users</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500/50 rounded"></div>
          <span>New Stories</span>
        </div>
      </div>
    </div>
  );
}

