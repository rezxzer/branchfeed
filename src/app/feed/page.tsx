import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { FeedPageClient } from '@/components/feed/FeedPageClient'
import { getCurrentUser } from '@/lib/auth'
import { siteConfig } from '@/config/site'

// Revalidate feed page every 30 seconds
export const revalidate = 30

export const metadata: Metadata = {
  title: 'Feed',
  description: 'Discover and explore interactive branching stories on BranchFeed.',
  openGraph: {
    type: 'website',
    title: 'Feed | BranchFeed',
    description: 'Discover and explore interactive branching stories on BranchFeed.',
    url: `${siteConfig.url}/feed`,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'BranchFeed Feed',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feed | BranchFeed',
    description: 'Discover and explore interactive branching stories on BranchFeed.',
    images: [siteConfig.ogImage],
  },
}

interface FeedPageProps {
  searchParams: Promise<{ tag?: string }>
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  // Check authentication - redirect to signin if not authenticated
  const user = await getCurrentUser()
  if (!user) {
    redirect('/signin')
  }

  const params = await searchParams
  return <FeedPageClient tagSlug={params.tag} />
}
