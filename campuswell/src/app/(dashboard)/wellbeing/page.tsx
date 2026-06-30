import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { WellbeingClient } from './wellbeing-client'
import { decryptJournal } from '@/lib/journal-crypto'

export const dynamic = 'force-dynamic'

export default async function WellbeingPage() {
  const { userId } = await requireUser()

  const now = new Date()
  const dayKey = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  // Last 30 days for the streak + recent view.
  const since = new Date(dayKey.getTime() - 29 * 86_400_000)

  const [today, recent, journalRows] = await Promise.all([
    prisma.moodEntry.findUnique({
      where: { userId_dayKey: { userId, dayKey } },
    }),
    prisma.moodEntry.findMany({
      where: { userId, dayKey: { gte: since } },
      orderBy: { dayKey: 'asc' },
    }),
    prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  // Decrypt journal entries server-side. Resilient: a bad/missing key marks an
  // entry undecryptable instead of crashing the whole page.
  const journal = journalRows.map((j) => {
    try {
      const dec = decryptJournal({ payload: j.payload, iv: j.iv, authTag: j.authTag })
      return {
        id: j.id,
        title: dec.title,
        content: dec.content,
        mood: j.mood,
        createdAt: j.createdAt.toISOString(),
        decryptable: true as const,
      }
    } catch {
      return {
        id: j.id,
        title: '',
        content: '',
        mood: j.mood,
        createdAt: j.createdAt.toISOString(),
        decryptable: false as const,
      }
    }
  })

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
      journal={journal}
    />
  )
}
