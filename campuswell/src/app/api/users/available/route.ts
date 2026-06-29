import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import type { Role } from "@/generated/prisma/enums"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: userId, role } = user

    const where = role === "STUDENT"
      ? { role: { in: ["STAFF", "ADMIN"] as Role[] } }
      : {}

    const users = await prisma.user.findMany({
      where: { id: { not: userId }, ...where },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ users })
  } catch (err) {
    console.error("[api/users/available] failed:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
