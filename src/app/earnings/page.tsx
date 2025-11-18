import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { EarningsDashboard } from '@/components/earnings/EarningsDashboard'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function EarningsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return <EarningsDashboard />
}

