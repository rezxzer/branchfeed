// Common types for BranchFeed

export interface Profile {
  id: string
  username: string
  bio: string | null
  avatar_url: string | null
  language_preference: string
  notification_preferences?: {
    follow?: boolean
    like?: boolean
    comment?: boolean
    reply?: boolean
    story_new?: boolean
  }
  created_at: string
  updated_at: string
}

export interface Story {
  id: string
  author_id: string
  title: string
  description: string | null
  media_url: string | null
  media_type: 'image' | 'video' | null
  is_root?: boolean // true for root stories shown in feed
  max_depth?: number // default: 5
  paths_count: number // number of unique paths/branches in this story
  views_count: number // total number of views for this story
  likes_count: number // total number of likes for this story
  shares_count?: number // total number of shares for this story
  comments_count?: number
  branches_count?: number // count of branch nodes (for feed display) - deprecated, use paths_count
  status?: 'draft' | 'published' // story status: draft or published
  scheduled_publish_at?: string | null // ISO timestamp for scheduled publishing
  created_at: string
  updated_at?: string
  userHasLiked?: boolean // whether the current user has liked this story (server-side only)
  userHasShared?: boolean // whether the current user has shared this story (server-side only)
  isBookmarked?: boolean // whether the current user has bookmarked this story
  tags?: Tag[] // tags associated with this story
  // Author profile (joined from profiles table)
  author?: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export interface StoryNode {
  id: string
  story_id: string
  parent_node_id: string | null
  choice_label: 'A' | 'B' | null
  content: string | null
  media_url: string | null
  media_type: 'image' | 'video' | null
  depth: number
  choice_a_label: string | null
  choice_a_content: string | null
  choice_b_label: string | null
  choice_b_content: string | null
  created_at: string
}

