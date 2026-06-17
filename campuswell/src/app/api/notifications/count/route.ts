import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ count: 0 })
    }

    const userId = (session.user as Record<string, unknown>).id as string
    const count = await prisma.notification.count({
      where: { userId, read: false },
    })

    return NextResponse.json({ count })
  } catch (err) {
    console.error("[api/notifications/count] failed:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
