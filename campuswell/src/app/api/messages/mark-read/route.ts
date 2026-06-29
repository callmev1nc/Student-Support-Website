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
    const { conversationId } = await request.json()

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 })
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/messages/mark-read] failed:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
