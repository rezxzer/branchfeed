/**
 * Select Component
 * 
 * Dropdown select component for forms.
 * Supports controlled and uncontrolled modes.
 */

'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export function Select({
  label,
  error,
  helperText,
  fullWidth = false,
  className,
  children,
  ...props
}: SelectProps) {
  const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx('space-y-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <select
        id={selectId}
        className={clsx(
          'w-full px-4 py-2.5 bg-gray-800/50 border rounded-lg',
          'text-white placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors ease-smooth',
          error
            ? 'border-red-500/50 focus:ring-red-500'
            : 'border-gray-700/50',
          className
        )}
        {...props}
      >
        {children}
      </select>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  );
}

