'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Info, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MEDIA_SIZE_LIMITS, SUPPORTED_FORMATS, VIDEO_SPECS, IMAGE_SPECS } from '@/config/media'

interface MediaUploadRulesProps {
  type: 'image' | 'video'
  className?: string
}

/**
 * Media Upload Rules Component
 * 
 * Displays upload requirements, recommendations, and tips for media files
 */
export function MediaUploadRules({ type, className }: MediaUploadRulesProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const specs = type === 'video' ? VIDEO_SPECS : IMAGE_SPECS
  const limits = MEDIA_SIZE_LIMITS[type]
  const formats = SUPPORTED_FORMATS[type]

  return (
    <div className={cn('bg-gray-800/30 rounded-lg border border-gray-700/50', className)}>
      {/* Header - Always Visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-700/20 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-cyan" />
          <span className="text-sm font-medium text-gray-300">
            {type === 'video' ? 'Video' : 'Image'} Upload Requirements
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* File Size */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              File Size
            </h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Maximum:</span>
                <span className="text-white font-medium">{limits.maxMB} MB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Recommended:</span>
                <span className="text-brand-cyan font-medium">{limits.recommendedMB} MB or less</span>
              </div>
            </div>
          </div>

          {/* Supported Formats */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Supported Formats
            </h4>
            <div className="space-y-1">
              <p className="text-sm text-white font-medium">{formats.display}</p>
              {type === 'video' && formats.recommended && (
                <p className="text-xs text-brand-cyan">
                  ⭐ Best: {formats.recommended}
                </p>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {type === 'video' ? 'Video' : 'Image'} Specifications
            </h4>
            <div className="space-y-2">
              {/* Aspect Ratio */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Aspect Ratio:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-brand-cyan/20 text-brand-cyan rounded text-xs font-medium">
                    ⭐ {specs.recommended.aspectRatio} (Portrait)
                  </span>
                  {specs.acceptable.aspectRatios
                    .filter(ratio => ratio !== specs.recommended.aspectRatio)
                    .map(ratio => (
                      <span key={ratio} className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs">
                        {ratio}
                      </span>
                    ))}
                </div>
              </div>

              {/* Resolution */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Resolution:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-brand-cyan/20 text-brand-cyan rounded text-xs font-medium">
                    ⭐ {specs.recommended.resolution}
                  </span>
                  {specs.acceptable.resolutions
                    .filter(res => res !== specs.recommended.resolution)
                    .map(res => (
                      <span key={res} className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs">
                        {res}
                      </span>
                    ))}
                </div>
              </div>

              {/* Video Duration */}
              {type === 'video' && 'duration' in specs.recommended && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Duration:</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">Minimum:</span>
                      <span className="text-white">{specs.recommended.duration.min}s</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">Recommended:</span>
                      <span className="text-brand-cyan font-medium">{specs.recommended.duration.recommended}s</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">Maximum:</span>
                      <span className="text-white">{specs.recommended.duration.max}s (1 min)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Video FPS & Codec */}
              {type === 'video' && 'fps' in specs.recommended && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Frame Rate:</p>
                    <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs inline-block">
                      {specs.recommended.fps} FPS
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Codec:</p>
                    <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs inline-block">
                      {specs.recommended.codec}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="pt-3 border-t border-gray-700/50">
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Tips for Best Quality
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              {type === 'video' ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-cyan mt-0.5">•</span>
                    <span>Use vertical (9:16) format for mobile-optimized viewing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-cyan mt-0.5">•</span>
                    <span>Keep videos under 30 seconds for better engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-cyan mt-0.5">•</span>
                    <span>Use good lighting and stable camera for clear footage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-cyan mt-0.5">•</span>
                    <span>Compress large files before uploading to reduce size</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-cyan mt-0.5">•</span>
                    <span>Use vertical (9:16) format for mobile-optimized viewing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-cyan mt-0.5">•</span>
                    <span>Compress images to reduce file size without losing quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-cyan mt-0.5">•</span>
                    <span>Use JPEG for photos, PNG for graphics with transparency</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
