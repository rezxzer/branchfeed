import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { getStoryById } from '@/lib/stories.server'
import { StoryDetailPageClient } from '@/components/story/StoryDetailPageClient'
import { siteConfig } from '@/config/site'

interface StoryDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: StoryDetailPageProps): Promise<Metadata> {
  const { id } = await params
  
  try {
    const story = await getStoryById(id)
    
    if (!story) {
      // Fallback metadata if story not found
      return {
        title: 'Story Not Found',
        description: 'The story you are looking for does not exist.',
      }
    }

    const title = `${story.title} | BranchFeed`
    const description = story.description || `Watch ${story.title} - an interactive branching story on BranchFeed.`
    const storyUrl = `${siteConfig.url}/story/${id}`
    
    // Use story media as OG image if available, otherwise use default
    const ogImage = story.media_url && story.media_type === 'image'
      ? story.media_url
      : siteConfig.ogImage

    return {
      title,
      description,
      openGraph: {
        type: 'article',
        title,
        description,
        url: storyUrl,
        siteName: siteConfig.name,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: story.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    }
  } catch (error) {
    console.error('Error generating metadata for story:', error)
    // Fallback metadata on error
    return {
      title: 'Story | BranchFeed',
      description: siteConfig.description,
    }
  }
}

export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  const { id } = await params

  return <StoryDetailPageClient storyId={id} />
}

