// Crisis keyword detection + the canonical crisis resource list (Australia).
//
// IMPORTANT: detection only ever SURFACES help. It never blocks or rejects
// user input, is never used as a diagnosis, and matched keywords are never
// persisted. Treat this as a defence-in-depth aid alongside the always-visible
// CrisisBanner. Review the keyword list + copy with a counselling/wellbeing
// stakeholder before launch.

export type CrisisResource = {
  name: string
  phone: string
  href: string
  description: string
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: "Emergency services",
    phone: "000",
    href: "tel:000",
    description: "Call if you or someone else is in immediate danger.",
  },
  {
    name: "Lifeline",
    phone: "13 11 14",
    href: "tel:131114",
    description: "24/7 crisis support and suicide prevention.",
  },
  {
    name: "Beyond Blue",
    phone: "1300 22 4636",
    href: "tel:1300224636",
    description: "Mental health support and information.",
  },
  {
    name: "Kids Helpline",
    phone: "1800 55 1800",
    href: "tel:1800551800",
    description: "For young people aged 5 to 25.",
  },
]

// Curated, case-insensitive substring cues. Intentionally broad - we favour
// surfacing help over precision. Returns the matched cues for UX/logging.
const CRISIS_CUES = [
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "end it all",
  "self-harm",
  "self harm",
  "cutting myself",
  "overdose",
  "take my life",
  "don't want to live",
  "dont want to live",
  "can't go on",
  "cant go on",
  "no reason to live",
  "better off dead",
  "hopeless",
  "want to die",
]

export type CrisisDetection = { hit: boolean; matched: string[] }

export function detectCrisisKeywords(
  text: string | null | undefined,
): CrisisDetection {
  if (!text) return { hit: false, matched: [] }
  const lower = text.toLowerCase()
  const matched = CRISIS_CUES.filter((cue) => lower.includes(cue))
  return { hit: matched.length > 0, matched }
}
