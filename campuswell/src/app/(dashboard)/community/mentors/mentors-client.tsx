'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  requestMentorship,
  respondToMentorship,
  endMentorship,
} from '@/app/actions/community'
import { Loader2, UserCheck, UserPlus, Check, X, Ban } from 'lucide-react'

type StaffUser = {
  id: string
  name: string
  bio: string | null
  avatarUrl: string | null
}

type Match = {
  id: string
  status: string
  topic: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  mentorId: string
  mentorName: string
  menteeId: string
  menteeName: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function MentorsClient({
  staff,
  matches,
  userId,
  role,
}: {
  staff: StaffUser[]
  matches: Match[]
  userId: string
  role: string
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function act(fn: (fd: FormData) => Promise<void>, formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await fn(formData)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  function request(mentorId: string) {
    const fd = new FormData()
    fd.set('mentorId', mentorId)
    act(requestMentorship, fd)
  }

  function respond(matchId: string, decision: string) {
    const fd = new FormData()
    fd.set('matchId', matchId)
    fd.set('decision', decision)
    act(respondToMentorship, fd)
  }

  function end(matchId: string) {
    const fd = new FormData()
    fd.set('matchId', matchId)
    act(endMentorship, fd)
  }

  const activeMatches = matches.filter((m) => m.status === 'ACCEPTED')
  const outgoingPending = matches.filter(
    (m) => m.status === 'PENDING' && m.menteeId === userId
  )
  const incomingPending = matches.filter(
    (m) => m.status === 'PENDING' && m.mentorId === userId
  )

  const matchedStaffIds = new Set(
    activeMatches
      .filter((m) => m.mentorId !== userId)
      .map((m) => m.mentorId)
  )
  const pendingStaffIds = new Set(outgoingPending.map((m) => m.mentorId))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mentorship</h1>
        <p className="text-sm text-muted-foreground">
          Connect with staff mentors for guidance and support.
        </p>
      </div>

      {/* Active mentorships */}
      {activeMatches.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Your mentorships</h2>
          {activeMatches.map((m) => {
            const isMentor = m.mentorId === userId
            const partnerName = isMentor ? m.menteeName : m.mentorName
            return (
              <Card key={m.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(partnerName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{partnerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {isMentor ? 'Your mentee' : 'Your mentor'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => end(m.id)}
                    disabled={pending}
                  >
                    <Ban className="size-4" /> End
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Incoming requests (staff only) */}
      {role === 'STAFF' && incomingPending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Incoming requests</h2>
          {incomingPending.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(m.menteeName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{m.menteeName}</p>
                    <p className="text-xs text-muted-foreground">
                      Wants you as a mentor
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => respond(m.id, 'ACCEPTED')}
                    disabled={pending}
                  >
                    <Check className="size-4" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respond(m.id, 'DECLINED')}
                    disabled={pending}
                  >
                    <X className="size-4" /> Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Outgoing pending */}
      {outgoingPending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pending requests</h2>
          {outgoingPending.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center gap-3 py-4">
                <Avatar>
                  <AvatarFallback>{getInitials(m.mentorName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{m.mentorName}</p>
                  <p className="text-xs text-muted-foreground">
                    Request pending &middot; waiting for response
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Available mentors (staff) */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Available mentors</h2>
        {staff.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCheck className="size-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No mentors available.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {staff.map((s) => {
              const isMatched = matchedStaffIds.has(s.id)
              const isPending = pendingStaffIds.has(s.id)
              return (
                <Card key={s.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(s.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        {s.bio && (
                          <p className="text-sm text-muted-foreground">{s.bio}</p>
                        )}
                      </div>
                    </div>
                    {isMatched ? (
                      <span className="text-xs font-medium text-green-600">
                        Active mentor
                      </span>
                    ) : isPending ? (
                      <span className="text-xs font-medium text-muted-foreground">
                        Requested
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => request(s.id)}
                        disabled={pending}
                      >
                        <UserPlus className="size-4" /> Request
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
