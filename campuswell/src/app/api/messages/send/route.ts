import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { messageSendSchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    const sendLimit = rateLimit({ key: `msg:send:${userId}`, limit: 30, windowMs: 60_000 })
    if (!sendLimit.ok) {
      return NextResponse.json(
        { error: "You're sending messages too quickly. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(sendLimit.retryAfterMs / 1000)) } },
      )
    }

    const formData = await request.formData()
    const parsed = messageSendSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    const { conversationId, content } = parsed.data

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
  } catch (err) {
    console.error("[api/messages/send] failed:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
