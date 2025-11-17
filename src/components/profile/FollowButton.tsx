'use client'

import { Button, type ButtonVariant } from '@/components/ui/Button'
import { useFollow } from '@/hooks/useFollow'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'

interface FollowButtonProps {
  userId: string
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FollowButton({ 
  userId, 
  variant = 'primary',
  size = 'md',
  className = ''
}: FollowButtonProps) {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const { isFollowing, isLoading, follow, unfollow } = useFollow(userId)

  const handleClick = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to follow users', 'warning')
      return
    }

    try {
      if (isFollowing) {
        await unfollow()
        showToast('Unfollowed successfully', 'success')
      } else {
        await follow()
        showToast('Following successfully', 'success')
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error)
      showToast(error.message || 'Failed to update follow status', 'error')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Button
      variant={(isFollowing ? 'outline' : variant) as ButtonVariant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  )
}

