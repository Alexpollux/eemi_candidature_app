import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'

export const metadata: Metadata = {
  title: 'EEMI — Mes candidatures',
}

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar role="CANDIDATE" />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}