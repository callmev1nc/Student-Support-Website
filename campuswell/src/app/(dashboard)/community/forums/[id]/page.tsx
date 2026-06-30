import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ThreadClient } from './thread-client'

export const dynamic = 'force-dynamic'

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireUser()

  const thread = await prisma.forumThread.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      replies: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!thread || thread.isHidden) notFound()

  // Anonymity is enforced here: anonymous rows ship "Anonymous", never the
  // real author. authorId stays in the DB for notifications/moderation only.
  const serialized = {
    id: thread.id,
    title: thread.title,
    content: thread.content,
    category: thread.category,
    authorName: thread.isAnonymous ? 'Anonymous' : thread.author.name,
    createdAt: thread.createdAt.toISOString(),
    isLocked: thread.isLocked,
    replies: thread.replies.map((r) => ({
      id: r.id,
      content: r.content,
      authorName: r.isAnonymous ? 'Anonymous' : r.author.name,
      createdAt: r.createdAt.toISOString(),
    })),
  }

  return <ThreadClient thread={serialized} canReply={!thread.isLocked} />
}
