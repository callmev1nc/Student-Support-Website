import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ notifications: [] })

    const userId = (session.user as Record<string, unknown>).id as string

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
