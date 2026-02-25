'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      console.log('token_hash:', token_hash)
      console.log('type:', type)

      if (token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        })

        console.log('verifyOtp data:', data)
        console.log('verifyOtp error:', error)

        if (!error) {
          router.push('/login')
          return
        }

        console.log('Erreur verifyOtp:', error.message)
      }

      router.push('/login')
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Confirmation en cours...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}