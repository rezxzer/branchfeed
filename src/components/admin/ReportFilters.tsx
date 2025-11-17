/**
 * Report Filters Component
 * 
 * Filter and sort controls for content reports.
 */

'use client';

type StatusFilter = 'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed';
type SortBy = 'created_at' | 'resolved_at' | 'status';

interface ReportFiltersProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sortBy: SortBy;
  sortOrder: 'asc' | 'desc';
  onSort: (column: SortBy) => void;
}

const statusOptions = [
  { value: 'all', label: 'All Reports' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
] as const;

export function ReportFilters({
  statusFilter,
  onStatusChange,
  sortBy,
  sortOrder,
  onSort,
}: ReportFiltersProps) {
  return (
    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Status:</span>
          <div className="flex items-center gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onStatusChange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  statusFilter === option.value
                    ? 'bg-brand-iris/20 text-brand-cyan'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <button
            onClick={() => onSort('created_at')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === 'created_at'
                ? 'bg-brand-iris/20 text-brand-cyan'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => onSort('status')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === 'status'
                ? 'bg-brand-iris/20 text-brand-cyan'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>
    </div>
  );
}

