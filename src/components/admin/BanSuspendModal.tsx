/**
 * Ban/Suspend Modal Component
 * 
 * Modal for banning or suspending users.
 */

'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';

interface BanSuspendModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  action: 'ban' | 'suspend' | 'unban' | 'unsuspend';
  currentStatus?: {
    banned: boolean;
    suspended: boolean;
    suspendedUntil?: string | null;
  };
  onSuccess: () => void;
}

export function BanSuspendModal({
  isOpen,
  onClose,
  userId,
  action,
  currentStatus,
  onSuccess,
}: BanSuspendModalProps) {
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (action === 'ban') {
        const response = await fetch(`/api/admin/users/${userId}/ban`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: reason.trim() || null }),
        });

        const data = await response.json();

        if (!response.ok) {
          showToast(data.error || 'Failed to ban user', 'error');
          return;
        }

        showToast('User banned successfully', 'success');
        onSuccess();
        onClose();
        setReason('');
      } else if (action === 'suspend') {
        if (!durationDays || durationDays <= 0) {
          showToast('Please enter a valid duration (days)', 'error');
          return;
        }

        const response = await fetch(`/api/admin/users/${userId}/suspend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            durationDays,
            reason: reason.trim() || null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          showToast(data.error || 'Failed to suspend user', 'error');
          return;
        }

        showToast(`User suspended for ${durationDays} day(s)`, 'success');
        onSuccess();
        onClose();
        setReason('');
        setDurationDays(7);
      } else if (action === 'unban') {
        const response = await fetch(`/api/admin/users/${userId}/ban`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          showToast(data.error || 'Failed to unban user', 'error');
          return;
        }

        showToast('User unbanned successfully', 'success');
        onSuccess();
        onClose();
      } else if (action === 'unsuspend') {
        const response = await fetch(`/api/admin/users/${userId}/suspend`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          showToast(data.error || 'Failed to unsuspend user', 'error');
          return;
        }

        showToast('User unsuspended successfully', 'success');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error performing action:', error);
      showToast('Failed to perform action. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (action) {
      case 'ban':
        return 'Ban User';
      case 'suspend':
        return 'Suspend User';
      case 'unban':
        return 'Unban User';
      case 'unsuspend':
        return 'Unsuspend User';
      default:
        return 'Action';
    }
  };

  const getDescription = () => {
    switch (action) {
      case 'ban':
        return 'Permanently ban this user from the platform. They will not be able to access the platform until unbanned.';
      case 'suspend':
        return 'Temporarily suspend this user. They will not be able to access the platform until the suspension expires.';
      case 'unban':
        return 'Remove the permanent ban from this user. They will be able to access the platform again.';
      case 'unsuspend':
        return 'Remove the suspension from this user. They will be able to access the platform again immediately.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl border border-gray-700/50 shadow-level-3 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-300">{getDescription()}</p>

          {(action === 'ban' || action === 'suspend') && (
            <>
              {action === 'suspend' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for ban/suspension..."
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent resize-none"
                />
              </div>
            </>
          )}

          {(action === 'unban' || action === 'unsuspend') && currentStatus && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-yellow-400">
                {action === 'unban' && currentStatus.banned && (
                  <>This user is currently banned.</>
                )}
                {action === 'unsuspend' && currentStatus.suspended && (
                  <>
                    This user is suspended until{' '}
                    {currentStatus.suspendedUntil
                      ? new Date(currentStatus.suspendedUntil).toLocaleString()
                      : 'unknown'}
                    .
                  </>
                )}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`flex-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                action === 'ban' || action === 'suspend'
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
            >
              {submitting ? 'Processing...' : action === 'ban' || action === 'suspend' ? 'Confirm' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

