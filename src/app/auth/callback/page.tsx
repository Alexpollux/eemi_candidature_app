'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // L'utilisateur vient de confirmer son email
        router.push('/login')
      }
    })
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Confirmation en cours...</p>
    </div>
  )
}