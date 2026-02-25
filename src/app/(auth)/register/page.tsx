'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Le prénom est requis'),
    lastName: z.string().min(1, 'Le nom est requis'),
    email: z.string().email("L'adresse email n'est pas valide"),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'CANDIDATE'
      })
    })

    if (!res.ok) {
      const body = await res.json()
      if (body.error?.toLowerCase().includes('already registered') || body.error?.toLowerCase().includes('already been registered')) {
        setServerError('Cette adresse email est déjà utilisée.')
      } else {
        setServerError(body.error || 'Une erreur est survenue.')
      }
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: '#EBF1F8' }}
          >
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vérifiez votre boîte mail</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Un e-mail de confirmation vous a été envoyé. Cliquez sur le lien
            pour activer votre compte et accéder à votre espace candidat.
          </p>
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-sm text-gray-500">
              Déjà confirmé ?{' '}
              <Link
                href="/login"
                className="font-semibold hover:underline"
                style={{ color: '#1B3A5C' }}
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h2>
        <p className="text-gray-500 text-sm mb-7">Déposez votre candidature en ligne</p>

        {serverError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <span className="mt-0.5 text-red-500">⚠</span>
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Prénom / Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Prénom
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Prénom"
                {...register('firstName')}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent ${
                  errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.firstName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nom
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Nom"
                {...register('lastName')}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent ${
                  errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.lastName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

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

          {/* Mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Mot de passe{' '}
              <span className="font-normal text-gray-400">(min. 8 caractères)</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
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

          {/* Confirmation */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Confirmation du mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent ${
                errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg py-2.5 px-4 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B3A5C] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: '#1B3A5C' }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Création du compte…
              </span>
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center">
          <p className="text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link
              href="/login"
              className="font-semibold hover:underline"
              style={{ color: '#1B3A5C' }}
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
