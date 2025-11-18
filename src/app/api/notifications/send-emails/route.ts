import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { sendEmail, generateNotificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

/**
 * POST /api/notifications/send-emails
 * 
 * Send email notifications for unread notifications.
 * This should be called by a cron job periodically (e.g., every 5 minutes).
 * 
 * Security: This endpoint should be protected (e.g., with a secret token)
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Check for authorization token
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const adminSupabase = createAdminSupabaseClient()
    
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    // Get unread notifications from the last hour that haven't been emailed
    // We'll add an email_sent column later, for now we'll just check unread notifications
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const { data: notifications, error: notificationsError } = await adminSupabase
      .from('notifications')
      .select(`
        id,
        user_id,
        type,
        actor_id,
        target_id,
        target_type,
        created_at,
        actor:profiles!notifications_actor_id_fkey(
          id,
          username,
          avatar_url
        ),
        user:profiles!notifications_user_id_fkey(
          id,
          email,
          notification_preferences
        )
      `)
      .eq('is_read', false)
      .gte('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: true })
      .limit(100) // Process up to 100 notifications at a time

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError)
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: notificationsError.message },
        { status: 500 }
      )
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'No unread notifications to send',
      })
    }

    let sentCount = 0
    let errorCount = 0

    // Process each notification
    for (const notification of notifications as any[]) {
      try {
        const user = notification.user as any
        const actor = notification.actor as any

        if (!user || !user.email) {
          console.warn(`User ${notification.user_id} has no email, skipping notification ${notification.id}`)
          continue
        }

        // Check if email notifications are enabled for this notification type
        const prefs = user.notification_preferences || {}
        const emailPrefKey = `email_${notification.type}` as keyof typeof prefs
        const emailEnabled = prefs[emailPrefKey] !== false // Default to true if not set

        if (!emailEnabled) {
          continue // Skip if email notifications are disabled for this type
        }

        // Get target story/comment title if available
        let targetTitle: string | undefined
        let targetUrl: string | undefined

        if (notification.target_id && notification.target_type === 'story') {
          const { data: story } = await adminSupabase
            .from('stories')
            .select('id, title')
            .eq('id', notification.target_id)
            .single()

          if (story) {
            const storyData = story as { id: string; title: string }
            targetTitle = storyData.title
            targetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://branchfeed.vercel.app'}/story/${storyData.id}`
          }
        } else if (notification.target_id && notification.target_type === 'comment') {
          const { data: comment } = await adminSupabase
            .from('comments')
            .select('id, story_id')
            .eq('id', notification.target_id)
            .single()

          if (comment) {
            const commentData = comment as { id: string; story_id: string }
            const { data: story } = await adminSupabase
              .from('stories')
              .select('id, title')
              .eq('id', commentData.story_id)
              .single()

            if (story) {
              const storyData = story as { id: string; title: string }
              targetTitle = storyData.title
              targetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://branchfeed.vercel.app'}/story/${storyData.id}`
            }
          }
        }

        // Generate email
        const emailContent = generateNotificationEmail(
          notification.type as 'follow' | 'like' | 'comment' | 'reply' | 'story_new',
          actor?.username || 'Someone',
          actor?.avatar_url || null,
          targetTitle,
          targetUrl
        )

        // Send email
        const emailSent = await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        })

        if (emailSent) {
          sentCount++
        } else {
          errorCount++
        }
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: notifications.length,
      message: `Sent ${sentCount} email notifications`,
    })
  } catch (error: any) {
    console.error('Error in POST /api/notifications/send-emails:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for manual testing/debugging
 */
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminSupabaseClient()
    
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    // Get count of unread notifications from the last hour
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const { count, error } = await adminSupabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .gte('created_at', oneHourAgo.toISOString())

    if (error) {
      console.error('Error fetching notification count:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notification count', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      unreadNotifications: count || 0,
      timeRange: 'last hour',
      currentTime: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error in GET /api/notifications/send-emails:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

