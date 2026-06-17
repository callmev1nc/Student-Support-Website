import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as Record<string, unknown>).id as string
    const formData = await request.formData()
    const name = formData.get("name") as string
    const bio = formData.get("bio") as string
    const avatarUrl = formData.get("avatarUrl") as string

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        bio: bio?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/settings/profile] failed:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
