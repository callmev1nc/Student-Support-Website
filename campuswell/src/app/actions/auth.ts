"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { Role } from "@/generated/prisma/enums"
import { registerSchema } from "@/lib/validation"

export type RegisterState = {
  error?: string
  success?: string
} | null

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }
  const { name, email, password, role } = parsed.data

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
