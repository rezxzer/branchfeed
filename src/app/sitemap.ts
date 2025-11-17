import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { siteConfig } from '@/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Dynamic routes - stories
  let storyRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = await createServerSupabaseClient()
    if (supabase) {
      const { data: stories } = await supabase
        .from('stories')
        .select('id, updated_at, created_at')
        .eq('is_root', true)
        .order('created_at', { ascending: false })
        .limit(1000) // Limit to most recent 1000 stories

      if (stories) {
        storyRoutes = stories.map((story) => ({
          url: `${baseUrl}/story/${story.id}`,
          lastModified: story.updated_at ? new Date(story.updated_at) : new Date(story.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching stories for sitemap:', error)
  }

  // Dynamic routes - profiles
  let profileRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = await createServerSupabaseClient()
    if (supabase) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, updated_at, created_at')
        .order('created_at', { ascending: false })
        .limit(500) // Limit to most recent 500 profiles

      if (profiles) {
        profileRoutes = profiles.map((profile) => ({
          url: `${baseUrl}/profile/${profile.id}`,
          lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(profile.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching profiles for sitemap:', error)
  }

  return [...staticRoutes, ...storyRoutes, ...profileRoutes]
}

