'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
} from '@/app/actions/community'
import { Plus, Loader2, Users, LogIn, LogOut } from 'lucide-react'

type Group = {
  id: string
  name: string
  description: string
  category: string
  meetingInfo: string | null
  maxMembers: number | null
  memberCount: number
  ownerName: string
  isClosed: boolean
  isMember: boolean
  isOwner: boolean
}

export function GroupsClient({ groups }: { groups: Group[] }) {
  const [show, setShow] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function create(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await createStudyGroup(formData)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not create group.')
      }
    })
  }

  function act(action: 'join' | 'leave', id: string) {
    setError(null)
    const fd = new FormData()
    fd.set('groupId', id)
    const fn = action === 'join' ? joinStudyGroup : leaveStudyGroup
    startTransition(async () => {
      try {
        await fn(fd)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not update membership.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study groups</h1>
          <p className="text-sm text-muted-foreground">
            Join a group or start your own.
          </p>
        </div>
        <Button onClick={() => setShow((v) => !v)}>
          <Plus className="size-4" /> {show ? 'Cancel' : 'New group'}
        </Button>
      </div>

      {show && (
        <form action={create} className="space-y-3 rounded-lg border bg-card p-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="name">Group name</Label>
            <Input id="name" name="name" required minLength={3} disabled={pending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              minLength={10}
              rows={3}
              disabled={pending}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue="GENERAL" disabled={pending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxMembers">Max members (optional)</Label>
              <Input id="maxMembers" name="maxMembers" type="number" min={2} max={500} disabled={pending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingInfo">Meeting info (optional)</Label>
              <Input id="meetingInfo" name="meetingInfo" disabled={pending} />
            </div>
          </div>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Create group
          </Button>
        </form>
      )}

      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No groups yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Card key={g.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold">
                      {g.name}
                      {g.isClosed && (
                        <span className="text-xs text-muted-foreground">(closed)</span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {g.category} &middot; by {g.ownerName} &middot; {g.memberCount}
                      {g.maxMembers ? `/${g.maxMembers}` : ''} members
                    </p>
                    {g.meetingInfo && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Meets: {g.meetingInfo}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {g.isOwner ? (
                      <span className="text-xs font-medium text-muted-foreground">
                        You own this
                      </span>
                    ) : g.isMember ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => act('leave', g.id)}
                        disabled={pending}
                      >
                        <LogOut className="size-4" /> Leave
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => act('join', g.id)}
                        disabled={pending || g.isClosed}
                      >
                        <LogIn className="size-4" /> Join
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && !show && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
