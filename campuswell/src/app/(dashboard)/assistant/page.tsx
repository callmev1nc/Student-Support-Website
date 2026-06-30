import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { AssistantPageClient } from './assistant-page-client'

export const dynamic = 'force-dynamic'

export default async function AssistantPage() {
  const { userId } = await requireUser()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { assistantOptIn: true, name: true },
  })

  return (
    <AssistantPageClient
      assistantOptIn={user?.assistantOptIn ?? false}
      userName={user?.name ?? 'User'}
    />
  )
}
