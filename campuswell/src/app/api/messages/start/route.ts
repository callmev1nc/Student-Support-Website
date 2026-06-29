import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    const formData = await request.formData()
    const recipientId = formData.get("recipientId") as string
    const content = formData.get("content") as string

    if (!recipientId || !content?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

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
