'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  // Redirect to feed if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/feed')
    }
  }, [isAuthenticated, loading, router])

  // Show nothing while checking auth or redirecting
  if (loading || isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
    </div>
  )
}

