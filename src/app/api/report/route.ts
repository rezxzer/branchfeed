/**
 * Content Reporting API Route
 * 
 * Allows users to report inappropriate content (stories, comments).
 * Creates a content report record for admin review.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[REPORT API] Starting report submission...');
    
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      console.error('[REPORT API] Supabase client is null');
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[REPORT API] Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('[REPORT API] User authenticated:', user.id);

    // Get user's profile ID (profiles.id = auth.users.id, but we need to verify profile exists)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, banned_at, suspended_until')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Profile not found. Please complete your profile first.' },
        { status: 404 }
      );
    }

    // Check if user is banned or suspended
    const isBanned = profile.banned_at !== null && profile.banned_at !== undefined;
    const isSuspended = profile.suspended_until !== null && 
                       profile.suspended_until !== undefined && 
                       new Date(profile.suspended_until) > new Date();

    if (isBanned) {
      return NextResponse.json(
        { error: 'Your account has been banned. You cannot submit reports.' },
        { status: 403 }
      );
    }

    if (isSuspended) {
      return NextResponse.json(
        { error: `Your account is suspended until ${new Date(profile.suspended_until).toLocaleString()}. You cannot submit reports.` },
        { status: 403 }
      );
    }

    // Get request body
    let body;
    try {
      body = await request.json();
      console.log('[REPORT API] Request body:', { 
        content_type: body.content_type, 
        content_id: body.content_id,
        hasReason: !!body.reason,
        hasDescription: !!body.description,
      });
    } catch (parseError) {
      console.error('[REPORT API] Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { content_type, content_id, reason, description } = body;

    // Validate input
    if (!content_type || !['story', 'comment', 'post'].includes(content_type)) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be: story, comment, or post' },
        { status: 400 }
      );
    }

    if (!content_id || typeof content_id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content ID' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Report reason is required' },
        { status: 400 }
      );
    }

    // Check if content exists
    let contentExists = false;
    if (content_type === 'story') {
      const { data: story } = await supabase
        .from('stories')
        .select('id')
        .eq('id', content_id)
        .single();
      contentExists = !!story;
    } else if (content_type === 'comment') {
      const { data: comment } = await supabase
        .from('comments')
        .select('id')
        .eq('id', content_id)
        .single();
      contentExists = !!comment;
    }

    if (!contentExists) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Check if user already reported this content
    const { data: existingReport, error: existingReportError } = await supabase
      .from('content_reports')
      .select('id')
      .eq('reporter_id', profile.id)
      .eq('content_type', content_type)
      .eq('content_id', content_id)
      .maybeSingle();

    if (existingReportError && existingReportError.code !== 'PGRST116') {
      console.error('[REPORT API] Error checking existing report:', existingReportError);
    }

    if (existingReport) {
      console.log('[REPORT API] User already reported this content');
      return NextResponse.json(
        { error: 'You have already reported this content' },
        { status: 400 }
      );
    }
    
    console.log('[REPORT API] No existing report found, proceeding with creation...');

    // Prepare report data (only include description if column exists)
    const reportData: {
      reporter_id: string;
      content_type: string;
      content_id: string;
      reason: string;
      status: string;
      description?: string | null;
    } = {
      reporter_id: profile.id,
      content_type: content_type,
      content_id: content_id,
      reason: reason.trim(),
      status: 'pending',
    };

    // Only add description if it's provided (column may not exist in older migrations)
    if (description !== undefined && description !== null) {
      reportData.description = description.trim() || null;
    }

    console.log('Creating report with data:', {
      reporter_id: reportData.reporter_id,
      content_type: reportData.content_type,
      content_id: reportData.content_id,
      reason: reportData.reason,
      hasDescription: 'description' in reportData,
    });

    // Create report
    const { data: report, error: reportError } = await supabase
      .from('content_reports')
      .insert(reportData)
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', {
        message: reportError.message,
        code: reportError.code,
        details: reportError.details,
        hint: reportError.hint,
        fullError: JSON.stringify(reportError, null, 2),
        reportData: reportData,
      });
      
      // Check if it's a column doesn't exist error (description column)
      if (reportError.code === '42703' || reportError.message?.includes('column') || reportError.message?.includes('does not exist')) {
        // Try again without description column
        const { data: reportWithoutDesc, error: reportErrorWithoutDesc } = await supabase
          .from('content_reports')
          .insert({
            reporter_id: profile.id,
            content_type: content_type,
            content_id: content_id,
            reason: reason.trim(),
            status: 'pending',
          })
          .select()
          .single();

        if (reportErrorWithoutDesc) {
          console.error('Error creating report without description:', reportErrorWithoutDesc);
          return NextResponse.json(
            { 
              error: 'Failed to submit report',
              details: reportErrorWithoutDesc.message || 'Unknown error',
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          report: reportWithoutDesc,
          message: 'Report submitted successfully. Our team will review it shortly.',
        }, { status: 200 });
      }
      
      // Check if it's an RLS policy error
      if (reportError.code === '42501' || reportError.message?.includes('permission denied') || reportError.message?.includes('policy')) {
        return NextResponse.json(
          { 
            error: 'Permission denied. Please ensure you are logged in and your account is active.',
            details: reportError.message || 'RLS policy violation',
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to submit report',
          details: reportError.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report: report,
      message: 'Report submitted successfully. Our team will review it shortly.',
    }, { status: 200 });
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

