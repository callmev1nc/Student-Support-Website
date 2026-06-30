import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { QnaClient } from './qna-client'

export const dynamic = 'force-dynamic'

export default async function QnaPage() {
  await requireUser()

  const questions = await prisma.question.findMany({
    where: { isHidden: false },
    include: {
      author: { select: { name: true } },
      _count: { select: { answers: true } },
    },
    orderBy: [{ isResolved: 'asc' }, { createdAt: 'desc' }],
    take: 100,
  })

  const serialized = questions.map((q) => ({
    id: q.id,
    title: q.title,
    bodyPreview: q.body.slice(0, 160),
    authorName: q.isAnonymous ? 'Anonymous' : q.author.name,
    answerCount: q._count.answers,
    isResolved: q.isResolved,
    createdAt: q.createdAt.toISOString(),
  }))

  return <QnaClient questions={serialized} />
}
