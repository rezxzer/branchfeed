/**
 * Comments API Route
 * 
 * Creates a new comment with subscription limit checking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkSubscriptionLimit } from '@/lib/subscription-checks';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const MAX_COMMENT_LENGTH = Number(process.env.NEXT_PUBLIC_MAX_COMMENT_LENGTH || 500);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { storyId, content } = body as { storyId: string; content: string };

    if (!storyId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: storyId and content' },
        { status: 400 }
      );
    }

    // Validate content
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Check subscription limit for comments
    const limitCheck = await checkSubscriptionLimit(profile.id, 'comment');
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.reason || 'Daily comment limit reached',
          limitExceeded: true,
          remaining: limitCheck.remaining,
        },
        { status: 403 }
      );
    }

    // Verify story exists
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id')
      .eq('id', storyId)
      .single();

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        story_id: storyId,
        node_id: null,
        user_id: profile.id,
        content: trimmedContent,
      })
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
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { error: 'Failed to create comment', details: commentError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('Error in comments API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

