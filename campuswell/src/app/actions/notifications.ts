"use server"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function markAllAsRead() {
  const { userId } = await requireUser()

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })

  revalidatePath("/")
}

export async function markAsRead(notificationId: string) {
  const { userId } = await requireUser()

  await prisma.notification.update({
    where: { id: notificationId, userId },
    data: { read: true },
  })

  revalidatePath("/")
}
