import { createClientClient } from './supabase/client'

/**
 * Upload avatar image to Supabase Storage
 * @param file - Image file to upload
 * @param userId - User ID for folder organization
 * @returns Public URL of uploaded avatar
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = createClientClient()

  if (!supabase) {
    throw new Error('Supabase client is not available. Check environment variables.')
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  // Validate file size (5MB max for avatars)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('Avatar file is too large (max 5MB)')
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `avatar-${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // Upload file to avatars bucket
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Replace existing avatar
    })

  if (error) {
    console.error('Error uploading avatar:', error)
    
    // Provide helpful error message for common issues
    if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
      throw new Error(
        `Storage bucket 'avatars' not found. Please create the bucket in Supabase Dashboard:\n\n` +
        `1. Go to Supabase Dashboard → Storage\n` +
        `2. Click "New bucket"\n` +
        `3. Name: "avatars"\n` +
        `4. Make it Public\n` +
        `5. See docs/STORAGE_SETUP_INSTRUCTIONS.md for detailed steps`
      )
    }
    
    throw new Error(`Failed to upload avatar: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(filePath)

  return publicUrl
}

/**
 * Delete avatar from Supabase Storage
 * @param avatarUrl - Public URL of avatar to delete
 * @param userId - User ID for folder organization
 */
export async function deleteAvatar(avatarUrl: string, userId: string): Promise<void> {
  const supabase = createClientClient()

  if (!supabase) {
    throw new Error('Supabase client is not available. Check environment variables.')
  }

  // Extract file path from URL
  const urlParts = avatarUrl.split('/')
  const fileName = urlParts[urlParts.length - 1]
  const filePath = `${userId}/${fileName}`

  // Delete file
  const { error } = await supabase.storage
    .from('avatars')
    .remove([filePath])

  if (error) {
    console.error('Error deleting avatar:', error)
    // Don't throw - deletion failure is not critical
  }
}

