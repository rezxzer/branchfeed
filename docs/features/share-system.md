# Share System - BranchFeed

ეს დოკუმენტაცია აღწერს Share System-ის იმპლემენტაციას BranchFeed-ში.

---

## 📋 Overview

Share System არის BranchFeed-ის ინტერაქციის სისტემა, რომელიც:
- საშუალებას აძლევს მომხმარებლებს გააზიარონ stories
- აკოპირებს story link-ს path-ით
- უზრუნველყოფს share modal-ს (optional)
- მხარდაჭერას უწევს social media sharing-ს (optional)

**Location**: `src/lib/share.ts`, `src/hooks/useShare.ts`, `src/components/ShareButton.tsx`

**Status**: 🟢 **Medium Priority** - Phase 2 (Interaction Features)

> ℹ️ **შენიშვნა**
>
> Share System არის BranchFeed-ის ინტერაქციის სისტემა, რომელიც გამოიყენება Story Detail Page-ზე.
>
> ეს სისტემა საშუალებას აძლევს მომხმარებლებს გააზიარონ stories მათი path-ით.

> ℹ️ **Cursor-ზე**
>
> ამ ფაილში მოყვანილი კოდი არის **სტრუქტურის მაგალითი**.
>
> რეალური იმპლემენტაცია უნდა შეიქმნას Cursor-ის მიერ, `.cursorrules` და
> `docs/PROJECT_PRIORITIES.md` ფაილებში აღწერილი წესების დაცვით.

---

## 🎯 Features

### Core Features (MVP - Phase 2)

1. **Copy Link**
   - Copy story URL to clipboard
   - Include path parameter (if user has path)
   - Show success toast notification
   - Handle copy errors

2. **Share with Path**
   - Include user's current path in URL
   - Format: `/story/[id]?path=A,B,A`
   - Path restoration on link open
   - Optional path parameter (if no path)
   - Path parameter უნდა იყოს ვალიდირებული (მხოლოდ 'A' / 'B' მნიშვნელობები და max depth-ის ლიმიტის დაცვით, როგორც Path Tracking System-შია აღწერილი)

3. **Share Modal** (Optional - Phase 2+)
   - Share modal dialog
   - Social media buttons (Twitter, Facebook, etc.)
   - Copy link button
   - Close button

4. **Share Button Component**
   - Share icon button
   - Click to copy/share
   - Loading state
   - Success/error feedback

---

## 🔧 Implementation Details

> **შენიშვნა: Base URL Configuration**
>
> `generateShareUrl` უნდა ეყრდნობოდეს კონფიგურირებულ base URL-ს (მაგალითად, `NEXT_PUBLIC_APP_URL`) და არ უნდა გამოიძახოს server-side გარემოში `window.location.origin`. ეს ფუნქცია უნდა ჩაითვალოს strictly client-side ლოგიკად ან გამოიყენოს კონფიგურირებადი base URL კონფიგურაციიდან.

### Share Functions

```typescript
// lib/share.ts

/**
 * Generate share URL for a story
 */
export function generateShareUrl(
  storyId: string,
  path?: string[]
): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : '';
  
  const url = new URL(`/story/${storyId}`, baseUrl);
  
  if (path && path.length > 0) {
    url.searchParams.set('path', path.join(','));
  }
  
  return url.toString();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (err) {
      document.body.removeChild(textArea);
      throw new Error('Failed to copy to clipboard');
    }
    return;
  }
  
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    throw new Error('Failed to copy to clipboard');
  }
}

/**
 * Share story
 */
export async function shareStory(
  storyId: string,
  path?: string[]
): Promise<void> {
  const shareUrl = generateShareUrl(storyId, path);
  
  // Try Web Share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Check out this story on BranchFeed',
        text: 'Check out this interactive story!',
        url: shareUrl,
      });
      return;
    } catch (err) {
      // User cancelled or error - fallback to copy
      if ((err as Error).name !== 'AbortError') {
        throw err;
      }
    }
  }
  
  // Fallback to copy to clipboard
  await copyToClipboard(shareUrl);
}
```

### useShare Hook

```typescript
// hooks/useShare.ts
'use client';

import { useState, useCallback } from 'react';
import { shareStory, copyToClipboard, generateShareUrl } from '@/lib/share';

interface UseShareResult {
  share: (storyId: string, path?: string[]) => Promise<void>;
  copyLink: (storyId: string, path?: string[]) => Promise<void>;
  shareUrl: (storyId: string, path?: string[]) => string;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export function useShare(): UseShareResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const share = useCallback(async (
    storyId: string,
    path?: string[]
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await shareStory(storyId, path);
      setSuccess(true);
      
      // Reset success after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Share failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const copyLink = useCallback(async (
    storyId: string,
    path?: string[]
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const url = generateShareUrl(storyId, path);
      await copyToClipboard(url);
      setSuccess(true);
      
      // Reset success after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Copy failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const shareUrl = useCallback((
    storyId: string,
    path?: string[]
  ): string => {
    return generateShareUrl(storyId, path);
  }, []);

  return {
    share,
    copyLink,
    shareUrl,
    loading,
    error,
    success,
  };
}
```

### ShareButton Component

```typescript
// components/ShareButton.tsx
'use client';

import { useShare } from '@/hooks/useShare';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/components/ui/toast';

interface ShareButtonProps {
  storyId: string;
  path?: string[];
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ShareButton({
  storyId,
  path,
  variant = 'outline',
  size = 'md',
  showLabel = false,
  className = '',
}: ShareButtonProps) {
  const { t } = useTranslation();
  const { copyLink, loading, success, error } = useShare();

  const handleShare = async () => {
    try {
      await copyLink(storyId, path);
      toast.success(t('share.copied'));
    } catch (err) {
      toast.error(t('share.errors.copyFailed'));
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={loading}
      className={className}
      aria-label={t('share.button')}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <span>{success ? '✓' : '🔗'}</span>
      )}
      {showLabel && (
        <span className="ml-2">
          {success ? t('share.copied') : t('share.button')}
        </span>
      )}
    </Button>
  );
}
```

### ShareModal Component (Optional)

```typescript
// components/ShareModal.tsx
'use client';

import { useState } from 'react';
import { useShare } from '@/hooks/useShare';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/components/ui/toast';

interface ShareModalProps {
  storyId: string;
  path?: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({
  storyId,
  path,
  isOpen,
  onClose,
}: ShareModalProps) {
  const { t } = useTranslation();
  const { shareUrl, copyLink, share } = useShare();
  const url = shareUrl(storyId, path);

  const handleCopy = async () => {
    try {
      await copyLink(storyId, path);
      toast.success(t('share.copied'));
    } catch (err) {
      toast.error(t('share.errors.copyFailed'));
    }
  };

  const handleSocialShare = async (platform: string) => {
    try {
      await share(storyId, path);
    } catch (err) {
      toast.error(t('share.errors.shareFailed'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('share.title')}>
      <div className="space-y-4">
        {/* URL Input */}
        <div>
          <Input
            value={url}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            onClick={handleCopy}
            className="mt-2 w-full"
          >
            {t('share.copyLink')}
          </Button>
        </div>

        {/* Social Media Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => handleSocialShare('twitter')}
          >
            Twitter
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialShare('facebook')}
          >
            Facebook
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

### Path Restoration from URL

```typescript
// In Story Detail Page - restore path from URL
import { useSearchParams } from 'next/navigation';

export function StoryDetailPageClient({ storyId }: { storyId: string }) {
  const searchParams = useSearchParams();
  const pathParam = searchParams.get('path');
  
  // Parse path from URL
  const pathFromUrl = pathParam 
    ? pathParam.split(',').filter(p => p === 'A' || p === 'B')
    : [];
  
  // Use pathFromUrl to initialize path tracking
  // ...
}
```

> **შენიშვნა: Path Validation**
>
> Path-ის აღდგენისას URL-იდან, ყველა არავალიდური სიმბოლო (რაც არ არის 'A' ან 'B') უნდა იგნორირდეს და, თუ შედეგი უკვე არღვევს max depth ლიმიტს, path უნდა დაბრუნდეს ცარიელ მასივად.

---

## 🌐 Internationalization (i18n)

### Translation Keys

```json
{
  "share": {
    "button": "Share",
    "title": "Share Story",
    "copyLink": "Copy Link",
    "copied": "Link copied to clipboard!",
    "shareOn": "Share on {platform}",
    "errors": {
      "copyFailed": "Failed to copy link",
      "shareFailed": "Failed to share"
    }
  }
}
```

**Note**: Web Share API-ში გამოყენებული `title` და `text` მნიშვნელობები (მაგალითად "Check out this story on BranchFeed") უნდა წამოვიდეს `share` i18n თარგმანებიდან და არ უნდა იყოს ჰარდკოდილი ინგლისური სტრინგები, რათა ენის შეცვლისას share ტექსტებიც ავტომატურად შეიცვალოს.

---

## ✅ Requirements Checklist

- [ ] Share functions created (`generateShareUrl`, `copyToClipboard`, `shareStory`)
- [ ] useShare hook created
- [ ] ShareButton component created
- [ ] ShareModal component created (optional)
- [ ] Path parameter in URL
- [ ] Path restoration from URL
- [ ] Web Share API support (mobile)
- [ ] Clipboard fallback
- [ ] Success/error feedback
- [ ] i18n support (all text translatable)
- [ ] Base URL configurable (მაგ. environment variable-ით) და არ არის მიბმული მხოლოდ `window.location.origin`-ზე

---

## 🧪 Share System Testing Checklist (MVP)

1. ✅ Copy Link:
   - Copy link works
   - URL includes story ID
   - URL includes path parameter (if path exists)
   - Success toast shows
   - Error handling works

2. ✅ Path in URL:
   - Path parameter included in URL
   - Path format correct (A,B,A)
   - Path restoration works on link open
   - Empty path handled correctly

3. ✅ Web Share API:
   - Web Share API works on mobile
   - Fallback to copy works
   - User cancellation handled

4. ✅ Share Modal (if implemented):
   - Modal opens/closes correctly
   - Copy link works from modal
   - Social media buttons work
   - URL displays correctly

5. ✅ Error Handling:
   - Clipboard errors handled
   - Share errors handled
   - User-friendly error messages

---

## 🔄 Future Enhancements

- **Social Media Integration**: Direct sharing to Twitter, Facebook, etc.
- **Share Analytics**: Track share counts
- **Share Preview**: Generate preview cards (Open Graph, Twitter Cards)
- **QR Code**: Generate QR code for story
- **Embed Code**: Generate embed code for stories
- **Share Templates**: Custom share messages
- **Share History**: View shared stories

---

## 📝 Notes

- **Phase 2 Priority**: Share System is medium priority for Phase 2
- **Path Parameter**: Path is optional in URL (only if user has path)
- **Web Share API**: Works on mobile devices (iOS Safari, Chrome Android)
- **Clipboard Fallback**: Fallback for browsers without clipboard API
- **URL Format**: `/story/[id]?path=A,B,A` (path is comma-separated)

---

## 🤖 Cursor Implementation Notes (Internal)

When implementing Share System in Cursor:

- Do NOT write code directly აქედან – გამოიყენე ეს დოკი როგორც source of truth.
- Steps:
  1. Create share functions (`generateShareUrl`, `copyToClipboard`, `shareStory`).
  2. Create `useShare` hook.
  3. Create `ShareButton` component.
  4. Create `ShareModal` component (optional).
  5. Implement path parameter in URL.
  6. Implement path restoration from URL.
  7. Add Web Share API support.
  8. Add clipboard fallback.
  9. Add success/error feedback.
  10. Add tests according to "Share System Testing Checklist (MVP)".

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Phase 2 (Interaction Features) - 🟢 Medium Priority

