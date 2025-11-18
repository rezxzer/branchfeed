// Types for Create Story Page

export interface RootStoryData {
  title: string
  description?: string
  media: File | null
  mediaUrl?: string // For preview
  mediaType?: 'image' | 'video'
}

export interface BranchChoiceData {
  label: 'A' | 'B' | string
  content?: string
  media?: File | null
  mediaUrl?: string // For preview
  mediaType?: 'image' | 'video'
}

export interface BranchNodeData {
  id: string // Temporary ID for UI
  parentNodeId: string | null
  depth: number
  choiceA: BranchChoiceData
  choiceB: BranchChoiceData
}

export interface CreateStoryData {
  root: RootStoryData
  nodes: BranchNodeData[]
  status?: 'draft' | 'published' // Story status: draft or published (default: published)
  scheduled_publish_at?: string | null // ISO timestamp for scheduled publishing (null if not scheduled)
  tagIds?: string[] // Array of tag IDs to associate with the story
}

