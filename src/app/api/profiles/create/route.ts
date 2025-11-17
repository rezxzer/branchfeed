/**
 * Profile Creation API Route
 * 
 * POST: Manually create a profile for a user (fallback if trigger fails)
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 400 }
      )
    }

    // Generate default username from email
    const defaultUsername = user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`
    
    // Try to create profile with regular client first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: defaultUsername,
        email: user.email || null,
        language_preference: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      // If regular client fails (RLS issue), try with admin client
      const adminClient = createAdminSupabaseClient()
      
      if (!adminClient) {
        console.error('Admin client not available, cannot create profile')
        return NextResponse.json(
          { error: 'Failed to create profile. Please contact support.' },
          { status: 500 }
        )
      }

      // Check if username already exists and make it unique
      let finalUsername = defaultUsername
      let counter = 0
      let usernameExists = true

      while (usernameExists && counter < 100) {
        const { data: existing } = await adminClient
          .from('profiles')
          .select('id')
          .eq('username', finalUsername)
          .maybeSingle()

        if (!existing) {
          usernameExists = false
        } else {
          counter++
          finalUsername = `${defaultUsername}${counter}`
        }
      }

      // Create profile with admin client
      // Use type assertion to bypass TypeScript strict checking
      const profileData = {
        id: user.id,
        username: finalUsername,
        email: user.email || null,
        language_preference: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      const { data: adminProfile, error: adminError } = await adminClient
        .from('profiles')
        .insert(profileData as any)
        .select()
        .single()

      if (adminError) {
        console.error('Error creating profile with admin client:', adminError)
        return NextResponse.json(
          { error: 'Failed to create profile. Please contact support.' },
          { status: 500 }
        )
      }

      return NextResponse.json({ profile: adminProfile })
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error('Error in POST /api/profiles/create:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

