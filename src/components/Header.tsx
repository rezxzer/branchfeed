'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useTranslation } from '@/hooks/useTranslation'
import { useAdmin } from '@/hooks/useAdmin'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ui/ThemeToggle'
import { Button } from './ui/Button'
import { SearchBar } from './search/SearchBar'
import { NotificationBell } from './notifications/NotificationBell'
import { cn } from '@/lib/utils'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut, isAuthenticated, loading } = useAuth()
  const { profile } = useProfile(user?.id || '')
  const { t } = useTranslation()
  const { isAdmin } = useAdmin()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Check if we're on auth pages
  const isAuthPage = pathname === '/signin' || pathname === '/signup'

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    setUserMenuOpen(false)
  }

  const scrollToFeatures: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (pathname === '/') {
      e.preventDefault()
      const el = typeof document !== 'undefined' ? document.getElementById('features') : null
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // navigate to landing with hash
      e.preventDefault()
      router.push('/#features')
    }
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
          <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
            {!isAuthPage && (
              <>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/feed"
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        pathname === '/feed'
                          ? 'text-brand-cyan bg-brand-iris/20'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                      )}
                      aria-label={pathname === '/feed' ? 'Feed (current page)' : 'Go to Feed'}
                      aria-current={pathname === '/feed' ? 'page' : undefined}
                    >
                      {t('header.feed')}
                    </Link>
                    <div className="w-64">
                      <SearchBar placeholder="Search stories and users..." />
                    </div>
                    <Link
                      href="/create"
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        pathname === '/create'
                          ? 'text-brand-cyan bg-brand-iris/20'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                      )}
                      aria-label={pathname === '/create' ? 'Create story (current page)' : 'Create a new story'}
                      aria-current={pathname === '/create' ? 'page' : undefined}
                    >
                      {t('header.create')}
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          pathname?.startsWith('/admin')
                            ? 'text-yellow-400 bg-yellow-400/20'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-yellow-400'
                        )}
                        aria-label={pathname?.startsWith('/admin') ? 'Admin dashboard (current page)' : 'Go to Admin dashboard'}
                        aria-current={pathname?.startsWith('/admin') ? 'page' : undefined}
                      >
                        👑 Admin
                      </Link>
                    )}
                  </>
                )}
                {/* Public navigation (optional) */}
                {!isAuthenticated && (
                  <>
                    <Link
                      href="#features"
                      onClick={scrollToFeatures}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        pathname === '/'
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                      )}
                      aria-label="View features section"
                    >
                      Features
                    </Link>
                  </>
                )}
                <Link
                  href="/about"
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === '/about'
                      ? 'text-brand-cyan bg-brand-iris/20'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                  )}
                  aria-label={pathname === '/about' ? 'About (current page)' : 'Learn more about BranchFeed'}
                  aria-current={pathname === '/about' ? 'page' : undefined}
                >
                  About
                </Link>
              </>
            )}
          </nav>

          {/* Right side: Theme Toggle, Language Switcher, Auth Buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle variant="icon" size="md" />
            
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
                  <>
                    {/* Notification Bell */}
                    <div className="hidden md:block">
                      <NotificationBell />
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ease-smooth"
                        aria-label={`User menu for ${profile?.username || user?.email?.split('@')[0] || 'User'}`}
                        aria-expanded={userMenuOpen}
                        aria-haspopup="true"
                        onKeyDown={(e) => {
                          if (e.key === 'Escape' && userMenuOpen) {
                            setUserMenuOpen(false)
                          }
                        }}
                      >
                      {profile?.avatar_url ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
                          <Image
                            src={profile.avatar_url}
                            alt={profile.username || 'User avatar'}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            style={{ width: 'auto', height: 'auto' }}
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
                      <div 
                        className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-level-2 z-50"
                        role="menu"
                        aria-label="User account menu"
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setUserMenuOpen(false)
                          }
                        }}
                      >
                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
                            role="menuitem"
                            aria-label="View your profile"
                          >
                            {t('header.profile')}
                          </Link>
                          <Link
                            href="/earnings"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
                            role="menuitem"
                            aria-label="View earnings"
                          >
                            💰 Earnings
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
                            role="menuitem"
                            aria-label="Open settings"
                          >
                            {t('header.settings')}
                          </Link>
                          <Link
                            href="/feedback"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
                            role="menuitem"
                            aria-label="Submit feedback"
                          >
                            💬 {t('header.feedback') || 'Feedback'}
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700 transition-colors ease-smooth"
                              role="menuitem"
                              aria-label="Go to admin dashboard"
                            >
                              👑 Admin
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
                            role="menuitem"
                            aria-label="Sign out of your account"
                          >
                            {t('header.signOut')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                    </>
                )}

                {/* Mobile Menu Button */}
                {!isAuthPage && (
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors ease-smooth"
                    aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-menu"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' && mobileMenuOpen) {
                        setMobileMenuOpen(false)
                      }
                    }}
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
        {mobileMenuOpen && !isAuthPage && (
          <div 
            id="mobile-menu"
            className="md:hidden border-t border-gray-700/50 py-4"
            role="menu"
            aria-label="Mobile navigation menu"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMobileMenuOpen(false)
              }
            }}
          >
            <div className="flex flex-col space-y-2">
              {isAuthenticated && (
                <>
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
                    href="/search"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === '/search'
                        ? 'text-brand-cyan bg-brand-iris/20'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                    )}
                  >
                    🔍 Search
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === '/notifications'
                        ? 'text-brand-cyan bg-brand-iris/20'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                    )}
                  >
                    🔔 Notifications
                  </Link>
                  <Link
                    href="/bookmarks"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === '/bookmarks'
                        ? 'text-brand-cyan bg-brand-iris/20'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                    )}
                  >
                    📑 Bookmarks
                  </Link>
                  <Link
                    href="/collections"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === '/collections' || pathname?.startsWith('/collections/')
                        ? 'text-brand-cyan bg-brand-iris/20'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                    )}
                  >
                    📚 Collections
                  </Link>
                  <Link
                    href="/drafts"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === '/drafts'
                        ? 'text-brand-cyan bg-brand-iris/20'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                    )}
                  >
                    📝 Drafts
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
                    href="/earnings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === '/earnings'
                        ? 'text-brand-cyan bg-brand-iris/20'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                    )}
                  >
                    💰 Earnings
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
                  >
                    {t('header.settings')}
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-yellow-400 hover:bg-gray-700 transition-colors ease-smooth"
                    >
                      👑 Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
                  >
                    {t('header.signOut')}
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link
                    href="#features"
                    onClick={(e) => {
                      scrollToFeatures(e)
                      setMobileMenuOpen(false)
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors ease-smooth"
                  >
                    Features
                  </Link>
                </>
              )}
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === '/about'
                    ? 'text-brand-cyan bg-brand-iris/20'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-brand-cyan'
                )}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

