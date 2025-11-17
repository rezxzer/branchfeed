/**
 * Report Actions Component
 * 
 * Actions for managing content reports (resolve, dismiss, delete content).
 */

'use client';

import { useState } from 'react';

interface Reporter {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
}

interface Report {
  id: string;
  reporter_id: string;
  content_type: 'story' | 'post' | 'comment';
  content_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_id: string | null;
  created_at: string;
  resolved_at: string | null;
  reporter: Reporter;
}

interface ReportActionsProps {
  report: Report;
  onUpdate: () => void;
}

export function ReportActions({ report, onUpdate }: ReportActionsProps) {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);

  const handleUpdateStatus = async (status: 'reviewed' | 'resolved' | 'dismissed') => {
    try {
      setLoading(true);
      setActionType(status);

      const response = await fetch(`/api/admin/moderation/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to update report status');
        return;
      }

      onUpdate();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleDeleteContent = async () => {
    if (!confirm(`Are you sure you want to delete this ${report.content_type}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setActionType('delete');

      const response = await fetch(`/api/admin/moderation/${report.id}/delete-content`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to delete content');
        return;
      }

      // Update report status to resolved
      await handleUpdateStatus('resolved');
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  if (report.status === 'resolved' || report.status === 'dismissed') {
    return (
      <span className="text-sm text-gray-500">
        {report.status === 'resolved' ? '✓ Resolved' : '✗ Dismissed'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={() => handleUpdateStatus('reviewed')}
        disabled={loading || report.status === 'reviewed'}
        className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading && actionType === 'reviewed' ? '...' : 'Review'}
      </button>
      <button
        onClick={() => handleUpdateStatus('resolved')}
        disabled={loading}
        className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading && actionType === 'resolved' ? '...' : 'Resolve'}
      </button>
      <button
        onClick={() => handleUpdateStatus('dismissed')}
        disabled={loading}
        className="px-3 py-1.5 text-xs bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading && actionType === 'dismissed' ? '...' : 'Dismiss'}
      </button>
      <button
        onClick={handleDeleteContent}
        disabled={loading}
        className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading && actionType === 'delete' ? '...' : 'Delete'}
      </button>
    </div>
  );
}

