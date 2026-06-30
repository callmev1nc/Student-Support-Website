import { requireRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { ModerationClient } from './moderation-client'

export const dynamic = 'force-dynamic'

export default async function ModerationPage() {
  await requireRole('STAFF', 'ADMIN')

  const [reports, threads, questions] = await Promise.all([
    prisma.moderationReport.findMany({
      include: {
        reporter: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.forumThread.findMany({
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    prisma.question.findMany({
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { answers: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
  ])

  const serializedReports = reports.map((r) => ({
    id: r.id,
    reason: r.reason,
    detail: r.detail,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
    reporterId: r.reporterId,
    reporterName: r.reporter.name,
    targetType: r.targetType,
    targetId: r.targetId,
  }))

  const serializedThreads = threads.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    isHidden: t.isHidden,
    isLocked: t.isLocked,
    isPinned: t.isPinned,
    authorName: t.author.name,
    replyCount: t._count.replies,
    createdAt: t.createdAt.toISOString(),
  }))

  const serializedQuestions = questions.map((q) => ({
    id: q.id,
    title: q.title,
    isHidden: q.isHidden,
    isResolved: q.isResolved,
    authorName: q.author.name,
    answerCount: q._count.answers,
    createdAt: q.createdAt.toISOString(),
  }))

  return (
    <ModerationClient
      reports={serializedReports}
      threads={serializedThreads}
      questions={serializedQuestions}
    />
  )
}
