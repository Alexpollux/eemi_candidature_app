'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email("L'adresse email n'est pas valide"),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    setServerError(null)

    // Étape 1 — Connexion via Supabase Auth (crée la session cookie)
    const supabase = createClient()
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      setServerError(
        signInError.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : signInError.message
      )
      return
    }

    // Étape 2 — Récupérer le rôle depuis notre backend
    const token = authData.session.access_token
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password })
    })

    let role = 'CANDIDATE'
    if (res.ok) {
      const payload = await res.json()
      role = payload.user.role
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(payload.user))
    }

    router.push(role === 'ADMIN' ? '/admin' : '/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h2>
        <p className="text-gray-500 text-sm mb-7">Accédez à votre espace candidat</p>

        {serverError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <span className="mt-0.5 text-red-500">⚠</span>
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              {...register('email')}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent ${
                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent ${
                errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg py-2.5 px-4 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B3A5C] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: isSubmitting ? undefined : '#1B3A5C' }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Connexion en cours…
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center">
          <p className="text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link
              href="/register"
              className="font-semibold hover:underline"
              style={{ color: '#1B3A5C' }}
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
