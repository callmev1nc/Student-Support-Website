'use client'

import { useState, useTransition } from "react"
import { Flame, HeartPulse, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { saveMood } from "@/app/actions/wellbeing"
import { CRISIS_RESOURCES } from "@/lib/crisis"

const MOODS = [
  { score: 1, emoji: "😞", label: "Very low" },
  { score: 2, emoji: "😕", label: "Low" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😄", label: "Great" },
] as const

type RecentItem = { score: number; dayKey: string; note: string | null }

export function WellbeingClient({
  todayScore,
  todayNote,
  recent,
  streak,
}: {
  todayScore: number | null
  todayNote: string
  recent: RecentItem[]
  streak: number
}) {
  const [score, setScore] = useState<number | null>(todayScore)
  const [note, setNote] = useState(todayNote)
  const [saved, setSaved] = useState(false)
  const [crisis, setCrisis] = useState(false)
  const [pending, startTransition] = useTransition()

  function submit() {
    if (score == null) return
    const fd = new FormData()
    fd.set("score", String(score))
    if (note.trim()) fd.set("note", note)
    startTransition(async () => {
      try {
        const res = await saveMood(fd)
        setSaved(true)
        setCrisis(res?.crisisHit ?? false)
      } catch {
        setSaved(false)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <HeartPulse className="size-6 text-wsu-red" /> Wellbeing
        </h1>
        <p className="text-sm text-muted-foreground">
          Check in with how you&apos;re feeling today. This is for you &mdash; it is
          not a diagnosis.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Today&apos;s check-in</h2>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600">
              <Flame className="size-4" /> {streak}-day streak
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => (
            <button
              key={m.score}
              type="button"
              onClick={() => {
                setScore(m.score)
                setSaved(false)
              }}
              className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors ${
                score === m.score
                  ? "border-wsu-red bg-wsu-red/10"
                  : "hover:bg-accent"
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {m.emoji}
              </span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Optional note (max 500 chars). If you're in crisis, use the banner above or call 000."
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            setSaved(false)
          }}
          maxLength={500}
          rows={3}
        />

        <Button onClick={submit} disabled={score == null || pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {todayScore ? "Update today's check-in" : "Save check-in"}
        </Button>

        {saved && !crisis && (
          <p className="text-sm text-green-600">Saved. Thanks for checking in.</p>
        )}

        {saved && crisis && (
          <div className="space-y-2 rounded-md border border-wsu-red/40 bg-wsu-red/10 p-3">
            <p className="text-sm font-medium text-wsu-red">
              We noticed some of what you wrote. You deserve support &mdash; please
              reach out:
            </p>
            <div className="flex flex-wrap gap-2">
              {CRISIS_RESOURCES.map((r) => (
                <a
                  key={r.name}
                  href={r.href}
                  className="rounded-md border bg-background px-2 py-1 text-xs font-medium hover:bg-accent"
                >
                  {r.name}: {r.phone}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {recent.length > 0 && (
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Last 7 check-ins</h2>
          <div className="flex justify-between gap-1">
            {recent.slice(-7).map((r) => {
              const m = MOODS.find((x) => x.score === r.score)
              return (
                <div
                  key={r.dayKey}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <span className="text-2xl" aria-hidden>
                    {m?.emoji ?? "•"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(r.dayKey).toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        CampusWell is a supportive tool, not a medical or crisis service. It does
        not diagnose or treat any condition. If you need urgent help, use the
        banner at the top or call 000.
      </p>
    </div>
  )
}
