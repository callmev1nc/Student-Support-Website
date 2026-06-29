import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ count: 0 })
    }

    const userId = user.id
    const count = await prisma.notification.count({
      where: { userId, read: false },
    })

    return NextResponse.json({ count })
  } catch (err) {
    console.error("[api/notifications/count] failed:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
