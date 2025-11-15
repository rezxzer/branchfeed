'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Progress } from '@/components/ui/Progress'
import { uploadAvatar } from '@/lib/avatars'
import type { Profile } from '@/types'

interface ProfileSettingsProps {
  profile: Profile
  onUpdate: (updates: Partial<Profile>) => Promise<void>
}

export function ProfileSettings({
  profile,
  onUpdate,
}: ProfileSettingsProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const [username, setUsername] = useState(profile.username || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Basic validation
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setErrors({ avatar: t('settings.errors.avatarTooLarge') })
        return
      }
      setAvatarFile(file)
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
      setErrors({ ...errors, avatar: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!username.trim()) {
      newErrors.username = t('settings.errors.usernameRequired')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      let avatarUrl = profile.avatar_url

      // Upload avatar if file was selected
      if (avatarFile && user) {
        try {
          // Simulate upload progress for better UX
          setUploadProgress(0)
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              if (prev === null || prev >= 90) {
                clearInterval(progressInterval)
                return 90
              }
              return prev + 10
            })
          }, 200)

          avatarUrl = await uploadAvatar(avatarFile, user.id)
          
          clearInterval(progressInterval)
          setUploadProgress(100)
          showToast('Avatar uploaded successfully!', 'success')
          
          // Clear progress after a short delay
          setTimeout(() => {
            setUploadProgress(null)
          }, 1000)
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError)
          setUploadProgress(null)
          setErrors({
            avatar: uploadError instanceof Error ? uploadError.message : t('settings.errors.avatarUploadFailed'),
          })
          setLoading(false)
          return
        }
      }

      // Update profile with new data
      await onUpdate({
        username: username.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
      })

      // Clear avatar file state after successful update
      setAvatarFile(null)
      // Update avatar preview with new URL
      setAvatarPreview(avatarUrl)
      showToast('Profile updated successfully!', 'success')
      // Refresh page to update avatar in header and other places
      router.refresh()
    } catch (err) {
      console.error('Error updating profile:', err)
      setErrors({
        submit: err instanceof Error ? err.message : t('settings.errors.updateFailed'),
      })
      showToast('Failed to update profile. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-level-2 border border-gray-700/50 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          {t('settings.profile.title')}
        </h2>

        {/* Avatar Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('settings.profile.avatar')}
          </label>
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar preview"
                width={80}
                height={80}
                className="rounded-full object-cover border-2 border-gray-700"
                unoptimized
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-brand flex items-center justify-center text-white text-2xl font-semibold">
                {username.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors ease-smooth"
              >
                {avatarPreview ? t('settings.profile.changeAvatar') : t('settings.profile.uploadAvatar')}
              </label>
              {errors.avatar && (
                <p className="mt-1 text-sm text-error">{errors.avatar}</p>
              )}
            </div>
          </div>
          
          {/* Upload Progress */}
          {uploadProgress !== null && (
            <div className="mt-3">
              <Progress
                value={uploadProgress}
                variant={uploadProgress === 100 ? 'success' : 'default'}
                size="sm"
                showLabel={true}
                label="Uploading avatar..."
              />
            </div>
          )}
        </div>

        {/* Username */}
        <div className="mb-6">
          <Input
            id="username"
            type="text"
            label={t('settings.profile.username')}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (errors.username) setErrors({ ...errors, username: '' })
            }}
            error={errors.username}
            required
            placeholder="Enter username..."
          />
        </div>

        {/* Bio */}
        <div className="mb-6">
          <Textarea
            id="bio"
            label={t('settings.profile.bio')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
          isLoading={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              {t('settings.profile.saving')}
            </>
          ) : (
            t('settings.profile.save')
          )}
        </Button>
      </div>
    </form>
  )
}

