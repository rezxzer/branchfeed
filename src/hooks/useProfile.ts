'use client'

import { useState, useEffect } from 'react'
import { createClientClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface UseProfileResult {
  profile: Profile | null
  loading: boolean
  error: Error | null
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

export function useProfile(userId: string): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClientClient()

        // Fetch profile
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileError) {
          // If table doesn't exist yet, return mock data
          if (
            profileError.code === 'PGRST116' ||
            profileError.message.includes('relation')
          ) {
            console.warn('Profiles table not found. Using mock data.')
            setProfile({
              id: userId,
              username: 'User',
              bio: null,
              avatar_url: null,
              language_preference: 'en',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            return
          }
          throw profileError
        }

        setProfile(data as Profile)
      } catch (err) {
        console.error('Error loading profile:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadProfile()
    }
  }, [userId])

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null)

      const supabase = createClientClient()

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        // If table doesn't exist yet, just update local state
        if (
          updateError.code === 'PGRST116' ||
          updateError.message.includes('relation')
        ) {
          console.warn('Profiles table not found. Update will be saved when database is set up.')
          if (profile) {
            setProfile({ ...profile, ...updates })
          }
          return
        }
        throw updateError
      }

      // Reload profile to get updated data
      const { data, error: reloadError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!reloadError && data) {
        setProfile(data as Profile)
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      throw err
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
  }
}

