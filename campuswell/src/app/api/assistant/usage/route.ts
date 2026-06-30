import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { getUsage } from '@/lib/assistant/usage'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await getUsage(user.id)
    return NextResponse.json(usage)
  } catch (err) {
    console.error('[api/assistant/usage] failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
