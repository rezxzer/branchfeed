import { redirect } from 'next/navigation'
import { SearchPageClient } from '@/components/search/SearchPageClient'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    type?: string
    sortBy?: string
    page?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''

  // If no query, redirect to feed
  if (!query.trim()) {
    redirect('/feed')
  }

  return <SearchPageClient query={query} type={params.type || 'all'} sortBy={params.sortBy || 'relevance'} page={parseInt(params.page || '1', 10)} />
}

