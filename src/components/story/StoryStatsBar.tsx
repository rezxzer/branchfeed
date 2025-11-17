'use client'

interface StoryStatsBarProps {
  pathsCount: number
  viewsCount: number
  likesCount: number
}

export function StoryStatsBar({
  pathsCount,
  viewsCount,
  likesCount,
}: StoryStatsBarProps) {
  return (
    <div className="flex items-center flex-wrap gap-3 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-xs sm:text-sm text-slate-200">
      {/* Paths */}
      <div className="flex items-center gap-1.5">
        <span className="text-base" aria-hidden="true">
          🧭
        </span>
        <span className="font-semibold text-slate-50">{pathsCount}</span>
        <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">
          Paths
        </span>
      </div>

      {/* Views */}
      <div className="flex items-center gap-1.5">
        <span className="text-base" aria-hidden="true">
          👁️
        </span>
        <span className="font-semibold text-slate-50">{viewsCount}</span>
        <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">
          Views
        </span>
      </div>

      {/* Likes */}
      <div className="flex items-center gap-1.5">
        <span className="text-base" aria-hidden="true">
          ❤️
        </span>
        <span className="font-semibold text-slate-50">{likesCount}</span>
        <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">
          Likes
        </span>
      </div>
    </div>
  )
}

