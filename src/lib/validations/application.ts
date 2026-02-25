import { z } from 'zod'

// ── Étape 1 : Informations personnelles ───────────────────────────────

export const step1Schema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().min(1, "L'email est requis").email('Email invalide'),
  phone: z.string().min(1, 'Le téléphone est requis'),
  dateOfBirth: z.string().min(1, 'La date de naissance est requise'),
  nationality: z.string().min(1, 'La nationalité est requise'),
})

// ── Étape 2 : Formation souhaitée ─────────────────────────────────────

export const step2Schema = z.object({
  program: z.string().min(1, 'Veuillez sélectionner un programme'),
  rhythm: z.string().min(1, 'Veuillez sélectionner un rythme'),
  campus: z.string().min(1, 'Veuillez sélectionner un campus'),
  currentLevel: z.string().min(1, 'Le niveau actuel est requis'),
  currentSchool: z.string().min(1, "L'établissement actuel est requis"),
})

// ── Étape 3 : Motivation ──────────────────────────────────────────────

export const step3Schema = z.object({
  motivationLetter: z
    .string()
    .min(100, 'La lettre de motivation doit contenir au moins 100 caractères'),
  discoveryChannel: z.string().min(1, 'Ce champ est requis'),
})

// ── Schéma global ─────────────────────────────────────────────────────

export const applicationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)

export type ApplicationFormData = z.infer<typeof applicationSchema>

// ── Champs par étape ──────────────────────────────────────────────────

export const stepFields: Record<number, (keyof ApplicationFormData)[]> = {
  1: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'nationality'],
  2: ['program', 'rhythm', 'campus', 'currentLevel', 'currentSchool'],
  3: ['motivationLetter', 'discoveryChannel'],
}

// ── Données statiques ─────────────────────────────────────────────────

export const programOptions = {
  BACHELOR: [
    'Année 1 Chef de projet digitaux',
    'Année 2 Chef de projet digitaux',
    'Année 3 Application Development & Cybersecurity',
    'Année 3 Interactive Design',
    'Année 3 Digital Marketing & Business',
    'Année 3 Management Innovation et Gestion de projets numériques',
  ],
  MASTERES: [
    'Tech Lead & Cybersecurity',
    'Mastère Apps & Cybersecurity',
    'Mastère Architecte Solutions',
    'Mastère Data IA & Business Intelligence',
    'Mastère Marketing & Stratégie',
    'Mastère UX & Product Design',
    'Mastère Direction Artistique',
    'Mastère Strategy & Entrepreneurship Majeure Entrepreneurship & Innovation',
    'Mastère Strategy & Entrepreneurship Majeure International Strategy & Sustainability',
  ],
} as const

export const campusOptions = [
  { value: 'Paris', label: 'Paris' },
  { value: 'Lyon', label: 'Lyon' },
  { value: 'Orléans', label: 'Orléans' },
]

export const currentLevelOptions = [
  { value: 'Bac', label: 'Bac' },
  { value: 'Bac+1', label: 'Bac+1' },
  { value: 'Bac+2', label: 'Bac+2' },
  { value: 'Bac+3', label: 'Bac+3' },
  { value: 'Bac+4', label: 'Bac+4' },
  { value: 'Bac+5 et plus', label: 'Bac+5 et plus' },
]

export const discoveryChannelOptions = [
  { value: 'Presse', label: 'Presse' },
  { value: 'Internet', label: 'Internet' },
  { value: 'Emailing/Courrier postal', label: 'Emailing/Courrier postal' },
  { value: 'Portes Ouvertes', label: 'Portes Ouvertes' },
  { value: 'Salons', label: 'Salons' },
  { value: 'Ancien élève/Étudiant', label: 'Ancien élève/Étudiant' },
  { value: 'Autre', label: 'Autre' },
]