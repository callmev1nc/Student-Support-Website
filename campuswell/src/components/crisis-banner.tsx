"use client"

import { useState, useTransition } from "react"
import { LifeBuoy, Loader2, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createCrisisTicket } from "@/app/actions/wellbeing"
import { CRISIS_RESOURCES } from "@/lib/crisis"

// Always-visible safety surface shown on every authenticated dashboard page.
// Expandable help panel with hotlines + a one-tap "request urgent support"
// that creates a HIGH-priority MENTAL_HEALTH ticket and alerts staff.
export function CrisisBanner() {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  function requestSupport() {
    startTransition(async () => {
      try {
        await createCrisisTicket()
        setDone(true)
      } catch {
        // Keep the hotlines visible regardless; never let a request failure
        // remove the help options above.
        setDone(false)
      }
    })
  }

  return (
    <div className="border-b border-wsu-red/30 bg-wsu-red/10 px-4 py-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-wsu-red">
          If you or someone else is in danger, call 000 now.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="border-wsu-red text-wsu-red hover:bg-wsu-red/10"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <LifeBuoy className="size-4" /> Get help now
        </Button>
      </div>

      {open && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {CRISIS_RESOURCES.map((r) => (
            <a
              key={r.name}
              href={r.href}
              className="flex items-start gap-2 rounded-md border bg-background p-3 hover:bg-accent"
            >
              <Phone className="mt-0.5 size-4 shrink-0 text-wsu-red" />
              <div>
                <p className="font-medium">
                  {r.name} &mdash; {r.phone}
                </p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
            </a>
          ))}

          <div className="rounded-md border bg-background p-3 sm:col-span-2">
            <p className="text-xs text-muted-foreground">
              CampusWell is a supportive tool, not a medical or crisis service.
              It does not diagnose or treat any condition.
            </p>
            {done ? (
              <p className="mt-2 text-sm font-medium text-green-600">
                Support requested &mdash; a staff member will reach out. If you
                are in immediate danger, call 000.
              </p>
            ) : (
              <Button
                size="sm"
                className="mt-2 bg-wsu-red text-white hover:bg-wsu-red/90"
                onClick={requestSupport}
                disabled={pending}
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                Request urgent support from staff
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
