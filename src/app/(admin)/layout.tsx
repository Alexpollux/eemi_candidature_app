import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'

export const metadata: Metadata = {
  title: 'EEMI — Administration',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar role="ADMIN" />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}