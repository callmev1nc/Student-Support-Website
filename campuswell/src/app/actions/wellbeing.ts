'use server'

import { prisma } from '@/lib/prisma'
import type { Role } from '@/generated/prisma/enums'
import { requireUser } from '@/lib/session'
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
