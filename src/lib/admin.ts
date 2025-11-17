/**
 * Admin Helper Functions
 * 
 * Server-side functions for checking admin status and permissions.
 * These functions query the database to check if a user has admin privileges.
 */

import { createServerSupabaseClient } from './supabase/server';
import type { AdminRole, AdminPermissions } from '@/types/admin';

/**
 * Check if a user is an admin
 * @param userId - The user ID to check
 * @returns true if user has any admin role, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get admin role for a user
 * @param userId - The user ID to check
 * @returns Admin role or null if user is not admin
 */
export async function getAdminRole(userId: string): Promise<AdminRole | null> {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role as AdminRole;
  } catch (error) {
    console.error('Error getting admin role:', error);
    return null;
  }
}

/**
 * Check if a user has a specific admin permission
 * @param userId - The user ID to check
 * @param permission - The permission to check (e.g., 'canManageUsers')
 * @returns true if user has the permission, false otherwise
 */
export async function hasAdminPermission(
  userId: string,
  permission: keyof AdminPermissions
): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return false;
    }
    
    // First check if user is admin
    const { data: adminRole, error: roleError } = await supabase
      .from('admin_roles')
      .select('role, permissions')
      .eq('user_id', userId)
      .single();

    if (roleError || !adminRole) {
      return false;
    }

    // Check custom permissions override
    if (adminRole.permissions && typeof adminRole.permissions === 'object') {
      const perms = adminRole.permissions as Record<string, boolean>;
      if (permission in perms) {
        return perms[permission] === true;
      }
    }

    // Use database function for permission check (more reliable)
    const { data: hasPermission, error: permError } = await supabase
      .rpc('has_admin_permission', {
        user_id: userId,
        permission: permission,
      });

    if (permError || hasPermission === null) {
      // Fallback to client-side check if RPC fails
      return checkPermissionByRole(adminRole.role as AdminRole, permission);
    }

    return hasPermission === true;
  } catch (error) {
    console.error('Error checking admin permission:', error);
    return false;
  }
}

/**
 * Client-side fallback permission check by role
 * This matches the logic in the database function
 */
function checkPermissionByRole(
  role: AdminRole,
  permission: keyof AdminPermissions
): boolean {
  // Import rolePermissions dynamically to avoid circular dependency
  const { rolePermissions } = require('@/types/admin');
  
  const rolePerms = rolePermissions[role];
  if (!rolePerms) {
    return false;
  }

  return rolePerms[permission] === true;
}

/**
 * Get admin permissions for a user
 * @param userId - The user ID to check
 * @returns Admin permissions object or null if user is not admin
 */
export async function getAdminPermissions(
  userId: string
): Promise<AdminPermissions | null> {
  try {
    const role = await getAdminRole(userId);
    if (!role) {
      return null;
    }

    const { rolePermissions } = await import('@/types/admin');
    return rolePermissions[role];
  } catch (error) {
    console.error('Error getting admin permissions:', error);
    return null;
  }
}

