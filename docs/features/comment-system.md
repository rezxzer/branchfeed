# Comment System - BranchFeed

ეს დოკუმენტაცია აღწერს Comment System-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Comment System არის BranchFeed-ის ინტერაქციის სისტემა, რომელიც:
- საშუალებას აძლევს მომხმარებლებს დატოვონ კომენტარები stories-ზე
- აჩვენებს comment count-ს
- მხარდაჭერას უწევს comment deletion-ს (own comments)
- უზრუნველყოფს comment display-ს

**Location**: `src/lib/comments.ts`, `src/hooks/useComment.ts`, `src/components/CommentSection.tsx`

**Status**: 🟡 **High Priority** - Phase 2 (Interaction Features)

> ℹ️ **შენიშვნა**
>
> Comment System არის BranchFeed-ის მნიშვნელოვანი ინტერაქციის სისტემა, რომელიც გამოიყენება Story Detail Page-ზე.
>
> ეს სისტემა აუცილებელია Phase 2-ის სრულფასოვნებისთვის.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Add Comments**
   - Comment form (text input)
   - Submit comment
   - Character limit (500 characters)
   - Validation (non-empty, max length)

2. **View Comments**
   - Display comments list
   - Show comment author (avatar, username)
   - Show comment timestamp
   - Show comment content
   - Sort by newest first

3. **Delete Comments**
   - Delete own comments
   - Confirm before delete
   - Update comment count

4. **Comment Count**
   - Display comment count on stories
   - Cached comment count (from stories table)
   - Real-time updates after add/delete

5. **Comment Display**
   - Comment card component
   - Author info (avatar, username)
   - Comment text
   - Timestamp (relative time)
   - Delete button (own comments only)

---

## 📊 Database Schema

### Tables Used

1. **comments** table
   - `id` (UUID, primary key)
   - `story_id` (UUID, foreign key → stories.id)
   - `user_id` (UUID, foreign key → profiles.id)
   - `content` (text, max 500 characters)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. **stories** table
   - `comments_count` (integer, cached) - Updated via trigger

3. **profiles** table
   - `id` (UUID, primary key)
   - `username` (text)
   - `avatar_url` (text, optional)

### RLS Policies (Summary)

- **comments**:
  - INSERT: მხოლოდ authenticated მომხმარებლებს (`auth.uid() = user_id`).
  - UPDATE/DELETE: მხოლოდ comment owner-ს (`auth.uid() = user_id`).
  - SELECT: ყველა authenticated მომხმარებელს შეუძლია comments ნახვა.

> **შენიშვნა: RLS Implementation**
>
> ყველა RLS პოლიტიკა უნდა იყოს ჩაწერილი `do $$ ... end $$;` ბლოკით Supabase მიგრაციებში.

### Indexes (Performance)

Recommended indexes:

- `comments(story_id, created_at DESC)` – Comments by story (sorted)
- `comments(user_id)` – User's comments
- `stories(comments_count)` – Sorting by comments

### Triggers (Comment Count)

```sql
-- Trigger to update comments_count in stories table
CREATE OR REPLACE FUNCTION update_story_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories
    SET comments_count = comments_count + 1
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_story_comments_count();
```

---

## 🔧 Implementation Details

### Comment Functions

```typescript
// lib/comments.ts
import { createClientClient } from '@/lib/auth';

export interface Comment {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

// Configurable via environment variable
const MAX_COMMENT_LENGTH = Number(process.env.NEXT_PUBLIC_MAX_COMMENT_LENGTH || 500);

/**
 * Add a comment to a story
 */
export async function addComment(
  storyId: string,
  content: string
): Promise<Comment> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Validate content
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error('Comment cannot be empty');
  }
  if (trimmedContent.length > MAX_COMMENT_LENGTH) {
    throw new Error(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      story_id: storyId,
      user_id: user.id,
      content: trimmedContent,
    })
    .select(`
      *,
      author:profiles(id, username, avatar_url)
    `)
    .single();

  if (error) {
    throw new Error(`Add comment failed: ${error.message}`);
  }

  return {
    id: comment.id,
    story_id: comment.story_id,
    user_id: comment.user_id,
    content: comment.content,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    author: comment.author,
  };
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  const supabase = createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id); // Only delete own comments

  if (error) {
    throw new Error(`Delete comment failed: ${error.message}`);
  }
}

/**
 * Get comments for a story
 */
export async function getComments(storyId: string): Promise<Comment[]> {
  const supabase = createClientClient();

  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(id, username, avatar_url)
    `)
    .eq('story_id', storyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Get comments failed: ${error.message}`);
  }

  return (comments || []).map(comment => ({
    id: comment.id,
    story_id: comment.story_id,
    user_id: comment.user_id,
    content: comment.content,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    author: comment.author,
  }));
}

/**
 * Get comment count for a story
 */
export async function getCommentCount(storyId: string): Promise<number> {
  const supabase = createClientClient();

  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('story_id', storyId);

  if (error) {
    throw new Error(`Get comment count failed: ${error.message}`);
  }

  return count || 0;
}
```

### useComment Hook

```typescript
// hooks/useComment.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { addComment, deleteComment, getComments, Comment } from '@/lib/comments';

interface UseCommentResult {
  comments: Comment[];
  addComment: (content: string) => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
  commentsCount: number;
}

export function useComment(storyId: string): UseCommentResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [commentsCount, setCommentsCount] = useState(0);

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [storyId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedComments = await getComments(storyId);
      setComments(loadedComments);
      setCommentsCount(loadedComments.length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load comments'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = useCallback(async (content: string) => {
    try {
      setLoading(true);
      setError(null);
      const newComment = await addComment(storyId, content);
      setComments(prev => [newComment, ...prev]);
      setCommentsCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add comment'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  const handleRemoveComment = useCallback(async (commentId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCommentsCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete comment'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    comments,
    addComment: handleAddComment,
    removeComment: handleRemoveComment,
    loading,
    error,
    commentsCount,
  };
}
```

### CommentSection Component

```typescript
// components/CommentSection.tsx
'use client';

import { useState } from 'react';
import { useComment } from '@/hooks/useComment';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Comment } from '@/components/Comment';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from '@/hooks/useTranslation';

interface CommentSectionProps {
  storyId: string;
  className?: string;
}

export function CommentSection({ storyId, className = '' }: CommentSectionProps) {
  const { t } = useTranslation();
  const { comments, addComment, removeComment, loading, error, commentsCount } = useComment(storyId);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addComment(commentText);
      setCommentText('');
    } catch (err) {
      // Error already handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">
        {t('comments.title', { count: commentsCount })}
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={t('comments.placeholder')}
          rows={3}
          maxLength={MAX_COMMENT_LENGTH}
          disabled={isSubmitting}
          className={isOverLimit ? 'border-red-500' : ''}
        />
        <div className="flex justify-between items-center">
          <span className={`text-xs ${
            remainingChars < 0 ? 'text-red-400' : 
            remainingChars < 50 ? 'text-yellow-400' : 
            'text-muted-foreground'
          }`}>
            {remainingChars} characters remaining
          </span>
          <Button
            type="submit"
            variant="primary"
            disabled={!commentText.trim() || isSubmitting}
          >
            {isSubmitting ? t('comments.submitting') : t('comments.submit')}
          </Button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">
          {error.message}
        </p>
      )}

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <Spinner size="md" />
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {t('comments.empty')}
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              onDelete={removeComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Comment Component

```typescript
// components/Comment.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { createClientClient } from '@/lib/auth';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface CommentProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    author: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
  };
  onDelete: (commentId: string) => Promise<void>;
}

export function Comment({ comment, onDelete }: CommentProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Check if current user is comment author
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClientClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };
    checkUser();
  }, []);

  const isOwnComment = currentUser === comment.author.id;

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(comment.id);
    } catch (err) {
      // Error handled in parent
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex gap-3 p-4 border rounded-lg">
      <img
        src={comment.author.avatar_url || '/default-avatar.png'}
        alt={comment.author.username}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-sm">{comment.author.username}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </p>
          </div>
          {isOwnComment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {showDeleteConfirm ? t('comments.confirmDelete') : t('comments.delete')}
            </Button>
          )}
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  );
}
```

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "comments": {
    "title": "Comments ({count})",
    "placeholder": "Write a comment...",
    "submit": "Post Comment",
    "submitting": "Posting...",
    "empty": "No comments yet. Be the first to comment!",
    "justNow": "Just now",
    "minutesAgo": "{count} minutes ago",
    "hoursAgo": "{count} hours ago",
    "daysAgo": "{count} days ago",
    "delete": "Delete",
    "confirmDelete": "Confirm",
    "errors": {
      "addFailed": "Failed to add comment",
      "deleteFailed": "Failed to delete comment",
      "loadFailed": "Failed to load comments",
      "emptyComment": "Comment cannot be empty",
      "tooLong": "Comment cannot exceed 500 characters",
      "notAuthenticated": "You must be logged in to comment"
    }
  }
}
```

---

## ✅ Requirements Checklist

- [x] Comment functions created (`addComment`, `deleteComment`, `getComments`)
- [x] useComment hook created
- [x] CommentSection component created
- [x] Comment component created
- [x] Database table (comments) created
- [x] RLS policies implemented
- [x] Indexes created
- [x] Comment count trigger implemented
- [x] Character limit validation (configurable via `NEXT_PUBLIC_MAX_COMMENT_LENGTH`)
- [x] Character counter UI with visual feedback
- [x] Error handling
- [x] i18n support (all text translatable)
- [x] Relative time formatting (date-fns)

---

## 🧪 Comment System Testing Checklist (MVP)

1. ✅ Add Comment:
   - Add comment works
   - Empty comment rejected
   - Long comment (>500 chars) rejected
   - Comment appears in list immediately

2. ✅ View Comments:
   - Comments list displays correctly
   - Comments sorted by newest first
   - Author info displays correctly
   - Timestamp displays correctly

3. ✅ Delete Comment:
   - Delete own comment works
   - Cannot delete others' comments
   - Comment count updates correctly
   - Comment removed from list

4. ✅ Comment Count:
   - Comment count displays correctly
   - Comment count increments on add
   - Comment count decrements on delete
   - Comment count cached in stories table

5. ✅ Database:
   - RLS policies work correctly
   - Trigger updates comments_count correctly
   - Indexes improve query performance

6. ✅ Error Handling:
   - Network errors handled
   - Validation errors handled
   - Authentication errors handled
   - User-friendly error messages

---

## 🔄 Future Enhancements

- **Reply to Comments**: Nested comments/replies
- **Edit Comments**: Edit own comments
- **Comment Reactions**: Like/react to comments
- **Comment Moderation**: Report inappropriate comments
- **Comment Mentions**: @mention users in comments
- **Comment Threading**: Threaded comment discussions
- **Comment Search**: Search within comments
- **Comment Notifications**: Notify on replies

---

## 📝 Notes

- **Phase 2 Priority**: Comment System is high priority for Phase 2
- **Character Limit**: 500 characters maximum per comment
- **Comment Count**: Cached in stories table for performance
- **RLS**: Only authenticated users can comment, only owners can delete
- **Sorting**: Comments sorted by newest first (can be configurable)

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Comment System in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create `comments` table in Supabase.
  2. Create comment functions (`addComment`, `deleteComment`, `getComments`).
  3. Create `useComment` hook.
  4. Create `CommentSection` component.
  5. Create `Comment` component.
  6. Implement RLS policies.
  7. Create database indexes.
  8. Implement comment count trigger.
  9. Add character limit validation.
  10. Add error handling.
  11. Add tests according to "Comment System Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-15  
**Version**: 1.1  
**Status**: Phase 2 (Interaction Features) - ✅ **Completed**

> ✅ **Implementation Complete (2025-01-15)**:
>
> - ✅ Configurable Limits: `MAX_COMMENT_LENGTH` exposed via `NEXT_PUBLIC_MAX_COMMENT_LENGTH` env var (default: 500)
> - ✅ Character Counter: Real-time character counter with visual feedback (red when over limit, yellow when <50 remaining)
> - ✅ Relative Time: `date-fns` `formatDistanceToNow` implemented for localized relative timestamps
> - ✅ Counters: `comments_count` trigger implemented with backfill (`20250115_13_add_comments_count_trigger.sql`)
> - ✅ Error Messages: User-friendly error messages for validation failures

