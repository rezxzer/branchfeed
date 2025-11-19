import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ToastProvider } from '@/components/ui/toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { VideoAutoplayProvider } from '@/contexts/VideoAutoplayContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { QueryProvider } from '@/providers/QueryProvider'
import { KeyboardShortcutsProvider } from '@/providers/KeyboardShortcutsProvider'
import { siteConfig } from '@/config/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'BranchFeed – Interactive Branching Stories',
    template: '%s | BranchFeed',
  },
  description: siteConfig.description,
  keywords: ['branching stories', 'interactive video', 'choose your own adventure', 'storytelling', 'video stories'],
  authors: [{ name: 'Rezi' }],
  creator: 'Rezi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'BranchFeed – Interactive Branching Stories',
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'BranchFeed – Interactive Branching Stories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BranchFeed – Interactive Branching Stories',
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'preload-image': siteConfig.ogImage,
  },
}

export const viewport: Viewport = {
  themeColor: '#0b1220',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50 dark:bg-slate-950 dark:text-slate-50 light:bg-white light:text-slate-900">
        <ErrorBoundary>
          <ThemeProvider>
            <QueryProvider>
              <KeyboardShortcutsProvider>
                <ToastProvider>
                  <VideoAutoplayProvider>
                    <div className="flex min-h-screen flex-col">
                      <Header />
                      <main className="flex-1">
                        {children}
                      </main>
                      <Footer />
                    </div>
                  </VideoAutoplayProvider>
                </ToastProvider>
              </KeyboardShortcutsProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

