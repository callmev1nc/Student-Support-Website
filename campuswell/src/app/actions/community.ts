'use server'

import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/session'
import { rateLimit } from '@/lib/rate-limit'
import { notify } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// authorId is always stored (for moderation + reply notifications) even on
// anonymous posts; anonymity is enforced at serialization time in the pages.

export async function createForumThread(formData: FormData) {
  const { userId } = await requireUser()

  const threadLimit = rateLimit({ key: `forum:thread:${userId}`, limit: 5, windowMs: 3_600_000 })
  if (!threadLimit.ok) {
    throw new Error('You are posting too quickly. Please wait a few minutes.')
  }

  const title = (formData.get('title') as string | null)?.trim()
  const content = (formData.get('content') as string | null)?.trim()
  const category = (formData.get('category') as string | null)?.trim().slice(0, 50) || 'GENERAL'
  const isAnonymous = formData.get('isAnonymous') === 'true'

  if (!title || title.length < 3) throw new Error('Title must be at least 3 characters.')
  if (!content || content.length < 3) throw new Error('Content must be at least 3 characters.')

  const thread = await prisma.forumThread.create({
    data: { title, content, category, isAnonymous, authorId: userId },
  })

  revalidatePath('/community/forums')
  redirect(`/community/forums/${thread.id}`)
}

export async function createForumReply(formData: FormData) {
  const { userId } = await requireUser()

  const replyLimit = rateLimit({ key: `forum:reply:${userId}`, limit: 20, windowMs: 3_600_000 })
  if (!replyLimit.ok) {
    throw new Error('You are replying too quickly. Please wait a bit.')
  }

  const threadId = formData.get('threadId') as string
  const content = (formData.get('content') as string | null)?.trim()
  const isAnonymous = formData.get('isAnonymous') === 'true'

  if (!threadId) throw new Error('Thread ID is required.')
  if (!content || content.length < 1) throw new Error('Reply cannot be empty.')

  const thread = await prisma.forumThread.findUnique({ where: { id: threadId } })
  if (!thread || thread.isHidden) throw new Error('Thread not found.')
  if (thread.isLocked) throw new Error('This thread is locked.')

  await prisma.forumReply.create({
    data: { content, isAnonymous, threadId, authorId: userId },
  })

  // Notify the thread author of a new reply (skip self-replies).
  if (thread.authorId !== userId) {
    await notify([
      {
        userId: thread.authorId,
        title: 'New reply on your thread',
        message: `Someone replied to "${thread.title}".`,
        type: 'FORUM',
        link: `/community/forums/${threadId}`,
      },
    ])
  }

  revalidatePath(`/community/forums/${threadId}`)
}

// ── Anonymous-first Q&A ────────────────────────────────────────────────────

// Q&A defaults to anonymous: the "showName" checkbox opts in to being named.
export async function askQuestion(formData: FormData) {
  const { userId } = await requireUser()

  const askLimit = rateLimit({ key: `qna:ask:${userId}`, limit: 10, windowMs: 3_600_000 })
  if (!askLimit.ok) throw new Error('You are asking too quickly. Please wait a bit.')

  const title = (formData.get('title') as string | null)?.trim()
  const body = (formData.get('body') as string | null)?.trim()
  const isAnonymous = formData.get('showName') !== 'true'

  if (!title || title.length < 5) throw new Error('Title must be at least 5 characters.')
  if (!body || body.length < 10) throw new Error('Question must be at least 10 characters.')

  const question = await prisma.question.create({
    data: { title, body, isAnonymous, authorId: userId },
  })

  revalidatePath('/community/qna')
  redirect(`/community/qna/${question.id}`)
}

export async function answerQuestion(formData: FormData) {
  const { userId } = await requireUser()

  const ansLimit = rateLimit({ key: `qna:answer:${userId}`, limit: 20, windowMs: 3_600_000 })
  if (!ansLimit.ok) throw new Error('You are answering too quickly. Please wait a bit.')

  const questionId = formData.get('questionId') as string
  const content = (formData.get('content') as string | null)?.trim()
  const isAnonymous = formData.get('showName') !== 'true'

  if (!questionId) throw new Error('Question ID is required.')
  if (!content || content.length < 1) throw new Error('Answer cannot be empty.')

  const question = await prisma.question.findUnique({ where: { id: questionId } })
  if (!question || question.isHidden) throw new Error('Question not found.')
  if (question.isResolved) throw new Error('This question is already resolved.')

  await prisma.questionAnswer.create({
    data: { content, isAnonymous, questionId, authorId: userId },
  })

  revalidatePath(`/community/qna/${questionId}`)
}

// Only the question's author can accept an answer; accepting also resolves it.
export async function acceptAnswer(formData: FormData) {
  const { userId } = await requireUser()

  const answerId = formData.get('answerId') as string
  if (!answerId) throw new Error('Answer ID is required.')

  const answer = await prisma.questionAnswer.findUnique({
    where: { id: answerId },
    include: { question: { select: { id: true, authorId: true } } },
  })
  if (!answer) throw new Error('Answer not found.')
  if (answer.question.authorId !== userId) {
    throw new Error('Only the asker can accept an answer.')
  }

  await prisma.$transaction([
    prisma.questionAnswer.update({ where: { id: answerId }, data: { isAccepted: true } }),
    prisma.question.update({ where: { id: answer.question.id }, data: { isResolved: true } }),
  ])

  revalidatePath(`/community/qna/${answer.question.id}`)
}
