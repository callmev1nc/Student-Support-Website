import { prisma } from '@/lib/prisma'
import type { NotificationType } from '@/generated/prisma/enums'

type NotifyInput = {
  userId: string
  title: string
  message: string
  type: NotificationType
  link?: string | null
}

// Fan out notifications to a set of users via createMany. No-op on empty input.
export async function notify(inputs: NotifyInput[]): Promise<void> {
  if (inputs.length === 0) return
  await prisma.notification.createMany({
    data: inputs.map((n) => ({
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.link ?? null,
      userId: n.userId,
    })),
  })
}

// Notify every user with one of the given roles (e.g. all STAFF/ADMIN). Used by
// ticket + crisis creation. Single source for the "find users by role then
// createMany" pattern that was duplicated across actions.
export async function notifyRole(
  roles: Array<'STAFF' | 'ADMIN'>,
  input: Omit<NotifyInput, 'userId'>,
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { role: { in: roles } },
    select: { id: true },
  })
  await notify(users.map((u) => ({ ...input, userId: u.id })))
}
