"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { Role } from "@/generated/prisma/enums"

export type RegisterState = {
  error?: string
  success?: string
} | null

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const role = formData.get("role") as string

  // --- Validation ---
  if (!name || name.trim().length < 2) {
    return { error: "Name must be at least 2 characters long." }
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." }
  }

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  if (!role || !["STUDENT", "STAFF"].includes(role)) {
    return { error: "Please select a valid role." }
  }

  // --- Check email uniqueness ---
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (existingUser) {
    return { error: "An account with this email already exists." }
  }

  // --- Hash password and create user ---
  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: role as Role,
    },
  })

  revalidatePath("/login")
  redirect("/login?registered=true")
}
