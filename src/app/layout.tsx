import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ToastProvider } from '@/components/ui/toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { VideoAutoplayProvider } from '@/contexts/VideoAutoplayContext'
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <ErrorBoundary>
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
        </ErrorBoundary>
      </body>
    </html>
  )
}

