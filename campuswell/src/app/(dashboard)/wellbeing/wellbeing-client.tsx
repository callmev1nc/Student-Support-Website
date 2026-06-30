'use client'

import { useState, useTransition } from "react"
import { Flame, HeartPulse, Loader2, BookOpen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { saveMood, saveJournal, deleteJournal } from "@/app/actions/wellbeing"
import { CRISIS_RESOURCES } from "@/lib/crisis"

const MOODS = [
  { score: 1, emoji: "😞", label: "Very low" },
  { score: 2, emoji: "😕", label: "Low" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😄", label: "Great" },
] as const

type RecentItem = { score: number; dayKey: string; note: string | null }
type JournalItem = {
  id: string
  title: string
  content: string
  mood: number | null
  createdAt: string
  decryptable: boolean
}

function CrisisNote() {
  return (
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
  )
}

export function WellbeingClient({
  todayScore,
  todayNote,
  recent,
  streak,
  journal,
}: {
  todayScore: number | null
  todayNote: string
  recent: RecentItem[]
  streak: number
  journal: JournalItem[]
}) {
  // ── Mood check-in ──
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

  // ── Private journal ──
  const [jTitle, setJTitle] = useState("")
  const [jContent, setJContent] = useState("")
  const [jMood, setJMood] = useState<number | null>(null)
  const [jSaving, setJSaving] = useState(false)
  const [jError, setJError] = useState<string | null>(null)
  const [jCrisis, setJCrisis] = useState(false)
  const [jSaved, setJSaved] = useState(false)

  function submitJournal() {
    if (!jContent.trim()) return
    setJSaving(true)
    setJError(null)
    setJSaved(false)
    const fd = new FormData()
    fd.set("title", jTitle)
    fd.set("content", jContent)
    if (jMood != null) fd.set("mood", String(jMood))
    startTransition(async () => {
      try {
        const res = await saveJournal(fd)
        setJTitle("")
        setJContent("")
        setJMood(null)
        setJSaved(true)
        setJCrisis(res?.crisisHit ?? false)
      } catch (e) {
        setJError(e instanceof Error ? e.message : "Could not save entry.")
      } finally {
        setJSaving(false)
      }
    })
  }

  function removeJournal(id: string) {
    const fd = new FormData()
    fd.set("id", id)
    startTransition(async () => {
      await deleteJournal(fd)
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

      {/* Mood check-in */}
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
        {saved && crisis && <CrisisNote />}
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

      {/* Private journal */}
      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-wsu-red" />
          <h2 className="font-semibold">Private journal</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Encrypted at rest &mdash; only you can read your entries. It&apos;s not a
          medical or crisis service.
        </p>

        <div className="space-y-2">
          <Input
            placeholder="Title (optional)"
            value={jTitle}
            onChange={(e) => {
              setJTitle(e.target.value)
              setJSaved(false)
            }}
            maxLength={200}
          />
          <Textarea
            placeholder="Write a private reflection…"
            value={jContent}
            onChange={(e) => {
              setJContent(e.target.value)
              setJSaved(false)
            }}
            maxLength={20000}
            rows={5}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Mood (optional):</span>
            {MOODS.map((m) => (
              <button
                key={m.score}
                type="button"
                onClick={() => setJMood(jMood === m.score ? null : m.score)}
                className={`rounded-md border px-2 py-1 text-lg ${
                  jMood === m.score ? "border-wsu-red bg-wsu-red/10" : ""
                }`}
                aria-label={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>

          <Button onClick={submitJournal} disabled={!jContent.trim() || jSaving}>
            {jSaving && <Loader2 className="size-4 animate-spin" />}
            Save entry
          </Button>

          {jSaved && !jCrisis && (
            <p className="text-sm text-green-600">Entry saved.</p>
          )}
          {jError && <p className="text-sm text-red-600">{jError}</p>}
          {jSaved && jCrisis && <CrisisNote />}
        </div>

        <div className="space-y-3">
          {journal.length === 0 && (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          )}
          {journal.map((j) => (
            <div key={j.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">
                  {j.decryptable ? j.title || "Untitled" : "Locked entry"}
                </p>
                <button
                  type="button"
                  onClick={() => removeJournal(j.id)}
                  className="text-muted-foreground hover:text-red-600"
                  aria-label="Delete entry"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {j.decryptable ? (
                <p className="mt-1 whitespace-pre-wrap text-sm">{j.content}</p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  This entry could not be decrypted (the encryption key may have
                  changed).
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(j.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        CampusWell is a supportive tool, not a medical or crisis service. It does
        not diagnose or treat any condition. If you need urgent help, use the
        banner at the top or call 000.
      </p>
    </div>
  )
}
