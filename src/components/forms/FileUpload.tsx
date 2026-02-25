'use client'

import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Upload,
  X,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────

export interface UploadedDoc {
  id: string
  fileName: string
  storagePath: string
  fileSize: number
  url?: string
}

interface UploadingFile {
  tempId: string
  fileName: string
  fileSize: number
  progress: number
  error?: string
}

interface FileUploadProps {
  applicationId: string
  documentType: string
  label: string
  accept: string
  multiple?: boolean
  maxSizeMB: number
  required?: boolean
  error?: string
  uploadedDocs: UploadedDoc[]
  onUploadComplete: (doc: UploadedDoc) => void
  onDeleteComplete: (docId: string) => void
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

// ── Component ──────────────────────────────────────────────────────────

export function FileUpload({
  applicationId,
  documentType,
  label,
  accept,
  multiple = false,
  maxSizeMB,
  required,
  error,
  uploadedDocs,
  onUploadComplete,
  onDeleteComplete,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const [localError, setLocalError] = useState<string | null>(null)

  const maxBytes = maxSizeMB * 1024 * 1024

  // ── Upload logic ─────────────────────────────────────────────────

  function uploadFile(file: File) {
    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2)}`

    setUploading((prev) => [
      ...prev,
      { tempId, fileName: file.name, fileSize: file.size, progress: 0 },
    ])

    const token = localStorage.getItem('token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    const endpointMap: Record<string, string> = {
      CV: 'cv',
      IDENTITY: 'identity',
    }

    const endpoint = endpointMap[documentType] || 'cv'

    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100)
        setUploading((prev) =>
          prev.map((u) => (u.tempId === tempId ? { ...u, progress } : u))
        )
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const result = JSON.parse(xhr.responseText)
          onUploadComplete({
            id: tempId,
            fileName: file.name,
            storagePath: result.path,
            fileSize: file.size,
            url: result.url,
          })
        } catch {
          // parse error
        }
        setUploading((prev) => prev.filter((u) => u.tempId !== tempId))
      } else {
        let errMsg = "Erreur lors de l'upload"
        try {
          errMsg = JSON.parse(xhr.responseText)?.error || errMsg
        } catch {
          // ignore
        }
        setUploading((prev) =>
          prev.map((u) =>
            u.tempId === tempId ? { ...u, error: errMsg, progress: 0 } : u
          )
        )
      }
    })

    xhr.addEventListener('error', () => {
      setUploading((prev) =>
        prev.map((u) =>
          u.tempId === tempId ? { ...u, error: 'Erreur réseau', progress: 0 } : u
        )
      )
    })

    xhr.open('POST', `${apiUrl}/api/upload/${endpoint}`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(formData)
  }

  function processFiles(incoming: FileList | null) {
    if (!incoming) return
    setLocalError(null)

    for (const file of Array.from(incoming)) {
      if (file.size > maxBytes) {
        setLocalError(
          `"${file.name}" dépasse la taille maximale de ${maxSizeMB} Mo`
        )
        return
      }
    }

    const filesToUpload = multiple
      ? Array.from(incoming)
      : Array.from(incoming).slice(0, 1)

    for (const file of filesToUpload) {
      uploadFile(file)
    }
  }

  // ── Delete logic ─────────────────────────────────────────────────

  async function handleDelete(docId: string) {
    const token = localStorage.getItem('token')
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/applications/documents/${docId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    if (res.ok) {
      onDeleteComplete(docId)
    }
  }

  function removeUploadingError(tempId: string) {
    setUploading((prev) => prev.filter((u) => u.tempId !== tempId))
  }

  // ── Drag handlers ────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      processFiles(e.dataTransfer.files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applicationId, documentType, multiple, maxBytes]
  )

  // ── Render ───────────────────────────────────────────────────────

  const displayError = error || localError
  const isUploading = uploading.some((u) => !u.error)

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition',
          isDragging
            ? 'border-secondary bg-secondary/5'
            : displayError
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-white hover:border-secondary hover:bg-gray-50'
        )}
      >
        <Upload
          className={cn(
            'h-6 w-6',
            isDragging ? 'text-secondary' : 'text-gray-400'
          )}
        />
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-secondary">
              Cliquez pour choisir
            </span>{' '}
            ou glissez-déposez
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {accept.replace(/\./g, '').toUpperCase()} — {maxSizeMB} Mo max
            {multiple && ' par fichier'}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          processFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* Uploading files with progress */}
      {uploading.length > 0 && (
        <ul className="mt-1 flex flex-col gap-1.5">
          {uploading.map((u) => (
            <li
              key={u.tempId}
              className={cn(
                'rounded-md border px-3 py-2 text-sm',
                u.error
                  ? 'border-red-200 bg-red-50'
                  : 'border-blue-200 bg-blue-50'
              )}
            >
              <div className="flex items-center gap-2">
                {u.error ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                ) : (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-secondary" />
                )}
                <span className="min-w-0 flex-1 truncate text-gray-700">
                  {u.fileName}
                </span>
                <span className="shrink-0 text-xs text-gray-500">
                  {formatSize(u.fileSize)}
                </span>
                {u.error && (
                  <button
                    type="button"
                    onClick={() => removeUploadingError(u.tempId)}
                    className="shrink-0 rounded p-0.5 text-gray-400 transition hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Progress bar */}
              {!u.error && (
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-blue-200">
                  <div
                    className="h-full rounded-full bg-secondary transition-all duration-200"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}

              {u.error && (
                <p className="mt-1 text-xs text-red-500">{u.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Uploaded files */}
      {uploadedDocs.length > 0 && (
        <ul className="mt-1 flex flex-col gap-1">
          {uploadedDocs.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-sm"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              <span className="min-w-0 flex-1 truncate text-gray-700">
                {doc.fileName}
              </span>
              <span className="shrink-0 text-xs text-gray-400">
                {formatSize(doc.fileSize)}
              </span>
              <button
                type="button"
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(doc.id)
                }}
                className="shrink-0 rounded p-0.5 text-gray-400 transition hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {displayError && <p className="text-xs text-red-500">{displayError}</p>}
    </div>
  )
}
