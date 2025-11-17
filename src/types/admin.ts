/**
 * Admin System Types
 * 
 * Defines types for admin roles, permissions, and admin-related data structures.
 */

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export interface AdminPermissions {
  canManageUsers: boolean;
  canModerateContent: boolean;
  canViewAnalytics: boolean;
  canManageAdmins: boolean;
  canAccessSettings: boolean;
  canDeleteContent: boolean;
  canBanUsers: boolean;
}

export const rolePermissions: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    canManageUsers: true,
    canModerateContent: true,
    canViewAnalytics: true,
    canManageAdmins: true,
    canAccessSettings: true,
    canDeleteContent: true,
    canBanUsers: true,
  },
  admin: {
    canManageUsers: true,
    canModerateContent: true,
    canViewAnalytics: true,
    canManageAdmins: false,
    canAccessSettings: false,
    canDeleteContent: true,
    canBanUsers: true,
  },
  moderator: {
    canManageUsers: false,
    canModerateContent: true,
    canViewAnalytics: false,
    canManageAdmins: false,
    canAccessSettings: false,
    canDeleteContent: true,
    canBanUsers: false,
  },
  support: {
    canManageUsers: false,
    canModerateContent: false,
    canViewAnalytics: false,
    canManageAdmins: false,
    canAccessSettings: false,
    canDeleteContent: false,
    canBanUsers: false,
  },
};

export interface AdminRoleRecord {
  id: string;
  user_id: string;
  role: AdminRole;
  permissions: Record<string, boolean> | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  content_type: 'story' | 'post' | 'comment';
  content_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_id: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalStories: number;
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
}

