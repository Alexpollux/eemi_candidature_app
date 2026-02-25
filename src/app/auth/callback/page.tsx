'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      const params = new URLSearchParams(window.location.search)
      const token_hash = params.get('token_hash')
      const type = params.get('type')

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
          router.push('/login')
          return
        }
      }

      router.push('/login')
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Confirmation en cours...</p>
    </div>
  )
}