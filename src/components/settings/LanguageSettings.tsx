'use client'

import { useState } from 'react'
import { useTranslation, type Language } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

interface LanguageSettingsProps {
  currentLanguage: string
  onUpdate: (language: string) => Promise<void>
}

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

export function LanguageSettings({
  currentLanguage,
  onUpdate,
}: LanguageSettingsProps) {
  const { t, setLanguage } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    (currentLanguage as Language) || 'en'
  )
  const [loading, setLoading] = useState(false)

  const handleLanguageChange = async (lang: Language) => {
    setSelectedLanguage(lang)
    setLanguage(lang) // Update UI immediately

    setLoading(true)
    try {
      await onUpdate(lang)
    } catch (err) {
      console.error('Error updating language:', err)
      // Revert on error
      setSelectedLanguage(currentLanguage as Language)
      setLanguage(currentLanguage as Language)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-level-2 border border-gray-700/50 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        {t('settings.language.title')}
      </h2>

      <div className="space-y-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={loading}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ease-smooth ${
              selectedLanguage === lang.code
                ? 'bg-brand-iris/20 border-2 border-brand-cyan text-brand-cyan'
                : 'bg-gray-700/50 border-2 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
            } ${loading && 'opacity-50 cursor-not-allowed'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </div>
            {selectedLanguage === lang.code && (
              <span className="text-brand-cyan">✓</span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <Spinner size="sm" />
          <span className="ml-2 text-sm text-gray-400">
            {t('settings.language.saving')}
          </span>
        </div>
      )}
    </div>
  )
}

