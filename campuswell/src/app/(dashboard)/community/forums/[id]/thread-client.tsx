'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createForumReply } from '@/app/actions/community'
import { reportContent } from '@/app/actions/moderation'
import { Loader2, Lock, Flag } from 'lucide-react'

type Reply = {
  id: string
  content: string
  authorName: string
  createdAt: string
}

type Thread = {
  id: string
  title: string
  content: string
  category: string
  authorName: string
  createdAt: string
  isLocked: boolean
  replies: Reply[]
}

export function ThreadClient({
  thread,
  canReply,
}: {
  thread: Thread
  canReply: boolean
}) {
  const [content, setContent] = useState('')
  const [anon, setAnon] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submit(formData: FormData) {
    setError(null)
    formData.set('threadId', thread.id)
    if (anon) formData.set('isAnonymous', 'true')
    startTransition(async () => {
      try {
        await createForumReply(formData)
        setContent('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not post reply.')
      }
    })
  }

  const [reportThreadOpen, setReportThreadOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')

  function report(targetType: string, targetId: string) {
    const fd = new FormData()
    fd.set('targetType', targetType)
    fd.set('targetId', targetId)
    fd.set('reason', reportReason)
    startTransition(async () => {
      try {
        await reportContent(fd)
        setReportReason('')
        setReportThreadOpen(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not submit report.')
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" render={<Link href="/community/forums" />}>
        Back to forums
      </Button>

      <Card>
        <CardContent className="space-y-2 py-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {thread.category} &middot; by {thread.authorName} &middot;{' '}
              {new Date(thread.createdAt).toLocaleString()}
            </p>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setReportThreadOpen((v) => !v)}
              className="text-muted-foreground hover:text-red-500"
            >
              <Flag className="size-3.5" />
            </Button>
          </div>
          {reportThreadOpen && (
            <div className="space-y-2 rounded border p-3">
              <textarea
                className="w-full rounded border p-2 text-sm"
                rows={2}
                placeholder="Why are you reporting this?"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                disabled={pending}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => report('THREAD', thread.id)} disabled={pending || !reportReason.trim()}>
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  Submit report
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReportThreadOpen(false)} disabled={pending}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{thread.title}</h1>
          <p className="whitespace-pre-wrap text-sm">{thread.content}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
        </h2>
        {thread.replies.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-1 py-3">
              <p className="text-xs text-muted-foreground">
                {r.authorName} &middot; {new Date(r.createdAt).toLocaleString()}
              </p>
              <p className="whitespace-pre-wrap text-sm">{r.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {canReply ? (
        <form action={submit} className="space-y-3 rounded-lg border bg-card p-4">
          <Label htmlFor="content">Your reply</Label>
          <Textarea
            id="content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
            disabled={pending}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={anon}
              onChange={(e) => setAnon(e.target.checked)}
              disabled={pending}
            />
            Reply anonymously
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={pending || !content.trim()}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Post reply
          </Button>
        </form>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-4" /> This thread is locked.
        </p>
      )}
    </div>
  )
}
