/**
 * Comment API Route - Edit and Delete
 * 
 * PATCH: Update comment content
 * DELETE: Delete comment
 * Requires authentication and ownership (or admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const MAX_COMMENT_LENGTH = Number(process.env.NEXT_PUBLIC_MAX_COMMENT_LENGTH || 500)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const { id } = await params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get comment to check ownership
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id, content')
      .eq('id', id)
      .single()

    if (commentError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check ownership or admin
    const userIsAdmin = await isAdmin(user.id)
    if (comment.user_id !== user.id && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own comments' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { content } = body as { content?: string }

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Validate content
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      )
    }

    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Update comment
    const { data: updatedComment, error: updateError } = await supabase
      .from('comments')
      .update({
        content: trimmedContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        author:profiles(
          id,
          username,
          avatar_url
        )
      `
      )
      .single()

    if (updateError) {
      console.error('Error updating comment:', updateError)
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ comment: updatedComment })
  } catch (error: any) {
    console.error('Error in PATCH /api/comments/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const { id } = await params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get comment to check ownership
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (commentError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check ownership or admin
    const userIsAdmin = await isAdmin(user.id)
    if (comment.user_id !== user.id && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own comments' },
        { status: 403 }
      )
    }

    // Delete comment (cascade will delete replies)
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting comment:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/comments/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

