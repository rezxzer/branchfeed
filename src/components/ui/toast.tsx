'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = { id, message, type, duration }

      setToasts((prev) => [...prev, newToast])

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast
  onRemove: (id: string) => void
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300) // Wait for animation
  }

  const typeStyles = {
    success: 'bg-green-500/90 text-white border-green-600',
    error: 'bg-red-500/90 text-white border-red-600',
    info: 'bg-blue-500/90 text-white border-blue-600',
    warning: 'bg-yellow-500/90 text-white border-yellow-600',
  }

  return (
    <div
      className={`
        ${typeStyles[toast.type]}
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
        cursor-pointer
        hover:opacity-100
      `}
      onClick={handleRemove}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleRemove()
          }}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Close toast"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

