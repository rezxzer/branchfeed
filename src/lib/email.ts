/**
 * Email Service
 * 
 * This module provides email sending functionality using Resend.
 */

import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'notifications@branchfeed.com'
const FROM_NAME = process.env.RESEND_FROM_NAME || 'BranchFeed'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email
 * @param options - Email options
 * @returns Promise<boolean> - True if email was sent successfully
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set. Email sending skipped.')
      return false
    }

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    })

    if (error) {
      console.error('Error sending email:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in sendEmail:', error)
    return false
  }
}

/**
 * Generate email template for notification
 */
export function generateNotificationEmail(
  notificationType: 'follow' | 'like' | 'comment' | 'reply' | 'story_new',
  actorUsername: string,
  actorAvatarUrl: string | null,
  targetTitle?: string,
  targetUrl?: string
): { subject: string; html: string; text: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://branchfeed.vercel.app'
  const actorDisplay = actorUsername || 'Someone'
  
  let subject = ''
  let message = ''
  let actionText = ''
  let actionUrl = targetUrl || `${baseUrl}/feed`

  switch (notificationType) {
    case 'follow':
      subject = `${actorDisplay} started following you on BranchFeed`
      message = `${actorDisplay} started following you.`
      actionText = 'View Profile'
      actionUrl = `${baseUrl}/profile/${actorUsername}`
      break
    case 'like':
      subject = `${actorDisplay} liked your story`
      message = `${actorDisplay} liked your story${targetTitle ? ` "${targetTitle}"` : ''}.`
      actionText = 'View Story'
      break
    case 'comment':
      subject = `${actorDisplay} commented on your story`
      message = `${actorDisplay} commented on your story${targetTitle ? ` "${targetTitle}"` : ''}.`
      actionText = 'View Comment'
      break
    case 'reply':
      subject = `${actorDisplay} replied to your comment`
      message = `${actorDisplay} replied to your comment.`
      actionText = 'View Reply'
      break
    case 'story_new':
      subject = `${actorDisplay} published a new story`
      message = `${actorDisplay} published a new story${targetTitle ? ` "${targetTitle}"` : ''}.`
      actionText = 'Read Story'
      break
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🌿 BranchFeed</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      ${actorAvatarUrl 
        ? `<img src="${actorAvatarUrl}" alt="${actorDisplay}" style="width: 48px; height: 48px; border-radius: 50%; margin-right: 12px; object-fit: cover;">`
        : `<div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; margin-right: 12px;">${actorDisplay.charAt(0).toUpperCase()}</div>`
      }
      <div>
        <p style="margin: 0; font-size: 16px; color: #1f2937;">${message}</p>
      </div>
    </div>
    
    <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">${actionText}</a>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
      <p style="margin: 0;">You're receiving this email because you have email notifications enabled for ${notificationType} notifications.</p>
      <p style="margin: 10px 0 0 0;">
        <a href="${baseUrl}/settings?tab=notifications" style="color: #667eea; text-decoration: none;">Manage notification preferences</a>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
    <p style="margin: 0;">© ${new Date().getFullYear()} BranchFeed. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim()

  const text = `
BranchFeed Notification

${message}

${actionText}: ${actionUrl}

You're receiving this email because you have email notifications enabled for ${notificationType} notifications.
Manage notification preferences: ${baseUrl}/settings?tab=notifications

© ${new Date().getFullYear()} BranchFeed. All rights reserved.
  `.trim()

  return { subject, html, text }
}

