/**
 * Supabase Admin Client (Service Role)
 * 
 * This module provides a service-role Supabase client for admin operations.
 * Use this ONLY in server-side API routes for operations that bypass RLS.
 * 
 * WARNING: Never expose service-role key to client-side code.
 */

import { createClient } from '@supabase/supabase-js'

let adminClient: ReturnType<typeof createClient> | null = null

/**
 * Create or get cached Supabase admin client (service-role)
 * Use this in API routes for operations that need to bypass RLS
 * @returns Supabase client with service-role key, or null if env vars are missing
 */
export function createAdminSupabaseClient() {
  // Return cached client if already created
  if (adminClient) {
    return adminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn(
      'Missing Supabase admin environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.'
    )
    return null
  }

  // Create service-role client (bypasses RLS)
  adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}

