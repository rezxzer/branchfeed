/**
 * Report List Component
 * 
 * Displays content reports in a table format with actions.
 */

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ReportActions } from './ReportActions';

interface Reporter {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
}

interface Admin {
  id: string;
  username: string;
  email: string | null;
}

interface Report {
  id: string;
  reporter_id: string;
  content_type: 'story' | 'post' | 'comment';
  content_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_id: string | null;
  created_at: string;
  resolved_at: string | null;
  reporter: Reporter;
  admin: Admin | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ReportListProps {
  reports: Report[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onReportUpdate: () => void;
}

const statusColors = {
  pending: 'bg-yellow-400/20 text-yellow-400',
  reviewed: 'bg-blue-400/20 text-blue-400',
  resolved: 'bg-green-400/20 text-green-400',
  dismissed: 'bg-gray-400/20 text-gray-400',
};

const contentTypeLabels = {
  story: '📖 Story',
  post: '📝 Post',
  comment: '💬 Comment',
};

export function ReportList({
  reports,
  loading,
  pagination,
  onPageChange,
  onReportUpdate,
}: ReportListProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkLoading, setBulkLoading] = useState<'resolve' | 'dismiss' | 'delete' | null>(null);

  const allIds = useMemo(() => reports.map((r) => r.id), [reports]);
  const selectedIds = useMemo(
    () => allIds.filter((id) => selected[id]),
    [allIds, selected]
  );
  const hasSelection = selectedIds.length > 0;

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    if (checked) allIds.forEach((id) => (next[id] = true));
    setSelected(next);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const runBulk = async (status: 'resolved' | 'dismissed') => {
    if (!hasSelection) return;
    setBulkLoading(status === 'resolved' ? 'resolve' : 'dismiss');

    try {
      // Optimistic: clear selection early
      const ids = [...selectedIds];
      setSelected({});

      await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/api/admin/moderation/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          });
          if (!res.ok) {
            // don't throw to allow others to continue
            // eslint-disable-next-line no-console
            console.error('Bulk update failed for', id, await res.text());
          }
        })
      );

      onReportUpdate();
    } finally {
      setBulkLoading(null);
    }
  };

  const runBulkDeleteContent = async () => {
    if (!hasSelection) return;
    if (!confirm(`Delete content for ${selectedIds.length} report(s)? This action cannot be undone.`)) return;
    setBulkLoading('delete');

    try {
      const ids = [...selectedIds];
      setSelected({});

      await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/api/admin/moderation/${id}/delete-content`, {
            method: 'POST',
          });
          if (!res.ok) {
            // eslint-disable-next-line no-console
            console.error('Bulk delete-content failed for', id, await res.text());
          }
        })
      );

      onReportUpdate();
    } finally {
      setBulkLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-12 text-center">
        <p className="text-gray-400">No reports found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Bulk bar */}
      {hasSelection && (
        <div className="px-6 py-3 bg-gray-900/60 border-b border-gray-700/50 flex items-center justify-between">
          <div className="text-sm text-gray-300">Selected {selectedIds.length}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => runBulk('resolved')}
              disabled={bulkLoading !== null}
              className="px-3 py-1.5 rounded-lg text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {bulkLoading === 'resolve' ? 'Resolving…' : 'Mark Resolved'}
            </button>
            <button
              onClick={() => runBulk('dismissed')}
              disabled={bulkLoading !== null}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {bulkLoading === 'dismiss' ? 'Dismissing…' : 'Dismiss'}
            </button>
            <button
              onClick={runBulkDeleteContent}
              disabled={bulkLoading !== null}
              className="px-3 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {bulkLoading === 'delete' ? 'Deleting…' : 'Delete Content'}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50 border-b border-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={hasSelection && selectedIds.length === allIds.length}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="accent-brand-cyan"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Reporter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    aria-label={`Select ${report.id}`}
                    checked={Boolean(selected[report.id])}
                    onChange={(e) => toggleOne(report.id, e.target.checked)}
                    className="accent-brand-cyan"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>{contentTypeLabels[report.content_type]}</span>
                    <Link
                      href={`/${report.content_type === 'story' ? 'story' : report.content_type === 'comment' ? '#' : 'post'}/${report.content_id}`}
                      className="text-brand-cyan hover:text-brand-cyan/80 transition-colors text-sm"
                      target="_blank"
                    >
                      View
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{report.reporter.username}</div>
                  <div className="text-xs text-gray-500">{report.reporter.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-300 max-w-xs truncate">
                    {report.reason}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <ReportActions
                    report={report}
                    onUpdate={onReportUpdate}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-700/50 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} reports
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-700/50 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-700/50 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

