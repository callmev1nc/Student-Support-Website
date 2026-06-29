import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { passwordChangeSchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = sessionUser.id

    const pwdLimit = rateLimit({ key: `pwd:${userId}`, limit: 5, windowMs: 15 * 60_000 })
    if (!pwdLimit.ok) {
      return NextResponse.json(
        { error: "Too many password changes. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(pwdLimit.retryAfterMs / 1000)) } },
      )
    }

    const formData = await request.formData()
    const parsed = passwordChangeSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    const { currentPassword, newPassword } = parsed.data

    const dbUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/settings/password] failed:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
