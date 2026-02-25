'use client'

export const dynamic = 'force-dynamic'

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

      console.log('=== CALLBACK DEBUG ===')
      console.log('token_hash:', token_hash)
      console.log('type:', type)

      if (token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        })

        console.log('data:', JSON.stringify(data))
        console.log('error:', JSON.stringify(error))

        if (!error) {
          console.log('Success - redirecting to /login')
          router.push('/login')
          return
        }

        console.log('Error - redirecting to /login anyway')
      } else {
        console.log('No token_hash or type found')
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