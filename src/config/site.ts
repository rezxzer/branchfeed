/**
 * Site Configuration
 * 
 * Centralized configuration for site metadata, URLs, and branding
 */

export const siteConfig = {
  name: 'BranchFeed',
  description: 'Create and explore interactive branching video stories with A/B choices. Each story is built as a branching path, so viewers can shape the narrative by choosing the next step.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://branchfeed.vercel.app',
  ogImage: '/og/default-story.svg',
}

