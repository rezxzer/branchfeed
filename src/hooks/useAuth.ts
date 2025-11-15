'use client'

import { useState, useEffect } from 'react'
import { createClientClient } from '@/lib/supabase/client'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export interface AuthResult {
  success: boolean
  error?: {
    message: string
    code?: string
  }
}

export interface UseAuthReturn {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    try {
      const supabase = createClientClient()

      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      // Graceful degradation: if Supabase is not configured, just log and continue
      if (error instanceof Error && error.message.includes('Supabase')) {
        console.warn(
          'Supabase is not configured. Authentication features will be disabled.',
          error.message
        )
      } else {
        console.error('Error initializing auth:', error)
      }
      setLoading(false)
    }
  }, [])

  const signUp = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const supabase = createClientClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.status?.toString(),
          },
        }
      }

      if (data.user) {
        setUser(data.user)
        return { success: true }
      }

      return {
        success: false,
        error: { message: 'Failed to create account' },
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: {
          message: 'Network error. Please try again.',
        },
      }
    }
  }

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const supabase = createClientClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.status?.toString(),
          },
        }
      }

      if (data.user) {
        setUser(data.user)
        return { success: true }
      }

      return {
        success: false,
        error: { message: 'Failed to sign in' },
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: {
          message: 'Network error. Please try again.',
        },
      }
    }
  }

  const signOut = async () => {
    try {
      const supabase = createClientClient()
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      // Graceful degradation: if Supabase is not configured, just clear local state
      console.warn('Sign out failed (Supabase not configured):', error)
      setUser(null)
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
  }
}

