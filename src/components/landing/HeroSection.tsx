'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    router.prefetch('/signup')
    router.prefetch('/signin')
  }, [router])

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-brand px-4 py-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="text-center lg:text-left">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            {t('landing.hero.title')}
          </h1>
          <p className="text-xl text-white/90 mb-8 drop-shadow-md">
            {t('landing.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/signup')}
            >
              {t('landing.hero.signUp')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/signin')}
            >
              {t('landing.hero.signIn')}
            </Button>
          </div>
        </div>

        {/* Visual Element */}
        <div className="hidden lg:block">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-level-2 border border-white/20">
            {/* Placeholder for BranchFeed visual */}
            <div className="aspect-video bg-gradient-branch rounded-lg flex items-center justify-center">
              <span className="text-4xl">🌿</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

