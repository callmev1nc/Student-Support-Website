import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { notifyRole } from '@/lib/notifications'

export const runtime = 'nodejs'

// User-initiated alert to staff — creates a MENTAL_HEALTH HIGH ticket + notification.
export async function POST() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.ticket.create({
      data: {
        subject: 'Wellness alert (via AI assistant)',
        description: 'A student has requested staff support through the AI assistant alert feature.',
        category: 'MENTAL_HEALTH',
        priority: 'HIGH',
        status: 'NEW',
        studentId: user.id,
      },
    })

    await prisma.assistantEscalationLog.create({
      data: {
        userId: user.id,
        trigger: 'STAFF_ALERTED',
      },
    })

    await notifyRole(['STAFF', 'ADMIN'], {
      title: 'Wellness alert from assistant',
      message: 'A student requested staff support. Please check tickets.',
      type: 'ASSISTANT',
      link: '/tickets?filter=mine',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/assistant/alert] failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
