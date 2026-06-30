import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { GroupsClient } from './groups-client'

export const dynamic = 'force-dynamic'

export default async function GroupsPage() {
  const { userId } = await requireUser()

  const [groups, myMemberships] = await Promise.all([
    prisma.studyGroup.findMany({
      include: {
        _count: { select: { memberships: true } },
        owner: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.groupMembership.findMany({
      where: { userId },
      select: { groupId: true },
    }),
  ])

  const memberOf = new Set(myMemberships.map((m) => m.groupId))

  const serialized = groups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    category: g.category,
    meetingInfo: g.meetingInfo,
    maxMembers: g.maxMembers,
    memberCount: g._count.memberships,
    ownerName: g.owner.name,
    isClosed: g.isClosed,
    isMember: memberOf.has(g.id),
    isOwner: g.ownerId === userId,
  }))

  return <GroupsClient groups={serialized} />
}
