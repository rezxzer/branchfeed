'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full px-4 py-2 border rounded-lg transition-colors ease-smooth',
            'focus:outline-none focus:ring-2 focus:ring-brand-iris focus:border-transparent',
            'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400',
            error
              ? 'border-error bg-error/10'
              : 'hover:border-gray-600',
            props.disabled && 'bg-gray-900 cursor-not-allowed opacity-60',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

