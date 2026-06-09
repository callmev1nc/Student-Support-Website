"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function markAllAsRead() {
  const session = await auth()
  if (!session?.user) return

  const userId = (session.user as Record<string, unknown>).id as string

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })

  revalidatePath("/")
}

export async function markAsRead(notificationId: string) {
  const session = await auth()
  if (!session?.user) return

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })

  revalidatePath("/")
}
