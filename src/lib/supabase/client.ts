'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClientClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // In development, return a mock client that fails gracefully
    // This prevents runtime errors when env vars are not set
    console.warn(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
    // Return a minimal mock client that will fail gracefully on use
    const mockQuery = {
      eq: () => mockQuery,
      order: () => mockQuery,
      range: () => Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    }
    const mockTable = {
      select: () => mockQuery,
    }
    return {
      from: () => mockTable,
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
    } as any
  }

  // Validate URL format before passing to createBrowserClient
  try {
    // Check if it looks like a JWT token (common mistake: swapped URL and KEY)
    if (supabaseUrl.startsWith('eyJ') && supabaseUrl.length > 100) {
      throw new Error(
        `It looks like NEXT_PUBLIC_SUPABASE_URL contains a JWT token instead of a URL. ` +
          `Please check your .env.local file - you may have swapped NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. ` +
          `URL should start with https:// (e.g., https://your-project-id.supabase.co)`
      )
    }

    const url = new URL(supabaseUrl)
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Supabase URL must use HTTP or HTTPS protocol')
    }

    // Check if it looks like a Supabase URL
    if (!url.hostname.includes('supabase')) {
      console.warn(
        `Warning: NEXT_PUBLIC_SUPABASE_URL hostname doesn't contain "supabase". ` +
          `Are you sure this is correct? Expected format: https://your-project-id.supabase.co`
      )
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Invalid NEXT_PUBLIC_SUPABASE_URL format: "${supabaseUrl.substring(0, 50)}...". ` +
          `Must be a valid HTTP or HTTPS URL (e.g., https://your-project-id.supabase.co). ` +
          `If you see a JWT token here, you may have swapped URL and ANON_KEY in your .env.local file.`
      )
    }
    throw error
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

