import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Role } from "@/generated/prisma/enums"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as Record<string, unknown>).id as string
  const role = (session.user as Record<string, unknown>).role as string

  const where = role === "STUDENT"
    ? { role: { in: ["STAFF", "ADMIN"] as Role[] } }
    : {}

  const users = await prisma.user.findMany({
    where: { id: { not: userId }, ...where },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ users })
}
