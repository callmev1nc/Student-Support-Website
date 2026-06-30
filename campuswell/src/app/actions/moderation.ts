'use server'

import { prisma } from '@/lib/prisma'
import { requireUser, requireRole } from '@/lib/session'
import { rateLimit } from '@/lib/rate-limit'
import { notifyRole } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function reportContent(formData: FormData) {
  const { userId } = await requireUser()

  const reportLimit = rateLimit({ key: `report:${userId}`, limit: 5, windowMs: 3_600_000 })
  if (!reportLimit.ok) {
    throw new Error('You are reporting too quickly. Please wait a bit.')
  }

  const targetType = formData.get('targetType') as string
  const targetId = formData.get('targetId') as string
  const reason = (formData.get('reason') as string | null)?.trim()
  const detail = (formData.get('detail') as string | null)?.trim() || null

  if (!targetType || !['THREAD', 'REPLY', 'QUESTION', 'ANSWER', 'GROUP'].includes(targetType)) {
    throw new Error('Invalid target type.')
  }
  if (!targetId) throw new Error('Target ID is required.')
  if (!reason || reason.length < 3) throw new Error('Reason must be at least 3 characters.')

  await prisma.moderationReport.create({
    data: { reason, detail, targetType, targetId, reporterId: userId },
  })

  await notifyRole(['STAFF', 'ADMIN'], {
    title: 'New content report',
    message: `A ${targetType.toLowerCase()} has been reported: "${reason.slice(0, 100)}"`,
    type: 'FORUM',
    link: '/community/moderation',
  })

  revalidatePath('/community/moderation')
}

// STAFF/ADMIN only — toggle visibility/lock/pin on reported content.
export async function moderateContent(formData: FormData) {
  await requireRole('STAFF', 'ADMIN')

  const targetType = formData.get('targetType') as string
  const targetId = formData.get('targetId') as string
  const action = formData.get('action') as string
  const reportId = (formData.get('reportId') as string | null) || undefined

  if (!targetType || !targetId || !action) {
    throw new Error('Missing required fields.')
  }

  const validActions = ['hide', 'unhide', 'lock', 'unlock', 'pin', 'unpin']
  if (!validActions.includes(action)) {
    throw new Error(`Invalid action: ${action}`)
  }

  const updateData: Record<string, unknown> = {}
  if (action === 'hide') updateData.isHidden = true
  if (action === 'unhide') updateData.isHidden = false
  if (action === 'lock' && targetType === 'THREAD') updateData.isLocked = true
  if (action === 'unlock' && targetType === 'THREAD') updateData.isLocked = false
  if (action === 'pin' && targetType === 'THREAD') updateData.isPinned = true
  if (action === 'unpin' && targetType === 'THREAD') updateData.isPinned = false

  if (Object.keys(updateData).length === 0) {
    throw new Error(`Action "${action}" not applicable to target type "${targetType}".`)
  }

  switch (targetType) {
    case 'THREAD':
      await prisma.forumThread.update({ where: { id: targetId }, data: updateData })
      break
    case 'REPLY':
      await prisma.forumReply.update({ where: { id: targetId }, data: updateData })
      break
    case 'QUESTION':
      await prisma.question.update({ where: { id: targetId }, data: updateData })
      break
    case 'ANSWER':
      await prisma.questionAnswer.update({ where: { id: targetId }, data: updateData })
      break
    default:
      throw new Error(`Unsupported target type: ${targetType}`)
  }

  // Optionally resolve a linked report.
  if (reportId) {
    await prisma.moderationReport.update({
      where: { id: reportId },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    })
  }

  revalidatePath('/community/moderation')
  revalidatePath('/community/forums')
  revalidatePath('/community/qna')
}

export async function resolveReport(formData: FormData) {
  await requireRole('STAFF', 'ADMIN')

  const reportId = formData.get('reportId') as string
  if (!reportId) throw new Error('Report ID is required.')

  await prisma.moderationReport.update({
    where: { id: reportId },
    data: { status: 'RESOLVED', resolvedAt: new Date() },
  })

  revalidatePath('/community/moderation')
}

export async function dismissReport(formData: FormData) {
  await requireRole('STAFF', 'ADMIN')

  const reportId = formData.get('reportId') as string
  if (!reportId) throw new Error('Report ID is required.')

  await prisma.moderationReport.update({
    where: { id: reportId },
    data: { status: 'DISMISSED', resolvedAt: new Date() },
  })

  revalidatePath('/community/moderation')
}
