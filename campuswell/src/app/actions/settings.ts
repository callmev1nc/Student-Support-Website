"use server"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function updateProfile(formData: FormData) {
  const { userId } = await requireUser()
  const name = formData.get("name") as string
  const bio = formData.get("bio") as string
  const avatarUrl = formData.get("avatarUrl") as string

  if (!name?.trim()) return { error: "Name is required" }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name.trim(),
      bio: bio?.trim() || null,
      avatarUrl: avatarUrl?.trim() || null,
    },
  })

  revalidatePath("/settings")
  revalidatePath("/")
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const { userId } = await requireUser()
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" }
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: "User not found" }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) return { error: "Current password is incorrect" }

  const passwordHash = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  })

  return { success: true }
}
