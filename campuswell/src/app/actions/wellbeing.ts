'use server'

import { prisma } from '@/lib/prisma'
import { notifyRole } from '@/lib/notifications'
import { requireUser } from '@/lib/session'
import { detectCrisisKeywords } from '@/lib/crisis'
import { encryptJournal } from '@/lib/journal-crypto'
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

  await notifyRole(['STAFF', 'ADMIN'], {
    title: 'Urgent wellbeing support request',
    message: 'A student requested urgent support via the Crisis Banner.',
    type: 'TICKET',
    link: `/tickets/${ticket.id}`,
  })

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

// Private journal. Title+content are encrypted at rest (AES-256-GCM). The
// optional text is crisis-scanned BEFORE encrypting to surface help (never to
// block); the match itself is never persisted. Encryption runs lazily, so a
// missing JOURNAL_ENCRYPTION_KEY surfaces as a clear error here rather than
// crashing the app.
export async function saveJournal(formData: FormData) {
  const { userId } = await requireUser()

  const title = (formData.get('title') as string | null)?.trim().slice(0, 200) ?? ''
  const content =
    (formData.get('content') as string | null)?.trim().slice(0, 20_000) ?? ''
  if (!content) throw new Error('Please write something before saving.')

  const moodRaw = formData.get('mood')
  const moodNum = moodRaw ? Number(moodRaw) : NaN
  const mood =
    Number.isInteger(moodNum) && moodNum >= 1 && moodNum <= 5 ? moodNum : null

  const crisis = detectCrisisKeywords(`${title} ${content}`)

  const blob = encryptJournal(title, content)
  await prisma.journalEntry.create({
    data: {
      payload: blob.payload,
      iv: blob.iv,
      authTag: blob.authTag,
      mood,
      userId,
    },
  })

  revalidatePath('/wellbeing')
  return { crisisHit: crisis.hit }
}

export async function deleteJournal(formData: FormData) {
  const { userId } = await requireUser()

  const id = formData.get('id') as string
  if (!id) throw new Error('Entry ID is required.')

  const existing = await prisma.journalEntry.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    throw new Error('Entry not found.')
  }

  await prisma.journalEntry.delete({ where: { id } })
  revalidatePath('/wellbeing')
}
