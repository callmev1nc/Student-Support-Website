import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as Record<string, unknown>).id as string
  const formData = await request.formData()
  const conversationId = formData.get("conversationId") as string
  const content = formData.get("content") as string

  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  })

  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (conversation.participantAId !== userId && conversation.participantBId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const message = await prisma.message.create({
    data: { content: content.trim(), conversationId, senderId: userId },
  })

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  })

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

  return NextResponse.json({ success: true, messageId: message.id })
}
