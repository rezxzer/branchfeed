import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkSubscriptionLimit } from '@/lib/subscription-checks'

// Type for story views_count field
interface StoryViewsData {
  views_count: number | null
}

/**
 * POST /api/stories/[id]/view
 * 
 * Increment views_count for a story.
 * Uses service-role client to bypass RLS.
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing story id
 * @returns JSON response with updated viewsCount or error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate id parameter
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      )
    }

    // Check subscription limit for views
    const supabase = await createServerSupabaseClient()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (profile) {
          const limitCheck = await checkSubscriptionLimit(profile.id, 'view')
          if (!limitCheck.allowed) {
            return NextResponse.json(
              { 
                error: limitCheck.reason || 'Daily view limit reached',
                limitExceeded: true,
                remaining: limitCheck.remaining,
              },
              { status: 403 }
            )
          }
        }
      }
    }

    // Create admin client (service-role, bypasses RLS)
    // If admin client is not available, we'll use a fallback approach
    const adminSupabase = createAdminSupabaseClient()

    let viewsCount = 0

    if (adminSupabase) {
      try {
        // Fetch current views_count
        const { data: currentStory, error: fetchError } = await adminSupabase
          .from('stories')
          .select('views_count')
          .eq('id', id)
          .single()

        if (fetchError || !currentStory) {
          console.error('Error fetching story for view increment:', fetchError)
          return NextResponse.json(
            { error: 'Story not found' },
            { status: 404 }
          )
        }

        // Increment views_count
        const storyData = currentStory as StoryViewsData
        const currentViews = storyData.views_count ?? 0
        const newViewsCount = currentViews + 1

        // Update with new count
        // Using type assertion to work around Supabase type inference limitations
        const { data: updatedStory, error: updateError } = await adminSupabase
          .from('stories')
          .update({ views_count: newViewsCount } as never)
          .eq('id', id)
          .select('views_count')
          .single()

        if (updateError) {
          console.error('Error incrementing views:', updateError)
          return NextResponse.json(
            { error: 'Failed to increment views' },
            { status: 500 }
          )
        }

        if (!updatedStory) {
          return NextResponse.json(
            { error: 'Story not found after update' },
            { status: 404 }
          )
        }

        const updatedData = updatedStory as StoryViewsData
        viewsCount = updatedData.views_count ?? 0
      } catch (error) {
        console.error('Error in admin client view increment:', error)
        return NextResponse.json(
          { error: 'Failed to increment views' },
          { status: 500 }
        )
      }
    } else {
      // Admin client not available - try to get current views without incrementing
      // This is a graceful degradation: views won't increment, but we return current count
      console.warn(
        'Admin Supabase client not available. View increment skipped. Make sure SUPABASE_SERVICE_ROLE_KEY is set in environment variables.'
      )
      
      // Try to get current views count using authenticated client (if RLS allows reading)
      try {
        const authenticatedSupabase = await createServerSupabaseClient()
        if (authenticatedSupabase) {
          const { data: storyData, error: readError } = await authenticatedSupabase
            .from('stories')
            .select('views_count')
            .eq('id', id)
            .single()

          if (!readError && storyData) {
            const storyViewsData = storyData as StoryViewsData
            viewsCount = storyViewsData.views_count ?? 0
          } else {
            // If we can't read, return 0 as fallback
            viewsCount = 0
          }
        } else {
          viewsCount = 0
        }
      } catch (error) {
        console.error('Error getting views count with authenticated client:', error)
        viewsCount = 0
      }
    }

    return NextResponse.json(
      { viewsCount },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in view increment route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

