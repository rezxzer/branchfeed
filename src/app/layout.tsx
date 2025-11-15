import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { ToastProvider } from '@/components/ui/toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'BranchFeed - Interactive Branching Stories',
  description: 'Create and explore interactive branching video stories',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ErrorBoundary>
          <ToastProvider>
            <Header />
            <main>{children}</main>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

