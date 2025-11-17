/**
 * Comment Like API Route
 * 
 * POST: Like a comment
 * DELETE: Unlike a comment
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(
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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: commentId } = await params

    // Check if comment exists
    const { data: existingComment, error: commentCheckError } = await supabase
      .from('comments')
      .select('id')
      .eq('id', commentId)
      .single()

    if (commentCheckError || !existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if already liked
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      return NextResponse.json(
        { error: 'Comment already liked' },
        { status: 400 }
      )
    }

    // Insert like
    const { data: like, error: likeError } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: user.id,
      })
      .select()
      .single()

    if (likeError) {
      console.error('Error liking comment:', likeError)
      return NextResponse.json(
        { error: 'Failed to like comment' },
        { status: 500 }
      )
    }

    // Get updated likes count
    const { data: updatedComment, error: commentFetchError } = await supabase
      .from('comments')
      .select('likes_count')
      .eq('id', commentId)
      .single()

    return NextResponse.json({ 
      success: true, 
      like,
      liked: true,
      likesCount: updatedComment?.likes_count || 0
    })
  } catch (error: any) {
    console.error('Error in POST /api/comments/[id]/like:', error)
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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: commentId } = await params

    // Delete like
    const { error: deleteError } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error unliking comment:', deleteError)
      return NextResponse.json(
        { error: 'Failed to unlike comment' },
        { status: 500 }
      )
    }

    // Get updated likes count
    const { data: updatedComment, error: commentFetchError } = await supabase
      .from('comments')
      .select('likes_count')
      .eq('id', commentId)
      .single()

    return NextResponse.json({ 
      success: true,
      liked: false,
      likesCount: updatedComment?.likes_count || 0
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/comments/[id]/like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

