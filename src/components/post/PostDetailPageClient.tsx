'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { LikeButton } from '@/components/ui/LikeButton'
import { CommentSection } from '@/components/story/CommentSection'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { useToast } from '@/components/ui/toast'
import { copyStoryLink, shareNative } from '@/lib/share'
import { createClientClient } from '@/lib/supabase/client'

interface Post {
  id: string
  title: string
  description: string | null
  media_url: string | null
  media_type: 'image' | 'video' | null
  author: {
    id: string
    username: string
    avatar_url: string | null
  }
  likes_count: number
  views_count: number
  comments_count: number
  created_at: string
}

interface PostDetailPageClientProps {
  postId: string
}

export function PostDetailPageClient({ postId }: PostDetailPageClientProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const supabase = createClientClient()

  // Fetch post data
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true)
        setError(null)

        // Fetch post with author info
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles!posts_author_id_fkey (
              id,
              username,
              avatar_url
            )
          `)
          .eq('id', postId)
          .single()

        if (postError) {
          throw postError
        }

        if (!postData) {
          throw new Error('Post not found')
        }

        // Check if user liked this post
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single()

          setIsLiked(!!likeData)
        }

        // Format post data
        const formattedPost: Post = {
          id: postData.id,
          title: postData.title,
          description: postData.description,
          media_url: postData.media_url,
          media_type: postData.media_type,
          author: {
            id: postData.author.id,
            username: postData.author.username,
            avatar_url: postData.author.avatar_url,
          },
          likes_count: postData.likes_count || 0,
          views_count: postData.views_count || 0,
          comments_count: postData.comments_count || 0,
          created_at: postData.created_at,
        }

        setPost(formattedPost)

        // Increment view count (if function exists)
        try {
          await supabase.rpc('increment_post_views', { post_id: postId })
        } catch (rpcError) {
          // Function might not exist yet (Phase 3+ feature)
          console.warn('increment_post_views function not found:', rpcError)
        }
      } catch (err) {
        console.error('Error fetching post:', err)
        setError(err instanceof Error ? err.message : 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId, supabase])

  const handleShare = async () => {
    try {
      setIsSharing(true)

      // Try native share first (mobile devices)
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await shareNative(postId, [], post?.title)
      } else {
        // Fallback to copy link
        const url = `${window.location.origin}/post/${postId}`
        if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
          const clipboard = (navigator as Navigator & { clipboard?: Clipboard }).clipboard
          if (clipboard) {
            await clipboard.writeText(url)
            showToast('Link copied to clipboard!', 'success')
          } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = url
            textArea.style.position = 'fixed'
            textArea.style.opacity = '0'
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            showToast('Link copied to clipboard!', 'success')
          }
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = url
          textArea.style.position = 'fixed'
          textArea.style.opacity = '0'
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          showToast('Link copied to clipboard!', 'success')
        }
      }
    } catch (err) {
      console.error('Error sharing post:', err)
      showToast('Failed to share post', 'error')
    } finally {
      setIsSharing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ErrorState
          title={t('post.notFound') || 'Post not found'}
          message={error || 'The post you are looking for does not exist.'}
          retryLabel={t('common.goBack') || 'Go Back'}
          onRetry={() => window.history.back()}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/profile/${post.author.id}`}>
          {post.author.avatar_url ? (
            <Image
              src={post.author.avatar_url}
              alt={post.author.username}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
              {post.author.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div>
          <Link href={`/profile/${post.author.id}`}>
            <p className="font-semibold hover:text-primary transition-colors">
              {post.author.username}
            </p>
          </Link>
          <p className="text-sm text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        {post.description && (
          <p className="text-lg text-muted-foreground whitespace-pre-wrap">
            {post.description}
          </p>
        )}
        {post.media_url && (
          <div className="rounded-lg overflow-hidden">
            {post.media_type === 'image' ? (
              <Image
                src={post.media_url}
                alt={post.title}
                width={800}
                height={600}
                className="w-full h-auto"
                unoptimized
              />
            ) : (
              <video
                src={post.media_url}
                controls
                className="w-full"
              />
            )}
          </div>
        )}
      </div>

      {/* Interactions */}
      <div className="flex items-center gap-4 mb-8 pb-8 border-b">
        <LikeButton
          storyId={post.id}
          initialLikesCount={post.likes_count}
        />
        <Button
          variant="outline"
          onClick={handleShare}
          disabled={isSharing}
          leftIcon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          }
        >
          {t('common.share') || 'Share'}
        </Button>
        <div className="text-sm text-muted-foreground">
          {post.views_count} {t('post.views') || 'views'} • {post.comments_count} {t('post.comments') || 'comments'}
        </div>
      </div>

      {/* Comments Section */}
      <div id={`comments-${post.id}`}>
        <CommentSection storyId={post.id} />
      </div>
    </div>
  )
}

