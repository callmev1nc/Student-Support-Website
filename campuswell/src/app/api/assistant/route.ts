import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { retrieveContext } from '@/lib/assistant/retrieval'
import { buildSystemPrompt } from '@/lib/assistant/prompt'
import { detectCrisisKeywords, CRISIS_RESOURCES } from '@/lib/assistant/safety'
import { checkUsage, incrementUsage } from '@/lib/assistant/usage'
import { assistantModel } from '@/lib/assistant/client'
import { streamText } from 'ai'

export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/assistant — Stream a Groq response via Vercel AI SDK
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { assistantOptIn: true },
    })

    if (!dbUser?.assistantOptIn) {
      return NextResponse.json(
        { error: 'AI assistant is not enabled. Enable it in your settings.' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const message = (body.message as string | undefined)?.trim()

    if (!message || message.length < 2) {
      return NextResponse.json({ error: 'Message must be at least 2 characters.' }, { status: 400 })
    }

    // ── Crisis screen FIRST (before any model call) ──────────────────────
    const crisis = detectCrisisKeywords(message)
    if (crisis.hit) {
      await prisma.assistantEscalationLog.create({
        data: {
          userId: user.id,
          trigger: 'CRISIS_KEYWORD',
          detectedKeywords: crisis.matched.join(', '),
        },
      })

      return NextResponse.json({
        crisis: true,
        resources: CRISIS_RESOURCES,
        message:
          "I notice you might be going through a difficult time. Please reach out to one of these crisis services — they're here to help, 24/7.",
      })
    }

    // ── Usage / budget check ─────────────────────────────────────────────
    const usageCheck = await checkUsage(user.id)
    if (!usageCheck.ok) {
      return NextResponse.json({ error: usageCheck.reason, usageLimited: true }, { status: 429 })
    }

    // ── Retrieval ─────────────────────────────────────────────────────────
    const resources = await retrieveContext(message)
    const systemPrompt = buildSystemPrompt(resources)

    // ── Stream via Vercel AI SDK ──────────────────────────────────────────
    const result = streamText({
      model: assistantModel(),
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
      maxOutputTokens: 1024,
      onFinish: async () => {
        await incrementUsage(user.id, 0)
      },
    })

    return result.toTextStreamResponse({
      headers: { 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    })
  } catch (err) {
    console.error('[api/assistant] failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
