import { cn } from '@/lib/utils'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
  className?: string
}

export function ProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
  className,
}: ProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Étape {currentStep} sur {totalSteps}
        </span>
        <span className="text-sm font-medium text-secondary">{percentage}%</span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-secondary transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {stepLabels && stepLabels.length > 0 && (
        <div className="mt-4 flex items-start justify-between">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep

            return (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-offset-1 transition-colors',
                    isCompleted
                      ? 'bg-secondary text-white ring-secondary'
                      : isCurrent
                      ? 'bg-primary text-white ring-primary'
                      : 'bg-white text-gray-400 ring-gray-300'
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    'text-center text-xs leading-tight',
                    isCurrent ? 'font-semibold text-primary' : 'text-gray-500'
                  )}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
