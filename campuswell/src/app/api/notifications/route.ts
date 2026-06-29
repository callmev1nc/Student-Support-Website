import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ notifications: [] })

    const userId = user.id

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ notifications })
  } catch (err) {
    console.error("[api/notifications] failed:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
