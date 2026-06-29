import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { messageStartSchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    const startLimit = rateLimit({ key: `msg:start:${userId}`, limit: 20, windowMs: 60_000 })
    if (!startLimit.ok) {
      return NextResponse.json(
        { error: "You're starting conversations too quickly. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(startLimit.retryAfterMs / 1000)) } },
      )
    }

    const formData = await request.formData()
    const parsed = messageStartSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    const { recipientId, content } = parsed.data

    const [participantAId, participantBId] =
      userId < recipientId ? [userId, recipientId] : [recipientId, userId]

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

    await prisma.message.create({
      data: { content: content.trim(), conversationId: conversation.id, senderId: userId },
    })

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    })

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

    return NextResponse.json({ success: true, conversationId: conversation.id })
  } catch (err) {
    console.error("[api/messages/start] failed:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
