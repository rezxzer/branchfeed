'use client'

import { useTranslation } from '@/hooks/useTranslation'

interface PathProgressProps {
  currentStep: number
  maxSteps: number
  path: ('A' | 'B')[]
}

export function PathProgress({
  currentStep,
  maxSteps,
  path,
}: PathProgressProps) {
  const { t } = useTranslation()
  const progress = (currentStep / maxSteps) * 100

  const pathString = path.length > 0 ? path.join(' → ') : 'Start'

  return (
    <div 
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-gray-700/50"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={maxSteps}
      aria-label={`Story progress: Step ${currentStep} of ${maxSteps}, Path: ${pathString}`}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="text-xs sm:text-sm font-medium text-gray-300">
          {t('story.progress.step') || 'Step {current} of {max}'
            .replace('{current}', currentStep.toString())
            .replace('{max}', maxSteps.toString())}
        </span>
        <span className="text-xs sm:text-sm font-medium text-gray-400">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-brand transition-all ease-smooth"
          style={{ width: `${Math.min(progress, 100)}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Path Display */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <span>{t('story.progress.path') || 'Path'}:</span>
        <div className="flex items-center gap-1" aria-label={`Current path: ${pathString}`}>
          {path.length > 0 ? (
            path.map((choice, index) => (
              <span key={index} className="font-semibold text-brand-cyan">
                {choice}
                {index < path.length - 1 && (
                  <span className="text-gray-500 mx-1" aria-hidden="true">→</span>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-500">Start</span>
          )}
        </div>
      </div>
    </div>
  )
}

