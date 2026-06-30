import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { MentorsClient } from './mentors-client'

export const dynamic = 'force-dynamic'

export default async function MentorsPage() {
  const { userId, role } = await requireUser()

  const [staff, matches] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'STAFF' },
      select: { id: true, name: true, bio: true, avatarUrl: true },
      orderBy: { name: 'asc' },
    }),
    prisma.mentorshipMatch.findMany({
      where: {
        OR: [{ mentorId: userId }, { menteeId: userId }],
      },
      include: {
        mentor: { select: { id: true, name: true } },
        mentee: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const serializedStaff = staff.map((s) => ({
    id: s.id,
    name: s.name,
    bio: s.bio,
    avatarUrl: s.avatarUrl,
  }))

  const serializedMatches = matches.map((m) => ({
    id: m.id,
    status: m.status,
    topic: m.topic,
    notes: m.notes,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    mentorId: m.mentorId,
    mentorName: m.mentor.name,
    menteeId: m.menteeId,
    menteeName: m.mentee.name,
  }))

  return (
    <MentorsClient
      staff={serializedStaff}
      matches={serializedMatches}
      userId={userId}
      role={role}
    />
  )
}
