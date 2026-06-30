import { prisma } from '@/lib/prisma'

const HOURLY_CAP = Number(process.env.ASSISTANT_HOURLY_CAP) || 20
const DAILY_CAP = Number(process.env.ASSISTANT_DAILY_CAP) || 80
const DAILY_COST_CAP_USD = Number(process.env.ASSISTANT_DAILY_COST_CAP_USD) || 2

function getWindowStart(hours: number): Date {
  const now = new Date()
  const ms = hours * 60 * 60 * 1000
  return new Date(Math.floor(now.getTime() / ms) * ms)
}

export type UsageResult = {
  ok: true
} | {
  ok: false
  reason: string
}

export async function checkUsage(userId: string): Promise<UsageResult> {
  const hourWindow = getWindowStart(1)
  const dayWindow = getWindowStart(24)

  const [hourly, daily] = await Promise.all([
    prisma.assistantUsage.findUnique({
      where: { userId_windowStart: { userId, windowStart: hourWindow } },
    }),
    prisma.assistantUsage.findUnique({
      where: { userId_windowStart: { userId, windowStart: dayWindow } },
    }),
  ])

  if (hourly && hourly.messageCount >= HOURLY_CAP) {
    return { ok: false, reason: 'You have reached the hourly message limit. Please try again later.' }
  }

  if (daily && daily.messageCount >= DAILY_CAP) {
    return { ok: false, reason: 'You have reached the daily message limit. Please try again tomorrow.' }
  }

  if (daily && daily.estimatedCostUsd >= DAILY_COST_CAP_USD) {
    return { ok: false, reason: 'The assistant is temporarily unavailable. Please try again later.' }
  }

  return { ok: true }
}

export async function incrementUsage(userId: string, costUsd: number): Promise<void> {
  const hourWindow = getWindowStart(1)
  const dayWindow = getWindowStart(24)

  const upsert = async (windowStart: Date) => {
    await prisma.assistantUsage.upsert({
      where: { userId_windowStart: { userId, windowStart } },
      create: { userId, windowStart, messageCount: 1, estimatedCostUsd: costUsd },
      update: {
        messageCount: { increment: 1 },
        estimatedCostUsd: { increment: costUsd },
      },
    })
  }

  await Promise.all([upsert(hourWindow), upsert(dayWindow)])
}

export async function getUsage(userId: string) {
  const dayWindow = getWindowStart(24)

  const usage = await prisma.assistantUsage.findUnique({
    where: { userId_windowStart: { userId, windowStart: dayWindow } },
  })

  return {
    messageCount: usage?.messageCount ?? 0,
    estimatedCostUsd: usage?.estimatedCostUsd ?? 0,
    dailyCap: DAILY_CAP,
    dailyCostCapUsd: DAILY_COST_CAP_USD,
  }
}
