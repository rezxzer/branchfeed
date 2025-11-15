'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useTranslation } from '@/hooks/useTranslation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut, isAuthenticated, loading } = useAuth()
  const { profile } = useProfile(user?.id || '')
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Check if we're on auth pages
  const isAuthPage = pathname === '/signin' || pathname === '/signup'

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    setUserMenuOpen(false)
  }

  return (
    <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-brand-cyan">🌿</span>
              <span className="ml-2 text-xl font-bold text-white hidden sm:block">
                {t('header.logo')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!isAuthPage && isAuthenticated && (
              <>
                <Link
                  href="/feed"
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === '/feed'
                      ? 'text-brand-cyan bg-brand-iris/20'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                  )}
                >
                  {t('header.feed')}
                </Link>
                <Link
                  href="/create"
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === '/create'
                      ? 'text-brand-cyan bg-brand-iris/20'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                  )}
                >
                  {t('header.create')}
                </Link>
              </>
            )}
          </nav>

          {/* Right side: Language Switcher, Auth Buttons */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Auth Buttons / User Menu */}
            {!loading && (
              <>
                {!isAuthenticated && !isAuthPage && (
                  <div className="hidden md:flex items-center space-x-3">
                    <Link
                      href="/signin"
                      className="px-3 py-1.5 rounded-xl text-sm font-semibold text-white hover:bg-gray-800 hover:text-brand-cyan transition-all ease-smooth"
                    >
                      {t('header.signIn')}
                    </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/signup')}
                className="shadow-sm"
              >
                {t('header.signUp')}
              </Button>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ease-smooth"
                      aria-label="User menu"
                    >
                      {profile?.avatar_url ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
                          <Image
                            src={profile.avatar_url}
                            alt={profile.username || 'User avatar'}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-semibold">
                          {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="hidden sm:block text-sm font-medium text-gray-300">
                        {profile?.username || user?.email?.split('@')[0] || 'User'}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-level-2 z-50">
                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
                          >
                            {t('header.profile')}
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
                          >
                            {t('header.settings')}
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
                          >
                            {t('header.signOut')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Menu Button */}
                {!isAuthPage && (
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors ease-smooth"
                    aria-label="Mobile menu"
                  >
                    <svg
                      className="w-6 h-6 text-gray-300"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {mobileMenuOpen ? (
                        <path d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && !isAuthPage && isAuthenticated && (
          <div className="md:hidden border-t border-gray-700/50 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === '/feed'
                    ? 'text-brand-cyan bg-brand-iris/20'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                )}
              >
                {t('header.feed')}
              </Link>
              <Link
                href="/create"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === '/create'
                    ? 'text-brand-cyan bg-brand-iris/20'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                )}
              >
                {t('header.create')}
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
              >
                {t('header.profile')}
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
              >
                {t('header.settings')}
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {t('header.signOut')}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

