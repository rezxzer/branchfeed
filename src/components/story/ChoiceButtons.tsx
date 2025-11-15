'use client'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useSwipe } from '@/hooks/useSwipe'

interface Choice {
  label: 'A' | 'B' | string
  content?: string
}

interface ChoiceButtonsProps {
  choiceA: Choice
  choiceB: Choice
  onChoice: (choice: 'A' | 'B') => void
  disabled?: boolean
  storyTitle?: string
  currentNodeTitle?: string
}

export function ChoiceButtons({
  choiceA,
  choiceB,
  onChoice,
  disabled = false,
  storyTitle,
  currentNodeTitle,
}: ChoiceButtonsProps) {
  const { touchHandlers } = useSwipe({
    onSwipeLeft: () => !disabled && onChoice('B'),
    onSwipeRight: () => !disabled && onChoice('A'),
  }, {
    threshold: 50,
    velocity: 0.3,
  })

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 touch-manipulation"
      {...touchHandlers}
    >
      {/* Choice A */}
      <Button
        variant="primary"
        size="lg"
        onClick={() => onChoice('A')}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`Choose path A${choiceA.content ? `: ${choiceA.content}` : ''}${currentNodeTitle ? ` for ${currentNodeTitle}` : ''}`}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault()
            onChoice('A')
          }
        }}
        className={cn(
          'relative overflow-hidden',
          'bg-gradient-branch text-white',
          'hover:opacity-90 active:scale-[0.95]',
          'shadow-sm hover:shadow-md transition-all ease-bounce-soft',
          'min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center gap-2',
          'text-base sm:text-lg touch-manipulation',
          'focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-gray-900',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className="text-2xl font-bold">
          {choiceA.label || 'A'}
        </span>
        {choiceA.content && (
          <span className="text-sm text-white/90 line-clamp-2">
            {choiceA.content}
          </span>
        )}
      </Button>

      {/* Choice B */}
      <Button
        variant="secondary"
        size="lg"
        onClick={() => onChoice('B')}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`Choose path B${choiceB.content ? `: ${choiceB.content}` : ''}${currentNodeTitle ? ` for ${currentNodeTitle}` : ''}`}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault()
            onChoice('B')
          }
        }}
        className={cn(
          'relative overflow-hidden',
          'bg-gradient-brand text-white',
          'hover:opacity-90 active:scale-[0.95]',
          'shadow-sm hover:shadow-md transition-all ease-bounce-soft',
          'min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center gap-2',
          'text-base sm:text-lg touch-manipulation',
          'focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-gray-900',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className="text-2xl font-bold">
          {choiceB.label || 'B'}
        </span>
        {choiceB.content && (
          <span className="text-sm text-white/90 line-clamp-2">
            {choiceB.content}
          </span>
        )}
      </Button>
    </div>
  )
}

