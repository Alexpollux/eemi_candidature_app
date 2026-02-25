'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Clock, CheckCircle, XCircle, ChevronDown, FileText, User } from 'lucide-react'

type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  program: string
  campus: string
  rhythm: string
  currentLevel: string
  currentSchool: string
  motivationLetter: string
  discoveryChannel: string
  nationality: string
  dateOfBirth: string
  cvUrl: string | null
  idDocumentUrl: string | null
  status: ApplicationStatus
  createdAt: string
  user: {
    email: string
    firstName: string
    lastName: string
  }
}

const statusConfig = {
  PENDING: { label: 'En attente', icon: Clock, className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  ACCEPTED: { label: 'Acceptée', icon: CheckCircle, className: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { label: 'Refusée', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
}

export default function AdminPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [search, statusFilter])

  async function fetchApplications() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      params.set('limit', '20')

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applications?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!res.ok) return
      const data = await res.json()
      setApplications(data.applications)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(applicationId: string, status: ApplicationStatus) {
    setUpdatingStatus(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applications/${applicationId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!res.ok) return
      const updated = await res.json()

      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: updated.status } : a))
      )
      if (selectedApp?.id === applicationId) {
        setSelectedApp((prev) => prev ? { ...prev, status: updated.status } : null)
      }
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
            <p className="mt-1 text-sm text-gray-500">{total} candidature{total > 1 ? 's' : ''} au total</p>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-red-600 hover:border-red-200"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Liste candidatures */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Filtres */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="ACCEPTED">Acceptées</option>
                <option value="REJECTED">Refusées</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">Chargement...</div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">Aucune candidature trouvée.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Candidat</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Programme</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Campus</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => {
                    const status = statusConfig[app.status]
                    const StatusIcon = status.icon
                    return (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`cursor-pointer transition hover:bg-gray-50 ${selectedApp?.id === app.id ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{app.firstName} {app.lastName}</div>
                          <div className="text-xs text-gray-400">{app.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{app.program}</td>
                        <td className="px-4 py-3 text-gray-600">{app.campus}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Détail candidature */}
        {selectedApp && (
          <div className="w-96 shrink-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5 self-start sticky top-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{selectedApp.firstName} {selectedApp.lastName}</h2>
                <p className="text-xs text-gray-400">{selectedApp.email}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>

            {/* Infos */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Programme</span>
                <span className="text-gray-900 text-right max-w-[200px] text-xs">{selectedApp.program}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Campus</span>
                <span className="text-gray-900">{selectedApp.campus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rythme</span>
                <span className="text-gray-900">{selectedApp.rhythm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Niveau</span>
                <span className="text-gray-900">{selectedApp.currentLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">École</span>
                <span className="text-gray-900 text-right max-w-[200px] text-xs">{selectedApp.currentSchool}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nationalité</span>
                <span className="text-gray-900">{selectedApp.nationality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Téléphone</span>
                <span className="text-gray-900">{selectedApp.phone}</span>
              </div>
            </div>

            {/* Motivation */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Lettre de motivation</p>
              <p className="text-xs text-gray-700 line-clamp-4 bg-gray-50 rounded p-2">{selectedApp.motivationLetter}</p>
            </div>

            {/* Documents */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Documents</p>
              <div className="flex flex-col gap-1.5">
                {selectedApp.cvUrl ? (
                  <a href={selectedApp.cvUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 hover:bg-green-100">
                    <FileText className="h-3.5 w-3.5" />
                    CV — Voir le document
                  </a>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400">
                    <FileText className="h-3.5 w-3.5" />
                    CV non fourni
                  </div>
                )}
                {selectedApp.idDocumentUrl ? (
                  <a href={selectedApp.idDocumentUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 hover:bg-green-100">
                    <User className="h-3.5 w-3.5" />
                    Pièce d&apos;identité — Voir le document
                  </a>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400">
                    <User className="h-3.5 w-3.5" />
                    Pièce d&apos;identité non fournie
                  </div>
                )}
              </div>
            </div>

            {/* Actions statut */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Changer le statut</p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(selectedApp.id, 'ACCEPTED')}
                  disabled={updatingStatus || selectedApp.status === 'ACCEPTED'}
                  className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition"
                >
                  Accepter
                </button>
                <button
                  onClick={() => updateStatus(selectedApp.id, 'REJECTED')}
                  disabled={updatingStatus || selectedApp.status === 'REJECTED'}
                  className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition"
                >
                  Refuser
                </button>
                <button
                  onClick={() => updateStatus(selectedApp.id, 'PENDING')}
                  disabled={updatingStatus || selectedApp.status === 'PENDING'}
                  className="flex-1 rounded-lg bg-yellow-500 px-3 py-2 text-xs font-medium text-white hover:bg-yellow-600 disabled:opacity-50 transition"
                >
                  Attente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}