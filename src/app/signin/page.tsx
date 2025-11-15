'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { Header } from '@/components/Header'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const { signIn, isAuthenticated, loading: authLoading } = useAuth()
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/feed')
    }
  }, [isAuthenticated, authLoading, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email) {
      newErrors.email = t('auth.errors.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('auth.errors.invalidEmail')
    }

    if (!password) {
      newErrors.password = t('auth.errors.passwordRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    const result = await signIn(email, password)

    if (result.success) {
      router.push('/feed')
    } else {
      // Map Supabase errors to user-friendly messages
      let errorMessage = t('auth.errors.networkError')
      if (result.error?.message) {
        if (result.error.message.includes('Invalid login credentials')) {
          errorMessage = t('auth.errors.invalidCredentials')
        } else if (result.error.message.includes('Email not confirmed')) {
          errorMessage = t('auth.errors.emailNotConfirmed')
        } else {
          errorMessage = result.error.message
        }
      }
      setErrors({ submit: errorMessage })
    }

    setLoading(false)
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // Don't render form if already authenticated (redirect will happen)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-level-2 border border-gray-700/50 p-8">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">
              {t('auth.signIn.title')}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <Input
                  id="signin-email"
                  type="email"
                  label={t('auth.signIn.email')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors({ ...errors, email: '' })
                  }}
                  error={errors.email}
                  required
                  placeholder="example@email.com"
                />
              </div>

              {/* Password Input */}
              <div>
                <Input
                  id="signin-password"
                  type="password"
                  label={t('auth.signIn.password')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: '' })
                  }}
                  error={errors.password}
                  required
                  placeholder="••••••••"
                />
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div
                  className="text-error text-sm bg-error/10 border border-error/20 rounded-lg p-3"
                  role="alert"
                >
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                isLoading={loading}
              >
                {t('auth.signIn.submit')}
              </Button>
            </form>

            {/* Link to Sign Up */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                {t('auth.signIn.noAccount')}{' '}
                <Link
                  href="/signup"
                  className="text-brand-cyan hover:text-brand-cyan/80 font-medium transition-colors ease-smooth"
                >
                  {t('auth.signIn.signUpLink')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

