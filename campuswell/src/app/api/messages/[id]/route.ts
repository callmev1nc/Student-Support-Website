import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const userId = user.id

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participantA: { select: { id: true, name: true, role: true } },
        participantB: { select: { id: true, name: true, role: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { id: true, name: true, role: true } } },
        },
      },
    })

    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (conversation.participantAId !== userId && conversation.participantBId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const otherUser =
      conversation.participantAId === userId
        ? conversation.participantB
        : conversation.participantA

    return NextResponse.json({
      id: conversation.id,
      otherUser,
      messages: conversation.messages,
    })
  } catch (err) {
    console.error("[api/messages/[id]] failed:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
