'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-semibold rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          // Variants
          variant === 'primary' &&
            'bg-gradient-brand text-white hover:opacity-90 active:scale-[0.98] shadow-sm hover:shadow-md transition-all ease-bounce-soft',
          variant === 'secondary' &&
            'bg-gradient-vip text-white hover:opacity-90 shadow-sm hover:shadow-md transition-all ease-bounce-soft',
          variant === 'outline' &&
            'bg-transparent text-white border-2 border-white/80 hover:bg-white/10 hover:border-white hover:text-white transition-all ease-smooth shadow-sm',
          variant === 'ghost' &&
            'bg-transparent text-gray-700 hover:bg-gray-100',
          variant === 'danger' &&
            'bg-error text-white hover:bg-error-dark shadow-sm hover:shadow-md',
          // Sizes
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-5 py-2.5 text-base',
          size === 'lg' && 'px-6 py-3 text-lg',
          // States
          isDisabled && 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60',
          isLoading && 'cursor-wait',
          // Full width
          fullWidth && 'w-full',
          // Focus ring
          'focus:ring-brand-iris',
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

