/**
 * User Details Client Component
 * 
 * Displays detailed user information and management actions.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { UserActions } from './UserActions';

interface Profile {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  language_preference: string;
  created_at: string;
  updated_at: string;
  banned_at?: string | null;
  suspended_until?: string | null;
  ban_reason?: string | null;
}

interface AdminRole {
  role: string;
  permissions: Record<string, boolean> | null;
  created_at: string;
}

interface UserStats {
  storiesCount: number;
  likesCount: number;
  commentsCount: number;
}

interface Story {
  id: string;
  title: string;
  created_at: string;
  views_count: number;
  likes_count: number;
}

interface UserDetailsClientProps {
  userId: string;
}

export function UserDetailsClient({ userId }: UserDetailsClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [stats, setStats] = useState<UserStats>({
    storiesCount: 0,
    likesCount: 0,
    commentsCount: 0,
  });
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/users/${userId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found');
          } else {
            setError('Failed to load user details');
          }
          return;
        }

        const data = await response.json();
        setProfile(data.profile);
        setAdminRole(data.adminRole);
        setStats(data.stats);
        setRecentStories(data.recentStories || []);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-700/50 rounded-lg animate-pulse w-64" />
        <div className="h-96 bg-gray-800/80 rounded-2xl border border-gray-700/50 animate-pulse" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-12 text-center">
        <p className="text-red-400 mb-4">{error || 'User not found'}</p>
        <Link
          href="/admin/users"
          className="text-brand-cyan hover:text-brand-cyan/80 transition-colors"
        >
          ← Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Users
          </Link>
          <h2 className="text-2xl font-bold text-white">User Details</h2>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
        <div className="flex items-start gap-6">
          {profile.avatar_url ? (
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
              <Image
                src={profile.avatar_url}
                alt={profile.username}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                style={{ width: 'auto', height: 'auto' }}
                unoptimized
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-brand flex items-center justify-center text-white text-3xl font-bold">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-white">{profile.username}</h3>
              {adminRole && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400/20 text-yellow-400">
                  👑 {adminRole.role.replace('_', ' ')}
                </span>
              )}
            </div>
            <p className="text-gray-400 mb-4">{profile.email || 'No email'}</p>
            {profile.bio && (
              <p className="text-gray-300 mb-4">{profile.bio}</p>
            )}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Language: {profile.language_preference}</span>
              <span>Joined: {new Date(profile.created_at).toLocaleDateString()}</span>
              <span>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
          <div className="text-sm text-gray-400 mb-1">Stories Created</div>
          <div className="text-3xl font-bold text-white">{stats.storiesCount}</div>
        </div>
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
          <div className="text-sm text-gray-400 mb-1">Likes Given</div>
          <div className="text-3xl font-bold text-white">{stats.likesCount}</div>
        </div>
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
          <div className="text-sm text-gray-400 mb-1">Comments Made</div>
          <div className="text-3xl font-bold text-white">{stats.commentsCount}</div>
        </div>
      </div>

      {/* User Actions */}
      <UserActions 
        userId={userId} 
        currentRole={adminRole?.role || null}
        bannedAt={profile.banned_at || null}
        suspendedUntil={profile.suspended_until || null}
      />

      {/* Recent Stories */}
      {recentStories.length > 0 && (
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Stories</h3>
          <div className="space-y-3">
            {recentStories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="block p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{story.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span>{new Date(story.created_at).toLocaleDateString()}</span>
                      <span>👁️ {story.views_count}</span>
                      <span>❤️ {story.likes_count}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

