'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * React Error Boundary component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // TODO: Log to error reporting service (e.g., Sentry) in production
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      const errorMessage = this.state.error?.message || 'An unexpected error occurred'
      const isDevelopment = process.env.NODE_ENV === 'development'

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <ErrorState
              title="Something went wrong"
              message={errorMessage}
              retryLabel="Reload Page"
              onRetry={this.handleReload}
            />

            {isDevelopment && this.state.errorInfo && (
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-300 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs text-red-400 overflow-auto max-h-96 mt-2">
                    {this.state.error?.stack}
                    {'\n\n'}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}

            <div className="mt-4 flex justify-center gap-4">
              <Button variant="outline" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="primary" onClick={this.handleReload}>
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

