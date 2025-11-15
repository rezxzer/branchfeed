# Create Story Page - BranchFeed

ეს დოკუმენტაცია აღწერს Create Story Page-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Create Story Page არის BranchFeed-ის ბირთვი, სადაც:
- მომხმარებლები ქმნიან **root branching stories**-ს
- მომხმარებლები ამატებენ **branch nodes**-ს A/B არჩევნებით
- მომხმარებლები ატვირთავენ media-ს (9:16 aspect ratio)
- მომხმარებლები აშენებენ story tree-ს (max depth 3-5 steps)

**Route**: `/create` (protected route)

**Status**: 🔴 **Critical Priority** - Phase 2 (Core BranchFeed Feature!)

> ℹ️ **შენიშვნა**
>
> Create Story Page არის **დაცული გვერდი** - მხოლოდ ავტორიზებულ მომხმარებლებს შეუძლიათ წვდომა.
>
> ეს არის BranchFeed-ის ყველაზე მნიშვნელოვანი გვერდი, სადაც მომხმარებლები ქმნიან ინტერაქტიურ, branching narratives-ს.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კომპონენტები და სტრუქტურა არის **სტრუქტურის მაგალითები**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Root Story Creation**
   - Title input
   - Description/Text content (optional)
   - Media upload (image/video, 9:16 aspect ratio)
   - Media preview
   - Validation (title required, media required)

2. **Branch Node Creation**
   - Add branch nodes to root story
   - Each node has 2 choices (A/B)
   - Each choice leads to a new node
   - Node content: text + media (optional)
   - Choice labels (default: "A" and "B", customizable)

3. **Story Tree Builder**
   - Visual tree structure (optional - Phase 2+)
   - Max depth limit: 5 steps per path (Phase 2 default)
   - Depth indicator (current depth / max depth)
   - Path preview

4. **Media Upload**
   - Image upload (9:16 aspect ratio)
   - Video upload (9:16 aspect ratio, optional for MVP)
   - Media validation (file size, format, aspect ratio)
   - Preview before upload
   - Supabase Storage integration

5. **Story Validation**
   - Title required
   - Root media required
   - At least 1 branch node required (with A/B choices)
   - Max depth validation
   - Save as draft (optional - Phase 2+)

6. **Story Publishing**
   - Publish story (creates root story + nodes in database)
   - Redirect to `/story/[id]` after publishing
   - Error handling

---

## 📐 Page Layout

### Structure

```
┌─────────────────────────────────────┐
│  Header (Navigation)               │
├─────────────────────────────────────┤
│  Create Story Form                  │
│  ┌─────────────────────────────┐   │
│  │ Step 1: Root Story          │   │
│  │ [Title Input]                │   │
│  │ [Description Textarea]       │   │
│  │ [Media Upload]                │   │
│  │ [Preview]                     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Step 2: Branch Nodes         │   │
│  │ [Add Node Button]            │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ Node 1                   │ │   │
│  │ │ Choice A: [Content]      │ │   │
│  │ │ Choice B: [Content]      │ │   │
│  │ │ [Add Child Nodes]        │ │   │
│  │ └─────────────────────────┘ │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Step 3: Preview & Publish    │   │
│  │ [Story Tree Preview]         │   │
│  │ [Publish Button]              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────┐
│ Header (Mobile) │
├─────────────────┤
│ Create Story    │
│                 │
│ Step 1: Root    │
│ [Title]         │
│ [Media Upload]  │
│                 │
│ Step 2: Nodes   │
│ [Add Node]      │
│                 │
│ [Publish]       │
└─────────────────┘
```

---

## 🎨 UI Components

### Used Components

1. **Header** (`src/components/Header.tsx`)
   - Navigation bar
   - User menu

2. **Form Components** (`src/components/ui/`)
   - `Input` - Title input
   - `Textarea` - Description input
   - `Button` - Submit, Add Node, Publish buttons
   - `Label` - Form labels

3. **MediaUploader** (`src/components/MediaUploader.tsx`)
   - Image/video upload
   - 9:16 aspect ratio validation
   - Preview
   - File size validation (10MB limit)

4. **BranchCreator** (`src/components/BranchCreator.tsx`)
   - Add branch nodes
   - A/B choice inputs
   - Node content editor
   - Depth indicator

5. **StoryPreview** (`src/components/create/StoryPreview.tsx`)
   - Story preview before publishing
   - Story tree preview (optional visual tree inside)
   - Path visualization
   - Depth display

6. **Spinner** (`src/components/ui/Spinner.tsx`)
   - Loading state during upload/publish

7. **ErrorState** (`src/components/ErrorState.tsx`)
   - Error messages

---

## 🔐 Access Control

- `/create` არის **დაცული როუთი**:
  - `middleware.ts` → აუთენტიფიცირებულს აგდებს `/signin`-ზე.
  - `app/create/page.tsx` → server-side `getCurrentUser()` შემოწმება.
- თუ `getCurrentUser()` აბრუნებს `null` → `redirect('/signin')`.
- Story creation requires authenticated user (author_id = auth.uid()).

---

## 🔧 Implementation Details

### Page Component Structure (Server Component)

```typescript
// app/create/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { CreateStoryPageClient } from '@/components/create/CreateStoryPageClient';

export default async function CreateStoryPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/signin');
  }

  return <CreateStoryPageClient />;
}
```

### Create Story Page Client Component

```typescript
// components/create/CreateStoryPageClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RootStoryForm } from '@/components/create/RootStoryForm';
import { BranchNodesForm } from '@/components/create/BranchNodesForm';
import { StoryPreview } from '@/components/create/StoryPreview';
import { useCreateStory } from '@/hooks/useCreateStory';

type Step = 'root' | 'branches' | 'preview';

export function CreateStoryPageClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('root');
  const [rootStory, setRootStory] = useState<RootStoryData | null>(null);
  const [branchNodes, setBranchNodes] = useState<BranchNodeData[]>([]);
  
  const { createStory, loading, error } = useCreateStory();

  const handleRootSubmit = (data: RootStoryData) => {
    setRootStory(data);
    setStep('branches');
  };

  const handleBranchesSubmit = (nodes: BranchNodeData[]) => {
    setBranchNodes(nodes);
    setStep('preview');
  };

  const handlePublish = async () => {
    if (!rootStory || branchNodes.length === 0) return;
    
    try {
      const storyId = await createStory({
        root: rootStory,
        nodes: branchNodes,
      });
      
      router.push(`/story/${storyId}`);
    } catch (err) {
      console.error('Failed to publish story:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">
        {t('createStory.title')}
      </h1>

      {step === 'root' && (
        <RootStoryForm 
          onSubmit={handleRootSubmit}
          initialData={rootStory}
        />
      )}

      {step === 'branches' && rootStory && (
        <BranchNodesForm 
          onSubmit={handleBranchesSubmit}
          initialNodes={branchNodes}
          maxDepth={5}
        />
      )}

      {step === 'preview' && rootStory && branchNodes.length > 0 && (
        <StoryPreview 
          rootStory={rootStory}
          nodes={branchNodes}
          onPublish={handlePublish}
          loading={loading}
        />
      )}

      {error && <ErrorState message={error.message} />}
    </div>
  );
}
```

### Root Story Form Component

```typescript
// components/create/RootStoryForm.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { MediaUploader } from '@/components/MediaUploader';
import { useTranslation } from '@/hooks/useTranslation';

interface RootStoryFormProps {
  onSubmit: (data: RootStoryData) => void;
  initialData?: RootStoryData | null;
}

export function RootStoryForm({ onSubmit, initialData }: RootStoryFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [media, setMedia] = useState<File | null>(initialData?.media || null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMediaChange = (file: File | null) => {
    setMedia(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = t('createStory.errors.titleRequired');
    }

    if (!media) {
      newErrors.media = t('createStory.errors.mediaRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      media,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          id="title"
          label={t('createStory.root.title')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
        />
      </div>

      <div>
        <Textarea
          id="description"
          label={t('createStory.root.description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <MediaUploader
          label={t('createStory.root.media')}
          onFileChange={handleMediaChange}
          acceptedFormats={['image/*', 'video/*']}
          aspectRatio="9:16"
          maxSizeMB={10}
          preview={mediaPreview}
          error={errors.media}
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary">
          {t('createStory.next')}
        </Button>
      </div>
    </form>
  );
}
```

### Branch Nodes Form Component

```typescript
// components/create/BranchNodesForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { BranchCreator } from '@/components/BranchCreator';
import { useTranslation } from '@/hooks/useTranslation';

interface BranchNodesFormProps {
  onSubmit: (nodes: BranchNodeData[]) => void;
  initialNodes?: BranchNodeData[];
  maxDepth: number;
}

export function BranchNodesForm({ 
  onSubmit, 
  initialNodes = [],
  maxDepth 
}: BranchNodesFormProps) {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<BranchNodeData[]>(initialNodes);

  const handleAddNode = () => {
    setNodes([...nodes, {
      id: crypto.randomUUID(),
      choiceA: { label: 'A', content: '', media: null },
      choiceB: { label: 'B', content: '', media: null },
      depth: 0,
      parentNodeId: null,
    }]);
  };

  const handleNodeUpdate = (nodeId: string, updatedNode: BranchNodeData) => {
    setNodes(nodes.map(n => n.id === nodeId ? updatedNode : n));
  };

  const handleNodeDelete = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
  };

  const handleSubmit = () => {
    if (nodes.length === 0) {
      // Show error: at least 1 node required
      return;
    }
    onSubmit(nodes);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          {t('createStory.branches.title')}
        </h2>
        <Button onClick={handleAddNode} variant="outline">
          {t('createStory.branches.addNode')}
        </Button>
      </div>

      <div className="space-y-4">
        {nodes.map((node) => (
          <BranchCreator
            key={node.id}
            node={node}
            maxDepth={maxDepth}
            onUpdate={(updated) => handleNodeUpdate(node.id, updated)}
            onDelete={() => handleNodeDelete(node.id)}
          />
        ))}
      </div>

      {nodes.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          {t('createStory.branches.empty')}
        </p>
      )}

      <div className="flex justify-between">
        <Button 
          onClick={() => {/* Go back to root step */}} 
          variant="outline"
        >
          {t('createStory.back')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="primary"
          disabled={nodes.length === 0}
        >
          {t('createStory.preview')}
        </Button>
      </div>
    </div>
  );
}
```

### useCreateStory Hook

```typescript
// hooks/useCreateStory.ts
'use client';

import { useState } from 'react';
import { createClientClient } from '@/lib/auth';
import { uploadMedia } from '@/lib/storage';

interface CreateStoryParams {
  root: RootStoryData;
  nodes: BranchNodeData[];
}

export function useCreateStory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createStory = async ({ root, nodes }: CreateStoryParams): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClientClient();

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
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // 3. Create branch nodes
      const nodePromises = nodes.map(async (node) => {
        // Upload choice A media if exists
        const choiceAMediaUrl = node.choiceA.media 
          ? await uploadMedia(node.choiceA.media, 'story-nodes')
          : null;

        // Upload choice B media if exists
        const choiceBMediaUrl = node.choiceB.media
          ? await uploadMedia(node.choiceB.media, 'story-nodes')
          : null;

        // Create nodes for both choices
        const { data: nodeA, error: nodeAError } = await supabase
          .from('story_nodes')
          .insert({
            story_id: story.id,
            parent_node_id: node.parentNodeId,
            choice_label: node.choiceA.label,
            content: node.choiceA.content,
            media_url: choiceAMediaUrl,
            media_type: node.choiceA.media?.type.startsWith('image/') ? 'image' : 'video',
            depth: node.depth,
          })
          .select()
          .single();

        if (nodeAError) throw nodeAError;

        const { data: nodeB, error: nodeBError } = await supabase
          .from('story_nodes')
          .insert({
            story_id: story.id,
            parent_node_id: node.parentNodeId,
            choice_label: node.choiceB.label,
            content: node.choiceB.content,
            media_url: choiceBMediaUrl,
            media_type: node.choiceB.media
              ? (node.choiceB.media.type.startsWith('image/') ? 'image' : 'video')
              : null,
            depth: node.depth,
          })
          .select()
          .single();

        if (nodeBError) throw nodeBError;

        return { nodeA, nodeB };
      });

      await Promise.all(nodePromises);

      return story.id;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createStory,
    loading,
    error,
  };
}
```

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
   - `is_root` (boolean, default: true for root stories)
   - `max_depth` (integer, default: 5)
   - `created_at` (timestamp)

> **Note: author_id**
>
> Root story creation must always set `author_id = auth.uid()` (either from the client insert or via a Postgres trigger), because RLS policies rely on this field.

2. **story_nodes** table
   - `id` (UUID, primary key)
   - `story_id` (UUID, foreign key → stories.id)
   - `parent_node_id` (UUID, foreign key → story_nodes.id, nullable)
   - `choice_label` (text: 'A' | 'B' | custom)
   - `content` (text, optional)
   - `media_url` (text, Supabase Storage, optional)
   - `media_type` (text: 'image' | 'video', optional)
   - `depth` (integer, 0 = root level)
   - `created_at` (timestamp)

### UI → Database Mapping (Branch Nodes)

- ერთი `BranchNodeData` UI-ში წარმოადგენს ერთ branching ნაბიჯს ორი არჩევანით (A და B).
- Database-ში ეს ინახება ორ row-ად `story_nodes` ცხრილში:
  - Row 1 → `choice_label = 'A'`
  - Row 2 → `choice_label = 'B'`
- ორივე row-ს აქვს ერთი და იგივე `story_id`, `parent_node_id` და `depth`.
- Root-level node-ებისთვის `parent_node_id` არის `NULL`, ხოლო `depth` იწყება 0-იდან.

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

- `stories(author_id, created_at DESC)` – User's stories
- `story_nodes(story_id, depth)` – Story tree queries
- `story_nodes(parent_node_id)` – Parent-child relationships

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "createStory": {
    "title": "Create Branching Story",
    "next": "Next",
    "back": "Back",
    "preview": "Preview",
    "publish": "Publish Story",
    "root": {
      "title": "Story Title",
      "description": "Description (Optional)",
      "media": "Upload Media (9:16 aspect ratio)"
    },
    "branches": {
      "title": "Add Branch Nodes",
      "addNode": "Add Branch Node",
      "empty": "Add at least one branch node with A/B choices",
      "choiceA": "Choice A",
      "choiceB": "Choice B",
      "nodeContent": "Node Content",
      "depth": "Depth: {current} / {max}"
    },
    "preview": {
      "title": "Story Preview",
      "publish": "Publish Story",
      "publishing": "Publishing..."
    },
    "errors": {
      "titleRequired": "Title is required",
      "mediaRequired": "Media is required",
      "nodesRequired": "At least one branch node is required",
      "maxDepthReached": "Maximum depth reached",
      "uploadFailed": "Media upload failed",
      "publishFailed": "Failed to publish story"
    },
    "success": {
      "published": "Story published successfully!"
    }
  }
}
```

---

## ✅ Requirements Checklist

- [ ] Create story page route created (`/create`)
- [ ] Create story page is protected (requires authentication)
- [ ] CreateStoryPageClient component created (client component)
- [ ] RootStoryForm component created
- [ ] BranchNodesForm component created
- [ ] StoryPreview component created
- [ ] MediaUploader component created (9:16 aspect ratio)
- [ ] BranchCreator component created
- [ ] useCreateStory hook created
- [ ] Media upload to Supabase Storage
- [ ] Story validation (title, media, nodes)
- [ ] Max depth validation (3-5 steps)
- [ ] Database insert (stories + story_nodes)
- [ ] Error handling
- [ ] Loading states (Spinner)
- [ ] Redirect to `/story/[id]` after publishing
- [ ] i18n support (all text translatable)
- [ ] Responsive design (mobile, tablet, desktop)

---

## 🧪 Create Story Page Testing Checklist (MVP)

1. ✅ Authenticated user:
   - `/create` → shows create story form
   - Can fill root story form
   - Can add branch nodes

2. ✅ Unauthenticated user:
   - `/create` → redirects to `/signin`

3. ✅ Root Story Form:
   - Title required validation
   - Media required validation
   - Media upload works (9:16 aspect ratio)
   - Preview shows uploaded media

4. ✅ Branch Nodes Form:
   - Can add branch nodes
   - Each node has A/B choices
   - Can add content to choices
   - Can upload media for choices
   - Depth indicator works
   - Max depth validation (5 steps)

5. ✅ Story Publishing:
   - Publish button creates story in database
   - Root story created with `is_root = true`
   - Branch nodes created correctly
   - Redirects to `/story/[id]` after publishing

6. ✅ Error Handling:
   - Upload errors show error message
   - Database errors show error message
   - Validation errors show inline

7. ✅ Responsive:
   - Mobile layout works
   - Tablet layout works
   - Desktop layout works

---

## 🔄 Future Enhancements

- **Draft Saving**: Save story as draft (localStorage or database)
- **Story Tree Visualizer**: Visual tree structure builder
- **Template Stories**: Pre-built story templates
- **Collaborative Editing**: Multiple authors
- **Advanced Media**: Video editing, filters, effects
- **Story Analytics**: Views, completion rates
- **Story Scheduling**: Schedule story publication
- **Story Categories**: Categorize stories
- **Hashtags**: Add hashtags to stories

---

## 📝 Notes

- **Phase 2 Priority**: Create Story Page is critical priority for Phase 2
- **Max Depth**: Default max depth is 5 steps per path (configurable)
- **Media Format**: 9:16 aspect ratio required (mobile-first design)
- **Media Size**: 10MB limit for images/videos
- **Client Component**: CreateStoryPageClient uses `'use client'` directive
- **Server Component**: Create page.tsx is server component (auth check only)
- **RLS**: Story creation requires authenticated user (author_id = auth.uid())

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Create Story Page in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Ensure `/create` route is protected (middleware + server redirect).
  2. Create `CreateStoryPageClient` with multi-step form (root → branches → preview).
  3. Implement `MediaUploader` with 9:16 aspect ratio validation.
  4. Implement `BranchCreator` for adding branch nodes.
  5. Use `useCreateStory` hook for story creation.
  6. Respect RLS – only authenticated users can create stories.
  7. Add tests according to "Create Story Page Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Core BranchFeed Feature) - 🔴 Critical Priority

