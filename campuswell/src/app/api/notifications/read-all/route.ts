import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/notifications/read-all] failed:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
