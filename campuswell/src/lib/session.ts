import { auth } from '@/lib/auth'

export async function requireUser() {
  const session = await auth()
  if (!session?.user) {
    const { redirect } = await import('next/navigation')
    redirect('/login')
  }
  const user = session!.user
  return { user, userId: user.id, role: user.role }
}

export async function requireRole(...roles: string[]) {
  const result = await requireUser()
  if (!roles.includes(result.role)) {
    throw new Error('Insufficient permissions')
  }
  return result
}

export async function getSessionUser() {
  const session = await auth()
  return session?.user ?? null
}
