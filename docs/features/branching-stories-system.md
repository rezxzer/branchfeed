# Branching Stories System - BranchFeed

ეს დოკუმენტაცია აღწერს Branching Stories System-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Branching Stories System არის BranchFeed-ის ბირთვი სისტემა, რომელიც:
- მართავს branching stories-ის სტრუქტურას
- აკონტროლებს story tree-ს (root story + branch nodes)
- უზრუნველყოფს path navigation-ს
- ამოწმებს max depth-ს

**Location**: `src/lib/stories.ts`, `src/hooks/useStory.ts`

**Status**: 🔴 **Critical Priority** - Phase 2 (Core BranchFeed System!)

> ℹ️ **შენიშვნა**
>
> Branching Stories System არის BranchFeed-ის ყველაზე მნიშვნელოვანი სისტემა, რომელიც აკონტროლებს branching narratives-ის ლოგიკას.
>
> ეს სისტემა გამოიყენება Create Story Page-ზე, Story Detail Page-ზე და Feed Page-ზე.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Story Tree Structure**
   - Root story (starting point)
   - Branch nodes (A/B choices)
   - Parent-child relationships
   - Depth tracking (0 = first branch step after the root story, 1+ = subsequent levels)

2. **Story Creation**
   - Create root story
   - Create branch nodes
   - Link nodes to parent nodes
   - Validate story structure

3. **Path Navigation**
   - Navigate through path (A → B → A)
   - Load child nodes based on choice
   - Handle end of path
   - Handle max depth

4. **Max Depth Validation**
   - Default max depth: 5 steps
   - Validate depth on creation
   - Prevent exceeding max depth
   - Warn when approaching max depth

5. **Story Queries**
   - Fetch root stories (for feed)
   - Fetch story by ID
   - Fetch nodes by story ID
   - Fetch child nodes by parent node ID

---

## 📊 Database Schema

### Tables Used

1. **stories** table
   - `id` (UUID, primary key)
   - `author_id` (UUID, foreign key → profiles.id)
   - `title` (text, required)
   - `description` (text, optional)
   - `media_url` (text, Supabase Storage, required)
   - `media_type` (text: 'image' | 'video', required)
   - `is_root` (boolean, default: true)
   - `max_depth` (integer, default: 5)
   - `created_at` (timestamp)

2. **story_nodes** table
   - `id` (UUID, primary key)
   - `story_id` (UUID, foreign key → stories.id)
   - `parent_node_id` (UUID, foreign key → story_nodes.id, nullable)
   - `choice_label` (text: 'A' | 'B' | custom)
   - `content` (text, optional)
   - `media_url` (text, Supabase Storage, optional)
   - `media_type` (text: 'image' | 'video', optional)
   - `depth` (integer, 0 = first branch level after the root story)
   - `created_at` (timestamp)

### Story Tree Structure

```
Root Story
  ├─ Node A (depth 0, parent_node_id = NULL, choice_label = 'A')
  │   ├─ Node A-A (depth 1, parent_node_id = Node A.id, choice_label = 'A')
  │   └─ Node A-B (depth 1, parent_node_id = Node A.id, choice_label = 'B')
  │
  └─ Node B (depth 0, parent_node_id = NULL, choice_label = 'B')
      ├─ Node B-A (depth 1, parent_node_id = Node B.id, choice_label = 'A')
      └─ Node B-B (depth 1, parent_node_id = Node B.id, choice_label = 'B')
```

### RLS Policies (Summary)

- **stories**:
  - INSERT: მხოლოდ authenticated მომხმარებლებს (`auth.uid() = author_id`).
  - UPDATE/DELETE: მხოლოდ ავტორს (`auth.uid() = author_id`).
  - SELECT: ყველა authenticated მომხმარებელს შეუძლია root stories ნახვა.

- **story_nodes**:
  - INSERT: მხოლოდ authenticated მომხმარებლებს, რომლებიც არიან story-ის ავტორები.
  - UPDATE/DELETE: მხოლოდ story-ის ავტორს.
  - SELECT: ყველა authenticated მომხმარებელს შეუძლია nodes ნახვა.

> **შენიშვნა: RLS Implementation**
>
> ყველა RLS პოლიტიკა უნდა იყოს ჩაწერილი `do $$ ... end $$;` ბლოკით Supabase მიგრაციებში.

### Indexes (Performance)

Recommended indexes:

- `stories(id, is_root)` – Story lookup
- `stories(author_id, created_at DESC)` – User's stories
- `story_nodes(story_id, parent_node_id, choice_label)` – Node navigation
- `story_nodes(parent_node_id)` – Parent-child relationships
- `story_nodes(story_id, depth)` – Depth queries

---

## 🔧 Implementation Details

### Story Creation Functions

```typescript
// lib/stories.ts
import { createClientClient } from '@/lib/auth';
import { uploadMedia } from '@/lib/storage';

interface CreateStoryParams {
  root: {
    title: string;
    description?: string;
    media: File;
  };
  nodes: BranchNodeData[];
}

export async function createStory({ root, nodes }: CreateStoryParams): Promise<string> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // 1. Upload root media
  const rootMediaUrl = await uploadMedia(root.media, 'stories');

  // 2. Create root story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .insert({
      title: root.title,
      description: root.description,
      media_url: rootMediaUrl,
      media_type: root.media.type.startsWith('image/') ? 'image' : 'video',
      is_root: true,
      max_depth: 5,
      author_id: user.id,
    })
    .select()
    .single();

  if (storyError) throw storyError;

  // 3. Create branch nodes
  for (const node of nodes) {
    // Upload choice A media if exists
    const choiceAMediaUrl = node.choiceA.media 
      ? await uploadMedia(node.choiceA.media, 'story-nodes')
      : null;

    // Upload choice B media if exists
    const choiceBMediaUrl = node.choiceB.media
      ? await uploadMedia(node.choiceB.media, 'story-nodes')
      : null;

    // Create node for choice A
    const { data: nodeA, error: nodeAError } = await supabase
      .from('story_nodes')
      .insert({
        story_id: story.id,
        parent_node_id: node.parentNodeId,
        choice_label: node.choiceA.label,
        content: node.choiceA.content,
        media_url: choiceAMediaUrl,
        media_type: choiceAMediaUrl 
          ? (node.choiceA.media!.type.startsWith('image/') ? 'image' : 'video')
          : null,
        depth: node.depth,
      })
      .select()
      .single();

    if (nodeAError) throw nodeAError;

    // Create node for choice B
    const { data: nodeB, error: nodeBError } = await supabase
      .from('story_nodes')
      .insert({
        story_id: story.id,
        parent_node_id: node.parentNodeId,
        choice_label: node.choiceB.label,
        content: node.choiceB.content,
        media_url: choiceBMediaUrl,
        media_type: choiceBMediaUrl
          ? (node.choiceB.media!.type.startsWith('image/') ? 'image' : 'video')
          : null,
        depth: node.depth,
      })
      .select()
      .single();

    if (nodeBError) throw nodeBError;
  }

  return story.id;
}
```

### Story Fetching Functions

```typescript
// lib/stories.ts

export async function getStoryById(storyId: string): Promise<Story | null> {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from('stories')
    .select('*, author:profiles(*)')
    .eq('id', storyId)
    .eq('is_root', true)
    .single();

  if (error) throw error;
  return data;
}

export async function getRootStories(limit: number = 10, offset: number = 0): Promise<Story[]> {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from('stories')
    .select('*, author:profiles(*)')
    .eq('is_root', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

export async function getNodeByPath(
  storyId: string, 
  path: string[]
): Promise<StoryNode | null> {
  const supabase = createClientClient();

  if (path.length === 0) {
    // Return root story (no node)
    return null;
  }

  let parentNodeId: string | null = null;
  let lastNode: StoryNode | null = null;

  for (const choice of path) {
    const { data: node, error } = await supabase
      .from('story_nodes')
      .select('*')
      .eq('story_id', storyId)
      .eq('parent_node_id', parentNodeId)
      .eq('choice_label', choice)
      .single();

    if (error) throw error;
    if (!node) return null;

    parentNodeId = node.id;
    lastNode = node;
  }

  return lastNode;
}

export async function getChildNodes(
  storyId: string,
  parentNodeId: string | null
): Promise<StoryNode[]> {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from('story_nodes')
    .select('*')
    .eq('story_id', storyId)
    .eq('parent_node_id', parentNodeId)
    .order('choice_label', { ascending: true });

  if (error) throw error;
  return data || [];
}
```

### Max Depth Validation

```typescript
// lib/stories.ts

export function validateMaxDepth(depth: number, maxDepth: number = 5): boolean {
  return depth < maxDepth;
}

export function getDepthWarning(depth: number, maxDepth: number = 5): string | null {
  if (depth >= maxDepth) {
    return 'Maximum depth reached';
  }
  if (depth === maxDepth - 1) {
    return 'Approaching maximum depth';
  }
  return null;
}
```

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "stories": {
    "maxDepth": "Maximum depth: {max} steps",
    "depthWarning": "Approaching maximum depth",
    "depthReached": "Maximum depth reached",
    "errors": {
      "createFailed": "Failed to create story",
      "loadFailed": "Failed to load story",
      "nodeNotFound": "Node not found",
      "maxDepthExceeded": "Maximum depth exceeded"
    }
  }
}
```

---

## ✅ Requirements Checklist

- [ ] Story creation function (`createStory`)
- [ ] Story fetching functions (`getStoryById`, `getRootStories`)
- [ ] Node fetching functions (`getNodeByPath`, `getChildNodes`)
- [ ] Max depth validation
- [ ] Story tree structure validation
- [ ] Database queries (stories, story_nodes)
- [ ] RLS policies implemented
- [ ] Indexes created
- [ ] Error handling
- [ ] i18n support (all text translatable)

---

## 🧪 Branching Stories System Testing Checklist (MVP)

1. ✅ Story Creation:
   - Root story created successfully
   - Branch nodes created successfully
   - Nodes linked to parent correctly
   - Depth calculated correctly

2. ✅ Story Fetching:
   - Root stories fetched correctly
   - Story by ID fetched correctly
   - Nodes by story ID fetched correctly

3. ✅ Path Navigation:
   - Node by path fetched correctly
   - Path traversal works (A → B → A)
   - End of path handled correctly
   - Invalid path returns null

4. ✅ Max Depth:
   - Max depth validation works
   - Depth warning shows at max-1
   - Cannot exceed max depth

5. ✅ Database:
   - RLS policies work correctly
   - Indexes improve query performance
   - Foreign keys work correctly

---

## 🔄 Future Enhancements

- **Story Analytics**: Track views, completion rates per path
- **Story Templates**: Pre-built story templates
- **Story Collaboration**: Multiple authors
- **Story Versioning**: Version history
- **Story Publishing**: Draft/published states
- **Story Scheduling**: Schedule publication
- **Story Categories**: Categorize stories
- **Story Search**: Full-text search

---

## 📝 Notes

- **Phase 2 Priority**: Branching Stories System is critical priority for Phase 2
- **Max Depth**: Default max depth is 5 steps per path (configurable)
- **Depth Calculation**: Depth starts at 0 for the first branch step after the root story and increments per level.
- **Path Format**: Path is array of 'A' | 'B' choices
- **Node Structure**: Each branching step creates 2 nodes (A and B)
- **RLS**: Story creation requires authenticated user (author_id = auth.uid())

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Branching Stories System in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create story creation functions (`createStory`).
  2. Create story fetching functions (`getStoryById`, `getRootStories`).
  3. Create node fetching functions (`getNodeByPath`, `getChildNodes`).
  4. Implement max depth validation.
  5. Implement RLS policies in Supabase.
  6. Create database indexes.
  7. Add error handling.
  8. Add tests according to "Branching Stories System Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Core BranchFeed System) - 🔴 Critical Priority

