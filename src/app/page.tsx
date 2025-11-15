import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'BranchFeed – Interactive Branching Stories',
  description: 'Create and explore interactive branching video stories with A/B choices. Shape the narrative by choosing your path through each story.',
  keywords: ['branching stories', 'interactive video', 'choose your own adventure', 'storytelling', 'video stories', 'interactive content'],
  openGraph: {
    type: 'website',
    title: 'BranchFeed – Interactive Branching Stories',
    description: 'Create and explore interactive branching video stories with A/B choices.',
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'BranchFeed – Interactive Branching Stories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BranchFeed – Interactive Branching Stories',
    description: 'Create and explore interactive branching video stories with A/B choices.',
    images: [siteConfig.ogImage],
  },
}

export default async function Home() {
  const user = await getCurrentUser()

  // Redirect to feed if already authenticated
  if (user) {
    redirect('/feed')
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
    </div>
  )
}

