'use client'

import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Upload, X, FileText } from 'lucide-react'

interface FileUploadProps {
  label: string
  accept: string
  multiple?: boolean
  maxSizeMB: number
  files: File[]
  onChange: (files: File[]) => void
  error?: string
  required?: boolean
}

export function FileUpload({
  label,
  accept,
  multiple = false,
  maxSizeMB,
  files,
  onChange,
  error,
  required,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)

  const maxBytes = maxSizeMB * 1024 * 1024

  function validateAndAdd(incoming: FileList | null) {
    if (!incoming) return

    const valid: File[] = []
    for (const file of Array.from(incoming)) {
      if (file.size > maxBytes) {
        setSizeError(
          `"${file.name}" dépasse la taille maximale de ${maxSizeMB} Mo`
        )
        return
      }
      valid.push(file)
    }

    setSizeError(null)

    if (multiple) {
      onChange([...files, ...valid])
    } else {
      onChange(valid.slice(0, 1))
    }
  }

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
      validateAndAdd(e.dataTransfer.files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files, multiple, maxBytes]
  )

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  const displayError = error || sizeError

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

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
          validateAndAdd(e.target.files)
          e.target.value = ''
        }}
      />

      {files.length > 0 && (
        <ul className="mt-1 flex flex-col gap-1">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
            >
              <FileText className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="min-w-0 flex-1 truncate text-gray-700">
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-gray-400">
                {formatSize(file.size)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(i)
                }}
                className="shrink-0 rounded p-0.5 text-gray-400 transition hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {displayError && (
        <p className="text-xs text-red-500">{displayError}</p>
      )}
    </div>
  )
}
