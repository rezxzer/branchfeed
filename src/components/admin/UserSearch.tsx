/**
 * User Search Component
 * 
 * Search and filter controls for user management.
 */

'use client';

interface UserSearchProps {
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: 'created_at' | 'updated_at' | 'username' | 'email';
  sortOrder: 'asc' | 'desc';
  onSort: (column: 'created_at' | 'updated_at' | 'username' | 'email') => void;
}

export function UserSearch({
  search,
  onSearchChange,
  sortBy,
  sortOrder,
  onSort,
}: UserSearchProps) {
  return (
    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <button
            onClick={() => onSort('username')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === 'username'
                ? 'bg-brand-iris/20 text-brand-cyan'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Username {sortBy === 'username' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => onSort('email')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === 'email'
                ? 'bg-brand-iris/20 text-brand-cyan'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
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
        </div>
      </div>
    </div>
  );
}

