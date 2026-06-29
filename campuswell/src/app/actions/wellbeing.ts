'use server'

import { prisma } from '@/lib/prisma'
import type { Role } from '@/generated/prisma/enums'
import { requireUser } from '@/lib/session'
import { detectCrisisKeywords } from '@/lib/crisis'
import { revalidatePath } from 'next/cache'

// Student-initiated request for urgent wellbeing support, triggered from the
// CrisisBanner. Creates a HIGH-priority MENTAL_HEALTH ticket - WITHOUT copying
// in any free-text, to protect privacy - and notifies all STAFF/ADMIN via the
// existing Notification pipeline (mirrors createTicket's admin-notification
// block). Staff see it in their normal ticket queue; no new UI required.
export async function createCrisisTicket() {
  const { userId } = await requireUser()

  const ticket = await prisma.ticket.create({
    data: {
      subject: 'Wellbeing support request',
      description:
        'A student requested urgent wellbeing support via the Crisis Banner. Please reach out to them promptly.',
      category: 'MENTAL_HEALTH',
      priority: 'HIGH',
      status: 'NEW',
      studentId: userId,
    },
  })

  const staff = await prisma.user.findMany({
    where: { role: { in: ['STAFF', 'ADMIN'] as Role[] } },
    select: { id: true },
  })

  if (staff.length > 0) {
    await prisma.notification.createMany({
      data: staff.map((s: { id: string }) => ({
        title: 'Urgent wellbeing support request',
        message: 'A student requested urgent support via the Crisis Banner.',
        type: 'TICKET',
        link: `/tickets/${ticket.id}`,
        userId: s.id,
      })),
    })
  }

  revalidatePath('/tickets')
  return { ticketId: ticket.id }
}

// Daily mood check-in. One entry per user per UTC day (upsert on dayKey).
// The optional note is crisis-scanned to SURFACE help (never to block); the
// flag is returned to the client so it can show support resources. Insights are
// descriptive only - never a diagnosis.
export async function saveMood(formData: FormData) {
  const { userId } = await requireUser()

  const score = Number(formData.get('score'))
  const note =
    (formData.get('note') as string | null)?.trim().slice(0, 500) || null

  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error('Please choose a mood between 1 and 5.')
  }

  const crisis = detectCrisisKeywords(note)

  const now = new Date()
  const dayKey = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )

  await prisma.moodEntry.upsert({
    where: { userId_dayKey: { userId, dayKey } },
    create: { score, note, dayKey, userId },
    update: { score, note },
  })

  revalidatePath('/wellbeing')
  return { crisisHit: crisis.hit }
}
