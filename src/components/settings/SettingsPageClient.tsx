'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { ProfileSettings } from './ProfileSettings'
import { LanguageSettings } from './LanguageSettings'
import { SubscriptionSettings } from './SubscriptionSettings'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { useProfile } from '@/hooks/useProfile'

interface SettingsPageClientProps {
  userId: string
}

type SettingsTab = 'profile' | 'language' | 'subscription'

export function SettingsPageClient({ userId }: SettingsPageClientProps) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const { profile, loading, error, updateProfile } = useProfile(userId)

  // Check URL parameter for subscription tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'subscription') {
      setActiveTab('subscription')
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <ErrorState
          title={t('settings.errors.loadFailed')}
          message={error?.message || t('settings.errors.profileNotFound')}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          {t('settings.title')}
        </h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium transition-colors ease-smooth ${
                activeTab === 'profile'
                  ? 'text-brand-cyan border-b-2 border-brand-cyan'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t('settings.tabs.profile')}
            </button>
            <button
              onClick={() => setActiveTab('language')}
              className={`px-4 py-2 font-medium transition-colors ease-smooth ${
                activeTab === 'language'
                  ? 'text-brand-cyan border-b-2 border-brand-cyan'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t('settings.tabs.language')}
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`px-4 py-2 font-medium transition-colors ease-smooth ${
                activeTab === 'subscription'
                  ? 'text-brand-cyan border-b-2 border-brand-cyan'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Subscription
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <ProfileSettings profile={profile} onUpdate={updateProfile} />
        )}

        {activeTab === 'language' && (
          <LanguageSettings
            currentLanguage={profile.language_preference}
            onUpdate={(lang) => updateProfile({ language_preference: lang })}
          />
        )}

        {activeTab === 'subscription' && (
          <SubscriptionSettings userId={userId} />
        )}
      </div>
    </div>
  )
}

