'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'

type UserRole = 'CANDIDATE' | 'ADMIN'

interface NavbarProps {
  role: UserRole
  firstName?: string
}

const candidateLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/apply', label: 'Postuler' },
]

const adminLinks = [
  { href: '/admin', label: 'Candidatures' },
]

export function Navbar({ role, firstName }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const links = role === 'ADMIN' ? adminLinks : candidateLinks

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link
            href={role === 'ADMIN' ? '/admin' : '/dashboard'}
            className="flex items-center gap-2"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white"
              style={{ backgroundColor: '#1B3A5C' }}
            >
              E
            </div>
            <span
              className="hidden text-sm font-black tracking-tight sm:inline"
              style={{ color: '#1B3A5C' }}
            >
              EEMI
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {firstName && (
            <span className="hidden text-sm text-gray-600 sm:inline">
              Bonjour, <span className="font-medium text-gray-900">{firstName}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
              'border border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
            )}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition',
        'hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      {children}
    </Link>
  )
}
