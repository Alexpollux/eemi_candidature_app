'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, Loader2, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

import {
  applicationSchema,
  stepFields,
  type ApplicationFormData,
  programOptions,
  campusOptions,
  currentLevelOptions,
  discoveryChannelOptions,
} from '@/lib/validations/application'
import { cn } from '@/lib/utils'

import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// ── Constants ──────────────────────────────────────────────────────────

const TOTAL_STEPS = 4

const STEP_LABELS = [
  'Informations personnelles',
  'Formation souhaitée',
  'Motivation',
  'Documents & Récapitulatif',
]

type FileKey = 'cv' | 'identity'

// ── Page Component ─────────────────────────────────────────────────────

export default function ApplyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFiles, setSelectedFiles] = useState<{ cv: File | null; identity: File | null }>({
    cv: null,
    identity: null,
  })
  const [docErrors, setDocErrors] = useState<Partial<Record<FileKey, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appError, setAppError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
      program: '',
      rhythm: '',
      campus: '',
      currentLevel: '',
      currentSchool: '',
      motivationLetter: '',
      discoveryChannel: '',
    },
  })


  // ── Navigation ───────────────────────────────────────────────────

  async function goToNextStep() {
    if (currentStep < 3) {
      const fields = stepFields[currentStep]
      const isValid = await trigger(fields)
      if (isValid) setCurrentStep((s) => s + 1)
      return
    }

    if (currentStep === 3) {
      const fields = stepFields[3]
      const isValid = await trigger(fields)
      if (!isValid) return
      setCurrentStep(4)
      return
    }
  }

  function goToPreviousStep() {
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  // ── Submit final ─────────────────────────────────────────────────

  async function handleFinalSubmit() {
    // Valider que les fichiers sont sélectionnés
    const errors: Partial<Record<FileKey, string>> = {}
    if (!selectedFiles.cv) errors.cv = 'Le CV est requis'
    if (!selectedFiles.identity) errors.identity = 'La pièce d\'identité est requise'
    
    if (Object.keys(errors).length > 0) {
      setDocErrors(errors)
      return
    }

    setIsSubmitting(true)
    setAppError(null)

    try {
      const token = localStorage.getItem('token')
      const formData = getValues()

      // Étape 1 — Créer la candidature
      const resApp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!resApp.ok) {
        const err = await resApp.json()
        setAppError(err.error || 'Erreur lors de la soumission.')
        return
      }

      const application = await resApp.json()

      // Étape 2 — Uploader les fichiers avec le bon nom
      const uploadFile = async (file: File, endpoint: string): Promise<string | null> => {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('firstName', formData.firstName)
        fd.append('lastName', formData.lastName)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/${endpoint}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })

        if (!res.ok) return null
        const data = await res.json()
        return data.url
      }

      const [cvUrl, idDocumentUrl] = await Promise.all([
        selectedFiles.cv ? uploadFile(selectedFiles.cv, 'cv') : null,
        selectedFiles.identity ? uploadFile(selectedFiles.identity, 'identity') : null,
      ])

      // Étape 3 — Mettre à jour la candidature avec les URLs
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/${application.id}/documents`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cvUrl, idDocumentUrl }),
      })

      setSubmitted(true)
      router.push('/dashboard')
    } catch {
      setAppError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────

  const values = getValues()

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg text-center py-16">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Send className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidature envoyée !</h2>
        <p className="text-gray-500">Votre dossier a bien été soumis. Vous pouvez suivre son avancement depuis votre tableau de bord.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <ProgressBar
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        stepLabels={STEP_LABELS}
      />

      <Card>
        <CardHeader>
          <CardTitle>{STEP_LABELS[currentStep - 1]}</CardTitle>
        </CardHeader>

        <CardContent>
          {/* ── Étape 1 : Informations personnelles ───────────── */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label="Prénom"
                  error={errors.firstName?.message}
                  required
                  {...register('firstName')}
                />
                <Input
                  label="Nom"
                  error={errors.lastName?.message}
                  required
                  {...register('lastName')}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  error={errors.phone?.message}
                  required
                  {...register('phone')}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label="Date de naissance"
                  type="date"
                  error={errors.dateOfBirth?.message}
                  required
                  {...register('dateOfBirth')}
                />
                <Input
                  label="Nationalité"
                  error={errors.nationality?.message}
                  required
                  {...register('nationality')}
                />
              </div>
            </div>
          )}

          {/* ── Étape 2 : Formation souhaitée ─────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="program" className="text-sm font-medium text-gray-700">
                  Programme <span className="text-red-500">*</span>
                </label>
                <select
                  id="program"
                  {...register('program')}
                  className={cn(
                    'w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 shadow-sm transition',
                    'focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent appearance-none bg-white',
                    errors.program ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  )}
                  defaultValue=""
                >
                  <option value="" disabled>Sélectionnez un programme</option>
                  <optgroup label="BACHELOR">
                    {programOptions.BACHELOR.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </optgroup>
                  <optgroup label="MASTÈRES">
                    {programOptions.MASTERES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </optgroup>
                </select>
                {errors.program && (
                  <p className="text-xs text-red-500">{errors.program.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700">
                  Rythme <span className="text-red-500">*</span>
                </span>
                <div className="flex gap-6">
                  {['Initial', 'Alternance'].map((r) => (
                    <label key={r} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        value={r}
                        {...register('rhythm')}
                        className="h-4 w-4 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{r}</span>
                    </label>
                  ))}
                </div>
                {errors.rhythm && (
                  <p className="text-xs text-red-500">{errors.rhythm.message}</p>
                )}
              </div>

              <Select
                label="Campus"
                options={campusOptions}
                placeholder="Sélectionnez un campus"
                error={errors.campus?.message}
                required
                {...register('campus')}
              />

              <Select
                label="Niveau d'études actuel"
                options={currentLevelOptions}
                placeholder="Sélectionnez votre niveau"
                error={errors.currentLevel?.message}
                required
                {...register('currentLevel')}
              />

              <Input
                label="Établissement actuel"
                error={errors.currentSchool?.message}
                required
                {...register('currentSchool')}
              />
            </div>
          )}

          {/* ── Étape 3 : Motivation ──────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <Textarea
                label="Pourquoi rejoindre l'EEMI ?"
                rows={6}
                hint="Minimum 100 caractères"
                error={errors.motivationLetter?.message}
                required
                {...register('motivationLetter')}
              />

              <Select
                label="Comment avez-vous connu l'EEMI ?"
                options={discoveryChannelOptions}
                placeholder="Sélectionnez"
                error={errors.discoveryChannel?.message}
                required
                {...register('discoveryChannel')}
              />
            </div>
          )}

          {/* ── Étape 4 : Documents & Récapitulatif ──────────── */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Documents */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">Documents requis</h4>

                {/* CV */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    CV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setSelectedFiles((prev) => ({ ...prev, cv: file }))
                      if (file) setDocErrors((prev) => { const n = { ...prev }; delete n.cv; return n })
                    }}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFiles.cv && (
                    <p className="text-xs text-green-600">✓ {selectedFiles.cv.name}</p>
                  )}
                  {docErrors.cv && <p className="text-xs text-red-500">{docErrors.cv}</p>}
                </div>

                {/* Pièce d'identité */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Carte d&apos;identité ou passeport <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setSelectedFiles((prev) => ({ ...prev, identity: file }))
                      if (file) setDocErrors((prev) => { const n = { ...prev }; delete n.identity; return n })
                    }}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFiles.identity && (
                    <p className="text-xs text-green-600">✓ {selectedFiles.identity.name}</p>
                  )}
                  {docErrors.identity && <p className="text-xs text-red-500">{docErrors.identity}</p>}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Récapitulatif */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">Récapitulatif</h4>

                <RecapSection title="Informations personnelles">
                  <RecapItem label="Nom complet" value={`${values.firstName} ${values.lastName}`} />
                  <RecapItem label="Email" value={values.email} />
                  <RecapItem label="Téléphone" value={values.phone} />
                  <RecapItem label="Date de naissance" value={values.dateOfBirth} />
                  <RecapItem label="Nationalité" value={values.nationality} />
                </RecapSection>

                <RecapSection title="Formation souhaitée">
                  <RecapItem label="Programme" value={values.program} />
                  <RecapItem label="Rythme" value={values.rhythm} />
                  <RecapItem label="Campus" value={values.campus} />
                  <RecapItem label="Niveau actuel" value={values.currentLevel} />
                  <RecapItem label="Établissement" value={values.currentSchool} />
                </RecapSection>

                <RecapSection title="Motivation">
                  <div className="col-span-full">
                    <dt className="text-xs text-gray-500">Lettre de motivation</dt>
                    <dd className="mt-0.5 whitespace-pre-line text-sm text-gray-900">
                      {values.motivationLetter}
                    </dd>
                  </div>
                  <RecapItem label="Découverte EEMI" value={values.discoveryChannel} />
                </RecapSection>
              </div>

              {appError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {appError}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between gap-3">
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={goToPreviousStep}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
          ) : (
            <div />
          )}

          {currentStep < TOTAL_STEPS ? (
            <Button type="button" onClick={goToNextStep}>
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-1.5 h-4 w-4" />
                  Soumettre ma candidature
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

// ── Recap sub-components ───────────────────────────────────────────────

function RecapSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h5>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {children}
      </dl>
    </div>
  )
}

function RecapItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value || '—'}</dd>
    </div>
  )
}