import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { QnaDetailClient } from './qna-detail-client'

export const dynamic = 'force-dynamic'

export default async function QnaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await requireUser()

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      answers: {
        include: { author: { select: { name: true } } },
        orderBy: [{ isAccepted: 'desc' }, { createdAt: 'asc' }],
      },
    },
  })

  if (!question || question.isHidden) notFound()

  const serialized = {
    id: question.id,
    title: question.title,
    body: question.body,
    authorName: question.isAnonymous ? 'Anonymous' : question.author.name,
    isResolved: question.isResolved,
    createdAt: question.createdAt.toISOString(),
    isOwn: question.author.id === userId,
    answers: question.answers.map((a) => ({
      id: a.id,
      content: a.content,
      authorName: a.isAnonymous ? 'Anonymous' : a.author.name,
      isAccepted: a.isAccepted,
      createdAt: a.createdAt.toISOString(),
    })),
  }

  return <QnaDetailClient question={serialized} canAnswer={!question.isResolved} />
}
