# Branch Creator Component - BranchFeed

ეს დოკუმენტაცია აღწერს Branch Creator Component-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Branch Creator Component არის BranchFeed-ის ბირთვი კომპონენტი, რომელიც:
- საშუალებას აძლევს კრეატორებს შექმნან branch nodes-ს
- აჩვენებს A/B არჩევნებს ყოველი node-ისთვის
- მხარდაჭერას უწევს node content-ისა და media-ს დამატებას
- აჩვენებს depth indicator-ს

**Location**: `src/components/BranchCreator.tsx`

**Status**: 🔴 **Critical Priority** - Phase 2 (Core BranchFeed Component!)

> ℹ️ **შენიშვნა**
>
> Branch Creator Component არის BranchFeed-ის ყველაზე მნიშვნელოვანი creation კომპონენტი, რომელიც გამოიყენება Create Story Page-ზე.
>
> ეს კომპონენტი საშუალებას აძლევს კრეატორებს შექმნან branching narratives-ს.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **A/B Choice Inputs**
   - Choice A label input
   - Choice B label input
   - Choice A content input (optional)
   - Choice B content input (optional)
   - Choice A media upload (optional)
   - Choice B media upload (optional)

2. **Node Content Editor**
   - Text content input (optional)
   - Media upload (optional)
   - Content preview

3. **Depth Indicator**
   - Current depth display
   - Max depth display
   - Depth validation (warn if approaching max)

4. **Node Management**
   - Update node data
   - Delete node
   - Validation (at least one choice label required)

5. **Media Upload**
   - Image/video upload per choice
   - 9:16 aspect ratio validation
   - Media preview
   - File size validation

---

## 📐 Component Structure

### Visual Structure

```
┌─────────────────────────────────────┐
│  Branch Creator Card                │
│  Depth: 1 / 5                       │
│  ┌─────────────────────────────┐   │
│  │ Choice A                     │   │
│  │ [Label Input]                │   │
│  │ [Content Input] (optional)   │   │
│  │ [Media Upload] (optional)    │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Choice B                     │   │
│  │ [Label Input]                │   │
│  │ [Content Input] (optional)   │   │
│  │ [Media Upload] (optional)    │   │
│  └─────────────────────────────┘   │
│  [Delete Node] button               │
└─────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────┐
│ Branch Creator  │
│ Depth: 1 / 5    │
│                 │
│ Choice A        │
│ [Label]         │
│ [Content]       │
│ [Media]         │
│                 │
│ Choice B        │
│ [Label]         │
│ [Content]       │
│ [Media]         │
│                 │
│ [Delete]        │
└─────────────────┘
```

---

## 🎨 UI Components

### Used Components

1. **Input** (`src/components/ui/Input.tsx`)
   - Choice label inputs
   - Text content input

2. **Textarea** (`src/components/ui/Textarea.tsx`)
   - Choice content inputs (optional)

3. **MediaUploader** (`src/components/MediaUploader.tsx`)
   - Media upload per choice
   - 9:16 aspect ratio validation

4. **Button** (`src/components/ui/Button.tsx`)
   - Delete node button

---

## 🔧 Implementation Details

### Component Props

```typescript
interface BranchCreatorProps {
  node: BranchNodeData; // Current node data
  maxDepth: number; // Maximum depth (e.g., 5)
  onUpdate: (updatedNode: BranchNodeData) => void; // Callback when node is updated
  onDelete: () => void; // Callback when node is deleted
  className?: string; // Optional additional classes
}
```

### Component Implementation

```typescript
// components/BranchCreator.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { MediaUploader } from '@/components/MediaUploader';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';

interface BranchCreatorProps {
  node: BranchNodeData;
  maxDepth: number;
  onUpdate: (updatedNode: BranchNodeData) => void;
  onDelete: () => void;
  className?: string;
}

export function BranchCreator({ 
  node, 
  maxDepth, 
  onUpdate, 
  onDelete,
  className = ''
}: BranchCreatorProps) {
  const { t } = useTranslation();
  const [choiceALabel, setChoiceALabel] = useState(node.choiceA.label || 'A');
  const [choiceAContent, setChoiceAContent] = useState(node.choiceA.content || '');
  const [choiceAMedia, setChoiceAMedia] = useState<File | null>(node.choiceA.media || null);
  const [choiceBLabel, setChoiceBLabel] = useState(node.choiceB.label || 'B');
  const [choiceBContent, setChoiceBContent] = useState(node.choiceB.content || '');
  const [choiceBMedia, setChoiceBMedia] = useState<File | null>(node.choiceB.media || null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpdate = () => {
    const newErrors: Record<string, string> = {};

    if (!choiceALabel.trim()) {
      newErrors.choiceALabel = t('createStory.errors.choiceLabelRequired');
    }

    if (!choiceBLabel.trim()) {
      newErrors.choiceBLabel = t('createStory.errors.choiceLabelRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate({
      ...node,
      choiceA: {
        label: choiceALabel.trim(),
        content: choiceAContent.trim() || undefined,
        media: choiceAMedia,
      },
      choiceB: {
        label: choiceBLabel.trim(),
        content: choiceBContent.trim() || undefined,
        media: choiceBMedia,
      },
    });
  };

  // Auto-update on change (debounced in production)
  useEffect(() => {
    handleUpdate();
  }, [choiceALabel, choiceAContent, choiceAMedia, choiceBLabel, choiceBContent, choiceBMedia]);

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      {/* Depth Indicator */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {t('createStory.branches.depth', { current: node.depth + 1, max: maxDepth })}
        </span>
        {node.depth + 1 >= maxDepth && (
          <span className="text-xs text-warning">
            {t('createStory.branches.maxDepthWarning')}
          </span>
        )}
      </div>

      {/* Choice A */}
      <div className="space-y-4 border-l-4 border-primary pl-4">
        <h3 className="font-semibold text-primary">
          {t('createStory.branches.choiceA')}
        </h3>
        
        <Input
          id={`choice-a-label-${node.id}`}
          label={t('createStory.branches.choiceLabel')}
          value={choiceALabel}
          onChange={(e) => setChoiceALabel(e.target.value)}
          error={errors.choiceALabel}
          required
        />

        <Textarea
          id={`choice-a-content-${node.id}`}
          label={t('createStory.branches.choiceContent')}
          value={choiceAContent}
          onChange={(e) => setChoiceAContent(e.target.value)}
          rows={2}
        />

        <MediaUploader
          label={t('createStory.branches.choiceMedia')}
          onFileChange={setChoiceAMedia}
          acceptedFormats={['image/*', 'video/*']}
          aspectRatio="9:16"
          maxSizeMB={10}
        />
      </div>

      {/* Choice B */}
      <div className="space-y-4 border-l-4 border-secondary pl-4">
        <h3 className="font-semibold text-secondary">
          {t('createStory.branches.choiceB')}
        </h3>
        
        <Input
          id={`choice-b-label-${node.id}`}
          label={t('createStory.branches.choiceLabel')}
          value={choiceBLabel}
          onChange={(e) => setChoiceBLabel(e.target.value)}
          error={errors.choiceBLabel}
          required
        />

        <Textarea
          id={`choice-b-content-${node.id}`}
          label={t('createStory.branches.choiceContent')}
          value={choiceBContent}
          onChange={(e) => setChoiceBContent(e.target.value)}
          rows={2}
        />

        <MediaUploader
          label={t('createStory.branches.choiceMedia')}
          onFileChange={setChoiceBMedia}
          acceptedFormats={['image/*', 'video/*']}
          aspectRatio="9:16"
          maxSizeMB={10}
        />
      </div>

      {/* Delete Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onDelete}
          variant="danger"
          size="sm"
        >
          {t('createStory.branches.deleteNode')}
        </Button>
      </div>
    </Card>
  );
}
```

### Usage Example

```typescript
// In Branch Nodes Form
<BranchCreator
  node={node}
  maxDepth={5}
  onUpdate={(updated) => handleNodeUpdate(node.id, updated)}
  onDelete={() => handleNodeDelete(node.id)}
/>
```

---

## 🎨 UI Style Guidelines

### Card Layout

- **Card**: Rounded card with padding
- **Border**: Left border for each choice (primary/secondary colors)
- **Spacing**: Consistent spacing between sections

### Choice Sections

- **Choice A**: Primary color border (`border-primary`)
- **Choice B**: Secondary color border (`border-secondary`)
- **Labels**: Bold, colored headings

### Depth Indicator

- **Text**: Small, muted text
- **Warning**: Warning color when approaching max depth

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "createStory": {
    "branches": {
      "depth": "Depth: {current} / {max}",
      "maxDepthWarning": "Approaching maximum depth",
      "choiceA": "Choice A",
      "choiceB": "Choice B",
      "choiceLabel": "Choice Label",
      "choiceContent": "Content (Optional)",
      "choiceMedia": "Media (Optional)",
      "deleteNode": "Delete Node"
    },
    "errors": {
      "choiceLabelRequired": "Choice label is required"
    }
  }
}
```

---

## ✅ Requirements Checklist

- [ ] BranchCreator component created
- [ ] Choice A inputs (label, content, media)
- [ ] Choice B inputs (label, content, media)
- [ ] Depth indicator
- [ ] Max depth warning
- [ ] Validation (choice labels required)
- [ ] Delete node button
- [ ] Auto-update on change
- [ ] Media upload (9:16 aspect ratio)
- [ ] Error handling
- [ ] i18n support (all text translatable)
- [ ] Responsive design (mobile, tablet, desktop)

---

## 🧪 Branch Creator Component Testing Checklist (MVP)

1. ✅ Choice Inputs:
   - Choice A label input works
   - Choice B label input works
   - Choice content inputs work (optional)
   - Media uploads work (optional)

2. ✅ Validation:
   - Choice label required validation works
   - Error messages display correctly
   - Validation prevents invalid submission

3. ✅ Depth Indicator:
   - Depth displays correctly
   - Max depth warning shows at max depth

4. ✅ Node Management:
   - Update callback fires on change
   - Delete callback fires on delete
   - Node data updates correctly

5. ✅ Media Upload:
   - Media upload works per choice
   - 9:16 aspect ratio validation works
   - File size validation works

6. ✅ Responsive:
   - Mobile layout works
   - Desktop layout works
   - Inputs don't overflow

---

## 🔄 Future Enhancements

- **Child Node Creation**: Add child nodes for each choice
- **Visual Tree**: Visual tree structure builder
- **Node Preview**: Preview node content before publishing
- **Node Templates**: Pre-built node templates
- **Node Duplication**: Duplicate existing nodes
- **Node Reordering**: Reorder nodes
- **Node Validation**: Advanced validation rules

---

## 📝 Notes

- **Phase 2 Priority**: Branch Creator Component is critical priority for Phase 2
- **Auto-update**: Component auto-updates parent on change (debounced in production)
- **Choice Labels**: Required, short text (1-3 words recommended)
- **Choice Content**: Optional, can be longer description
- **Media**: Optional, 9:16 aspect ratio if provided
- **Depth**: Starts at 0 (root level), increments per level

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Branch Creator Component in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create `BranchCreator` component with A/B choice inputs.
  2. Implement choice label, content, and media inputs.
  3. Add depth indicator and max depth warning.
  4. Implement validation (choice labels required).
  5. Add delete node functionality.
  6. Implement auto-update on change (debounced).
  7. Test responsive design.
  8. Add tests according to "Branch Creator Component Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Core BranchFeed Component) - 🔴 Critical Priority

