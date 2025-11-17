"use client"

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log error for debugging; avoid noisy logs in production
    // eslint-disable-next-line no-console
    console.error('[APP ERROR]', { message: error.message, digest: error.digest })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-400 mb-6">Please try again. If the problem persists, contact support.</p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-brand-cyan text-gray-900 hover:opacity-90 transition"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
