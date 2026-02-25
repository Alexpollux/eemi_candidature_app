import { cn } from '@/lib/utils'

type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'En attente',
    className: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  },
  ACCEPTED: {
    label: 'Accepté',
    className: 'bg-green-100 text-green-800 ring-green-200',
  },
  REJECTED: {
    label: 'Refusé',
    className: 'bg-red-100 text-red-800 ring-red-200',
  },
}

interface BadgeProps {
  status: ApplicationStatus
  className?: string
}

export function Badge({ status, className }: BadgeProps) {
  const { label, className: statusClass } = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        statusClass,
        className
      )}
    >
      {label}
    </span>
  )
}

interface GenericBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

const variantMap: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700 ring-gray-200',
  success: 'bg-green-100 text-green-800 ring-green-200',
  warning: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  error: 'bg-red-100 text-red-800 ring-red-200',
  info: 'bg-blue-100 text-blue-800 ring-blue-200',
}

export function GenericBadge({
  children,
  variant = 'default',
  className,
}: GenericBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
