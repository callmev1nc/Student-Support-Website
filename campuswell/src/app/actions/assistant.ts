'use server'

import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function updateAssistantOptIn(formData: FormData) {
  const { userId } = await requireUser()

  const optIn = formData.get('optIn') === 'true'

  await prisma.user.update({
    where: { id: userId },
    data: {
      assistantOptIn: optIn,
      assistantOptInAt: optIn ? new Date() : null,
    },
  })

  revalidatePath('/settings')
  revalidatePath('/assistant')
}
