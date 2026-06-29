import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { CRISIS_RESOURCES } from "@/lib/crisis"

// Returns the canonical crisis contact list so the CrisisBanner (and later the
// journal/mood components) can render help links without hardcoding numbers.
export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json({ resources: CRISIS_RESOURCES })
}
