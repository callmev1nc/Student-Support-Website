import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { ForumsClient } from './forums-client'

export const dynamic = 'force-dynamic'

export default async function ForumsPage() {
  await requireUser()

  const threads = await prisma.forumThread.findMany({
    where: { isHidden: false },
    include: {
      author: { select: { name: true } },
      _count: { select: { replies: true } },
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  })

  // authorId is stored but never shipped: anonymous threads show "Anonymous".
  const serialized = threads.map((t) => ({
    id: t.id,
    title: t.title,
    contentPreview: t.content.slice(0, 160),
    category: t.category,
    authorName: t.isAnonymous ? 'Anonymous' : t.author.name,
    replyCount: t._count.replies,
    createdAt: t.createdAt.toISOString(),
    isPinned: t.isPinned,
    isLocked: t.isLocked,
  }))

  return <ForumsClient threads={serialized} />
}
