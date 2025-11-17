/**
 * Branching Analytics Component
 * 
 * Displays BranchFeed-specific analytics (completion rates, paths, drop-offs).
 */

'use client';

interface BranchingData {
  completionRate: number;
  avgDepth: number;
  totalProgress: number;
  completedProgress: number;
  topPaths: Array<{ path: string; count: number }>;
}

interface BranchingAnalyticsProps {
  branching: BranchingData;
}

export function BranchingAnalytics({ branching }: BranchingAnalyticsProps) {
  const noData = !branching || branching.totalProgress === 0;

  if (noData) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Branching Analytics</h3>
        <p className="text-sm text-gray-400">No progression data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Branching Analytics</h3>
      
      <div className="space-y-6">
        {/* Completion Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Completion Rate</span>
            <span className="text-lg font-bold text-white">{branching.completionRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-900/50 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${branching.completionRate}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {branching.completedProgress} of {branching.totalProgress} users completed
          </div>
        </div>

        {/* Average Depth */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Average Depth Reached</span>
            <span className="text-lg font-bold text-white">{branching.avgDepth.toFixed(1)}</span>
          </div>
          <div className="text-xs text-gray-500">
            Average branching depth users reach before stopping
          </div>
        </div>

        {/* Top Paths */}
        {branching.topPaths.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Most Popular Paths</h4>
            <div className="space-y-2">
              {branching.topPaths.slice(0, 5).map((pathData, index) => (
                <div
                  key={pathData.path}
                  className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                    <span className="text-sm text-gray-300 font-mono">
                      {pathData.path || 'Root'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">{pathData.count} users</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {branching.topPaths.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-4">
            No path data available yet
          </div>
        )}
      </div>
    </div>
  );
}

