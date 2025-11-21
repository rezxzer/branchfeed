# Video & Image Upload Rules - BranchFeed

**თარიღი**: 2025-11-21  
**სტატუსი**: ✅ დასრულებული

---

## 🎯 რა გაუმჯობესდა?

### ადრე (Before):
- ❌ არ იყო ვიზუალური წესები
- ❌ არ იყო file size indicators
- ❌ არ იყო recommended specs
- ❌ არ იყო tips და რეკომენდაციები
- ❌ მარტივი validation მხოლოდ

### ახლა (After):
- ✅ **Upload Rules Component** - Expandable rules panel
- ✅ **File Size Indicator** - Visual progress bar
- ✅ **Validation with Config** - Centralized rules
- ✅ **Detailed Specs** - Recommended/acceptable/minimum
- ✅ **Tips & Recommendations** - UX guidance
- ✅ **Better Error Messages** - Clear, helpful errors

---

## 📦 ახალი ფაილები

### 1. Media Config (`src/config/media.ts`)

**რას შეიცავს:**
- File size limits (10MB images, 100MB videos)
- Supported formats (JPEG, PNG, WebP, GIF for images; MP4, WebM, MOV, AVI for videos)
- Video specifications (resolution, FPS, codec, duration)
- Image specifications (resolution, aspect ratio)
- Validation functions
- Helper functions (formatFileSize, detectMediaType, etc.)

**გამოყენება:**
```typescript
import { 
  MEDIA_SIZE_LIMITS, 
  SUPPORTED_FORMATS, 
  detectMediaType,
  getFileValidationError 
} from '@/config/media'

// Check file size limit
const maxSize = MEDIA_SIZE_LIMITS.video.max // 100MB

// Detect file type
const type = detectMediaType(file) // 'image' | 'video' | 'unknown'

// Validate file
const error = getFileValidationError(file, 'video') // null or error message
```

---

### 2. Upload Rules Component (`src/components/create/MediaUploadRules.tsx`)

**ფუნქციები:**
- ✅ Expandable/collapsible panel
- ✅ Shows file size limits (max & recommended)
- ✅ Shows supported formats
- ✅ Shows video/image specs (aspect ratio, resolution, FPS, codec)
- ✅ Shows recommended duration (videos)
- ✅ Tips for best quality

**გამოყენება:**
```tsx
<MediaUploadRules 
  type="video" // or 'image'
  className="mb-4"
/>
```

---

### 3. Enhanced RootStoryForm (`src/components/create/RootStoryForm.tsx`)

**რა შეიცვალა:**
- Uses MediaUploadRules component
- Uses media config for validation
- Shows file size indicator (progress bar)
- Visual warning for large files
- Better error messages
- Quick tips below upload buttons

---

## 📊 Upload Limits & Specifications

### Images

| Specification | Value |
|--------------|-------|
| **Max Size** | 10 MB |
| **Recommended Size** | 5 MB or less |
| **Supported Formats** | JPEG, PNG, WebP, GIF |
| **Recommended Format** | JPEG or PNG |
| **Aspect Ratio** | 9:16 (portrait) recommended |
| **Resolution** | 1080x1920 recommended |
| **Minimum Resolution** | 480x854 |

### Videos

| Specification | Value |
|--------------|-------|
| **Max Size** | 100 MB |
| **Recommended Size** | 50 MB or less |
| **Supported Formats** | MP4, WebM, MOV, AVI |
| **Recommended Format** | MP4 (H.264) |
| **Aspect Ratio** | 9:16 (portrait) recommended |
| **Resolution** | 1080x1920 recommended |
| **Frame Rate** | 30 FPS recommended |
| **Duration** | 3-60 seconds (30s recommended) |
| **Codec** | H.264 |

---

## 🎨 Upload UI Features

### 1. Upload Rules Panel (Expandable)

**როდესაც დახურულია:**
- Shows "Video/Image Upload Requirements" header
- Click to expand

**როდესაც გახსნილია:**
- File Size (max & recommended)
- Supported Formats
- Specifications (aspect ratio, resolution, FPS, codec, duration)
- Tips for best quality

### 2. File Size Indicator

**როდესაც ფაილი არჩეულია:**
- File name and size display
- Visual progress bar (shows % of max size)
- Color coding:
  - 🟦 **Cyan** - Good size (< recommended)
  - 🟨 **Yellow** - Large size (> recommended but < max)
  - Warning message for large files

### 3. Error Messages

**Better error messages:**
- ❌ Invalid file type → Shows supported formats
- ❌ File too large → Shows current size vs max size
- ❌ Upload failed → Shows helpful troubleshooting

### 4. Quick Tips

**Always visible tips:**
- 💡 Use vertical (9:16) format for best mobile experience
- 💡 Videos: Keep under 50MB and 30-60 seconds

---

## 🔧 Technical Implementation

### Config-Based Validation

All upload rules are centralized in `src/config/media.ts`:

```typescript
// File size limits
export const MEDIA_SIZE_LIMITS = {
  image: {
    max: 10 * 1024 * 1024, // 10MB
    recommended: 5 * 1024 * 1024, // 5MB
  },
  video: {
    max: 100 * 1024 * 1024, // 100MB
    recommended: 50 * 1024 * 1024, // 50MB
  },
}

// Supported formats
export const SUPPORTED_FORMATS = {
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },
  video: {
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    extensions: ['.mp4', '.webm', '.mov', '.avi'],
  },
}
```

**Benefits:**
- ✅ Single source of truth
- ✅ Easy to update limits
- ✅ Reusable across app
- ✅ Type-safe validation

---

### Validation Flow

```
1. User selects file
   ↓
2. detectMediaType(file)
   ↓
3. getFileValidationError(file, type)
   ↓
4. If valid → Show preview + size indicator
   If invalid → Show error message
```

---

## 🧪 Testing Checklist

### Upload Rules Component
- [ ] Click "Video/Image Upload Requirements" → expands/collapses
- [ ] Shows correct specs for video/image
- [ ] All sections visible (file size, formats, specs, tips)
- [ ] Responsive on mobile

### File Validation
- [ ] Valid image (JPEG, PNG, WebP, GIF) → accepts
- [ ] Valid video (MP4, WebM, MOV, AVI) → accepts
- [ ] Invalid file type → shows error
- [ ] File too large → shows error with size info
- [ ] Error messages are clear and helpful

### File Size Indicator
- [ ] Shows file name and size
- [ ] Progress bar fills correctly
- [ ] Color changes (cyan → yellow) when size > recommended
- [ ] Warning message shows for large files
- [ ] Remove button works

### Upload Flow
- [ ] Select image → Upload Rules shows image specs
- [ ] Select video → Upload Rules shows video specs
- [ ] Upload succeeds → story created
- [ ] Preview shows video/image correctly

---

## 📝 Future Enhancements (Optional)

### Video Duration Check
```typescript
// Check video duration (requires video load)
const video = document.createElement('video')
video.src = URL.createObjectURL(file)
video.onloadedmetadata = () => {
  if (video.duration > 60) {
    // Show warning or error
  }
}
```

### Video Resolution Check
```typescript
// Check video resolution
video.onloadedmetadata = () => {
  if (video.videoWidth < 480 || video.videoHeight < 854) {
    // Show warning (low resolution)
  }
}
```

### Upload Progress Bar
```typescript
// Show upload progress (0-100%)
import { simulateUploadProgress } from '@/lib/uploadProgress'

simulateUploadProgress(file.size, (progress) => {
  console.log(`${progress.percentage}% uploaded`)
})
```

### Drag & Drop Upload
```typescript
// Drag and drop file upload
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  if (file) {
    handleFileChange(file)
  }
}
```

---

## 📚 დაკავშირებული დოკუმენტაცია

- **Video Improvements**: `docs/VIDEO_IMPROVEMENTS.md`
- **Video Update README**: `VIDEO_UPDATE_README.md`
- **Storage Setup**: `docs/STORAGE_SETUP_INSTRUCTIONS.md`
- **Upload Progress**: `src/lib/uploadProgress.ts`

---

## ✅ დასკვნა

**რა მივიღეთ:**
- 📋 **Clear Rules** - ყველაფერი გასაგებია მომხმარებელზე
- 🎨 **Visual Indicators** - File size progress bar
- ✅ **Better Validation** - Config-based, reusable
- 💡 **Helpful Tips** - Recommendations and best practices
- 🐛 **Better Errors** - Clear, actionable error messages

**Upload ფუნქციონალი ახლა professional და user-friendly! 🎉**

---

**Last Updated**: 2025-11-21  
**Status**: ✅ Complete
