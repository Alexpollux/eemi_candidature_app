import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EEMI — Candidature',
  description: 'Espace candidature EEMI',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Logo / Header */}
      <div className="mb-8 text-center select-none">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-md"
          style={{ backgroundColor: '#1B3A5C' }}
        >
          <span className="text-white text-2xl font-black tracking-tight">E</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1B3A5C' }}>
          EEMI
        </h1>
        <p className="text-gray-400 text-xs mt-0.5 font-medium uppercase tracking-wider">
          École Européenne des Métiers de l'Internet
        </p>
      </div>

      {/* Card */}
      {children}

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} EEMI — Tous droits réservés
      </p>
    </div>
  )
}
