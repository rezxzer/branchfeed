import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 text-xs text-slate-300 sm:text-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <span className="font-semibold text-slate-300">
            BranchFeed
          </span>
          <span className="hidden text-slate-400 sm:inline">
            Interactive branching video stories
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/about"
            className="rounded-md border border-slate-700 px-2 py-1 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-900"
          >
            About
          </Link>
          <Link
            href="/#features"
            className="rounded-md border border-slate-700 px-2 py-1 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-900"
          >
            Features
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-emerald-600/70 bg-emerald-600/10 px-2 py-1 text-xs font-medium text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/20"
          >
            Create account
          </Link>
        </div>
      </div>
    </footer>
  );
}

