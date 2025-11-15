import { createServerSupabaseClient } from './supabase/server'
import { createClientClient } from './supabase/client'
import type { User } from '@supabase/supabase-js'

/**
 * Get current user (Server-side)
 * Use this in Server Components and Server Actions
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Check if env variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      // Gracefully return null if env vars are not set
      return null
    }

    const supabase = await createServerSupabaseClient()
    
    // If supabase client is null, return null gracefully
    if (!supabase) {
      return null
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

/**
 * Sign in with email and password (Client-side)
 */
export async function signIn(email: string, password: string) {
  const supabase = createClientClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign up with email and password (Client-side)
 */
export async function signUp(email: string, password: string) {
  const supabase = createClientClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign out (Client-side)
 */
export async function signOut() {
  const supabase = createClientClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

/**
 * Get current user (Client-side)
 * Use this in Client Components
 */
export async function getCurrentUserClient(): Promise<User | null> {
  try {
    const supabase = createClientClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Error in getCurrentUserClient:', error)
    return null
  }
}

