import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About | BranchFeed',
  description:
    'Learn what BranchFeed is, how interactive branching stories work, and how the platform was built.',
  openGraph: {
    type: 'website',
    title: 'About | BranchFeed',
    description: 'Learn what BranchFeed is, how interactive branching stories work, and how the platform was built.',
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'BranchFeed – About',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | BranchFeed',
    description: 'Learn what BranchFeed is, how interactive branching stories work, and how the platform was built.',
    images: [siteConfig.ogImage],
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 text-slate-100">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
          About BranchFeed
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Interactive branching stories, built for modern creators
        </h1>
        <p className="text-sm text-slate-400 sm:text-base">
          BranchFeed is an experimental platform for creating and exploring
          interactive video stories with A/B choices. Each story is built as a
          branching path, so viewers can shape the narrative by choosing the
          next step.
        </p>
      </section>

      <section className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 sm:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-50">
            What you can do
          </h2>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• Browse a feed of branching video stories</li>
            <li>• Follow different paths and see alternative outcomes</li>
            <li>• Create your own stories with multiple branches</li>
            <li>• Track views, paths and engagement</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-50">
            How it is built
          </h2>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• Next.js 15 (App Router) with TypeScript</li>
            <li>• Supabase for database, auth and storage</li>
            <li>• Tailwind CSS for the UI design system</li>
            <li>• Deployed on Vercel</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <h2 className="text-lg font-semibold text-slate-50">
          Get started
        </h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/signup"
            className="rounded-xl border border-emerald-500/70 bg-emerald-500/10 px-4 py-2 font-medium text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/20"
          >
            Create your account
          </Link>
          <Link
            href="/signin"
            className="rounded-xl border border-slate-600 px-4 py-2 font-medium text-slate-200 hover:border-slate-400 hover:bg-slate-900"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="space-y-3 text-sm text-slate-400">
        <h2 className="text-base font-semibold text-slate-50">
          About the creator
        </h2>
        <p>
          BranchFeed is a personal learning project focused on modern web development,
          product thinking and interactive storytelling. The goal is to explore how creators
          can build richer stories on the web, not just static timelines.
        </p>
      </section>
    </main>
  );
}

