import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { WellbeingClient } from './wellbeing-client'

export const dynamic = 'force-dynamic'

export default async function WellbeingPage() {
  const { userId } = await requireUser()

  const now = new Date()
  const dayKey = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  // Last 30 days for the streak + recent view.
  const since = new Date(dayKey.getTime() - 29 * 86_400_000)

  const [today, recent] = await Promise.all([
    prisma.moodEntry.findUnique({
      where: { userId_dayKey: { userId, dayKey } },
    }),
    prisma.moodEntry.findMany({
      where: { userId, dayKey: { gte: since } },
      orderBy: { dayKey: 'asc' },
    }),
  ])

  // Consecutive-day streak ending today.
  const daySet = new Set(recent.map((m) => m.dayKey.getTime()))
  let streak = 0
  let cursor = dayKey.getTime()
  while (daySet.has(cursor)) {
    streak += 1
    cursor -= 86_400_000
  }

  return (
    <WellbeingClient
      todayScore={today?.score ?? null}
      todayNote={today?.note ?? ''}
      recent={recent.map((m) => ({
        score: m.score,
        dayKey: m.dayKey.toISOString(),
        note: m.note,
      }))}
      streak={streak}
    />
  )
}
