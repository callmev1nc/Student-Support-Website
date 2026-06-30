import { prisma } from '@/lib/prisma'

export type Resource = {
  title: string
  description: string | null
  url: string | null
}

/**
 * Retrieve relevant context from resources + resolved tickets by keyword overlap.
 * Returns top 5 results — no vector DB needed at this scale.
 */
export async function retrieveContext(query: string): Promise<Resource[]> {
  const lower = query.toLowerCase()
  const keywords = lower
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 10)

  if (keywords.length === 0) return []

  const [resources, resolvedTickets] = await Promise.all([
    prisma.resource.findMany({
      select: { title: true, description: true, url: true },
    }),
    prisma.ticket.findMany({
      where: { status: 'RESOLVED' },
      select: { subject: true, description: true },
      take: 50,
    }),
  ])

  const scored: { item: Resource; score: number }[] = []

  for (const r of resources) {
    const text = `${r.title} ${r.description ?? ''}`.toLowerCase()
    const score = keywords.filter((k) => text.includes(k)).length
    if (score > 0) scored.push({ item: r, score })
  }

  for (const t of resolvedTickets) {
    const text = `${t.subject} ${t.description}`.toLowerCase()
    const score = keywords.filter((k) => text.includes(k)).length
    if (score > 0) {
      scored.push({
        item: { title: t.subject, description: t.description.slice(0, 200), url: null },
        score,
      })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 5).map((s) => s.item)
}
