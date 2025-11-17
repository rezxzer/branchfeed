/**
 * User Actions Component
 * 
 * Admin actions for managing users (assign admin role, ban, suspend).
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy load modal for code splitting
const BanSuspendModal = dynamic(() => import('./BanSuspendModal').then(mod => ({ default: mod.BanSuspendModal })), {
  ssr: false,
});

interface UserActionsProps {
  userId: string;
  currentRole: string | null;
  bannedAt?: string | null;
  suspendedUntil?: string | null;
}

export function UserActions({ 
  userId, 
  currentRole,
  bannedAt,
  suspendedUntil,
}: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'ban' | 'suspend' | 'unban' | 'unsuspend'>('ban');

  const isBanned = bannedAt !== null && bannedAt !== undefined;
  const isSuspended = suspendedUntil !== null && suspendedUntil !== undefined && new Date(suspendedUntil) > new Date();

  const handleAssignAdminRole = async (role: 'super_admin' | 'admin' | 'moderator' | 'support') => {
    if (!confirm(`Are you sure you want to assign ${role.replace('_', ' ')} role to this user?`)) {
      return;
    }

    try {
      setLoading(true);
      setActionType('assign-role');

      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to assign role');
        return;
      }

      // Refresh page to show updated role
      router.refresh();
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Failed to assign role');
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleRemoveAdminRole = async () => {
    if (!confirm('Are you sure you want to remove admin role from this user?')) {
      return;
    }

    try {
      setLoading(true);
      setActionType('remove-role');

      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to remove role');
        return;
      }

      // Refresh page to show updated role
      router.refresh();
    } catch (error) {
      console.error('Error removing role:', error);
      alert('Failed to remove role');
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Admin Actions</h3>
      
      <div className="space-y-4">
        {/* Assign Admin Role */}
        {!currentRole ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assign Admin Role
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleAssignAdminRole('super_admin')}
                disabled={loading}
                className="px-4 py-2 bg-yellow-400/20 text-yellow-400 rounded-lg hover:bg-yellow-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {loading && actionType === 'assign-role' ? '...' : '👑 Super Admin'}
              </button>
              <button
                onClick={() => handleAssignAdminRole('admin')}
                disabled={loading}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {loading && actionType === 'assign-role' ? '...' : 'Admin'}
              </button>
              <button
                onClick={() => handleAssignAdminRole('moderator')}
                disabled={loading}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {loading && actionType === 'assign-role' ? '...' : 'Moderator'}
              </button>
              <button
                onClick={() => handleAssignAdminRole('support')}
                disabled={loading}
                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {loading && actionType === 'assign-role' ? '...' : 'Support'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Role: <span className="text-yellow-400">{currentRole.replace('_', ' ')}</span>
            </label>
            <button
              onClick={handleRemoveAdminRole}
              disabled={loading}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading && actionType === 'remove-role' ? 'Removing...' : 'Remove Admin Role'}
            </button>
          </div>
        )}

        {/* Ban/Suspend Actions */}
        <div className="pt-4 border-t border-gray-700/50">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            User Status
          </label>
          <div className="space-y-2">
            {isBanned ? (
              <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-red-400">Banned</p>
                  <p className="text-xs text-gray-400">
                    Banned on {bannedAt ? new Date(bannedAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setModalAction('unban');
                    setModalOpen(true);
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Unban
                </button>
              </div>
            ) : isSuspended ? (
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-yellow-400">Suspended</p>
                  <p className="text-xs text-gray-400">
                    Until {suspendedUntil ? new Date(suspendedUntil).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setModalAction('unsuspend');
                    setModalOpen(true);
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Unsuspend
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setModalAction('ban');
                    setModalOpen(true);
                  }}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Ban User
                </button>
                <button
                  onClick={() => {
                    setModalAction('suspend');
                    setModalOpen(true);
                  }}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Suspend User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ban/Suspend Modal */}
      <BanSuspendModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        action={modalAction}
        currentStatus={{
          banned: isBanned,
          suspended: isSuspended,
          suspendedUntil: suspendedUntil || null,
        }}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}

