"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function sendMessage(formData: FormData) {
  const session = await auth()
  if (!session?.user) return

  const userId = (session.user as Record<string, unknown>).id as string
  const conversationId = formData.get("conversationId") as string
  const content = formData.get("content") as string

  if (!conversationId || !content?.trim()) return

  // Verify user is part of conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  })

  if (!conversation) return
  if (conversation.participantAId !== userId && conversation.participantBId !== userId) return

  await prisma.message.create({
    data: {
      content: content.trim(),
      conversationId,
      senderId: userId,
    },
  })

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  })

  // Create notification for recipient
  const recipientId =
    conversation.participantAId === userId
      ? conversation.participantBId
      : conversation.participantAId

  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  })

  await prisma.notification.create({
    data: {
      title: "New Message",
      message: `${sender?.name ?? "Someone"} sent you a message`,
      type: "MESSAGE",
      userId: recipientId,
      link: `/messages/${conversationId}`,
    },
  })

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath("/messages")
}

export async function markMessagesAsRead(conversationId: string) {
  const session = await auth()
  if (!session?.user) return

  const userId = (session.user as Record<string, unknown>).id as string

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  })

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath("/messages")
}

export async function startConversation(formData: FormData) {
  const session = await auth()
  if (!session?.user) return redirect("/messages")

  const userId = (session.user as Record<string, unknown>).id as string
  const recipientId = formData.get("recipientId") as string
  const content = formData.get("content") as string

  if (!recipientId || !content?.trim()) return redirect("/messages")

  // Ensure consistent ordering: smaller ID first
  const [participantAId, participantBId] =
    userId < recipientId ? [userId, recipientId] : [recipientId, userId]

  // Find or create conversation
  let conversation = await prisma.conversation.findUnique({
    where: {
      participantAId_participantBId: { participantAId, participantBId },
    },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { participantAId, participantBId },
    })
  }

  // Send first message
  await prisma.message.create({
    data: {
      content: content.trim(),
      conversationId: conversation.id,
      senderId: userId,
    },
  })

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  })

  // Notify recipient
  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  })

  await prisma.notification.create({
    data: {
      title: "New Message",
      message: `${sender?.name ?? "Someone"} started a conversation with you`,
      type: "MESSAGE",
      userId: recipientId,
      link: `/messages/${conversation.id}`,
    },
  })

  redirect(`/messages/${conversation.id}`)
}
