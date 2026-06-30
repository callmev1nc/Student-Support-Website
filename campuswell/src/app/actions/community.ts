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
