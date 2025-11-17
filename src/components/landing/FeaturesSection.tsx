'use client'

import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const features = [
  {
    icon: '🌿',
    titleKey: 'landing.features.branching.title',
    descriptionKey: 'landing.features.branching.description',
  },
  {
    icon: '🎯',
    titleKey: 'landing.features.choices.title',
    descriptionKey: 'landing.features.choices.description',
  },
  {
    icon: '📍',
    titleKey: 'landing.features.paths.title',
    descriptionKey: 'landing.features.paths.description',
  },
]

export function FeaturesSection() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <section id="features" className="py-20 px-4 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          {t('landing.features.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50 hover:border-brand-cyan/50 transition-all ease-smooth"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-gray-300 mb-4">{t(feature.descriptionKey)}</p>
              <div className="mt-2">
                <Link
                  href="/about"
                  className="text-sm font-medium text-brand-cyan hover:text-brand-cyan/90 transition-colors"
                >
                  Learn more →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/signup')}
            className="shadow-sm"
          >
            Get started for free
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/signin')}
          >
            Sign in
          </Button>
        </div>
      </div>
    </section>
  )
}

