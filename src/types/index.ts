// Common types for BranchFeed

export interface Profile {
  id: string
  username: string
  bio: string | null
  avatar_url: string | null
  language_preference: string
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
  likes_count: number
  views_count: number
  comments_count?: number
  branches_count?: number // count of branch nodes (for feed display)
  created_at: string
  updated_at?: string
  // Author profile (joined from profiles table)
  author?: {
    id: string
    username: string
    avatar_url: string | null
  }
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

