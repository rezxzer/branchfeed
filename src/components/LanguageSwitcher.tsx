'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation, type Language } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const currentLanguage = languages.find((lang) => lang.code === language)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ease-smooth"
        aria-label="Language selector"
        aria-expanded={isOpen}
      >
        <span className="text-xl">{currentLanguage?.flag}</span>
        <span className="hidden sm:block text-sm font-medium text-gray-300">
          {currentLanguage?.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-level-2 z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ease-smooth',
                  language === lang.code
                    ? 'bg-brand-iris/20 text-brand-cyan font-semibold'
                    : 'text-gray-300 hover:bg-gray-700'
                )}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

