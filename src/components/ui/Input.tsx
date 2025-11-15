'use client'

import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = error ? `error-${inputId}` : undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          className={cn(
            'w-full px-4 py-2.5 border rounded-xl transition-all ease-smooth',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'bg-gray-800 text-white placeholder:text-gray-500',
            error
              ? 'border-error focus:ring-error focus:border-error'
              : 'border-gray-700 hover:border-gray-600 focus:ring-brand-cyan focus:border-brand-cyan',
            props.disabled &&
              'bg-gray-800/50 cursor-not-allowed opacity-60',
            className
          )}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

