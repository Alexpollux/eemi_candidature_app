'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileText, Clock, CheckCircle, XCircle, Plus } from 'lucide-react'

type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

interface Application {
  id: string
  program: string
  rhythm: string
  campus: string
  status: ApplicationStatus
  createdAt: string
  cvUrl: string | null
  idDocumentUrl: string | null
}

const statusConfig = {
  PENDING: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  ACCEPTED: {
    label: 'Acceptée',
    icon: CheckCircle,
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  REJECTED: {
    label: 'Refusée',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
}

export default function DashboardPage() {
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApplication() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/applications/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (res.status === 404) {
          setApplication(null)
          return
        }

        if (!res.ok) {
          setError('Erreur lors du chargement de votre candidature.')
          return
        }

        const data = await res.json()
        setApplication(data)
      } catch {
        setError('Erreur réseau.')
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
    router.refresh()
  }

  const status = application ? statusConfig[application.status] : null
  const StatusIcon = status?.icon

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes candidatures</h1>
            <p className="mt-1 text-sm text-gray-500">
              Suivez l&apos;avancement de vos dossiers de candidature
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-red-600 hover:border-red-200"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : application ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          {/* Statut */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Mon dossier</h2>
            {status && StatusIcon && (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${status.className}`}>
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </span>
            )}
          </div>

          {/* Infos candidature */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Programme</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{application.program}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Campus</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{application.campus}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Rythme</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{application.rhythm}</p>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Documents soumis</h3>
            <div className="flex flex-col gap-2">
              <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${application.cvUrl ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <FileText className={`h-4 w-4 ${application.cvUrl ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-700">CV</span>
                {application.cvUrl && (
                  <a href={application.cvUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-blue-600 hover:underline">
                    Voir
                  </a>
                )}
              </div>
              <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${application.idDocumentUrl ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <FileText className={`h-4 w-4 ${application.idDocumentUrl ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-700">Pièce d&apos;identité</span>
                {application.idDocumentUrl && (
                  <a href={application.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-blue-600 hover:underline">
                    Voir
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Date soumission */}
          <p className="text-xs text-gray-400">
            Dossier soumis le{' '}
            {new Date(application.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-4">
            Vous n&apos;avez pas encore déposé de candidature.
          </p>
          <button
            onClick={() => router.push('/apply')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Déposer une candidature
          </button>
        </div>
      )}
    </div>
  )
}