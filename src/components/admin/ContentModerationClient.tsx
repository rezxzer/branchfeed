/**
 * Content Moderation Client Component
 * 
 * Displays content reports with filtering and moderation actions.
 */

'use client';

import { useState, useEffect } from 'react';
import { ReportList } from './ReportList';
import { ReportFilters } from './ReportFilters';

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

export function ContentModerationClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'resolved_at' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/moderation?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch reports:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || errorData.details || 'Unknown error',
        });
        throw new Error(errorData.error || errorData.details || 'Failed to fetch reports');
      }

      const data = await response.json();
      console.log('Reports data received:', {
        reportsCount: data.reports?.length || 0,
        pagination: data.pagination,
      });
      setReports(data.reports || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter, sortBy, sortOrder]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusChange = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleReportUpdate = () => {
    // Refresh reports after action
    fetchReports();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Content Moderation</h2>
        <p className="text-sm text-gray-400 mt-1">
          Review and manage reported content
        </p>
      </div>

      <ReportFilters
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      <ReportList
        reports={reports}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onReportUpdate={handleReportUpdate}
      />
    </div>
  );
}

