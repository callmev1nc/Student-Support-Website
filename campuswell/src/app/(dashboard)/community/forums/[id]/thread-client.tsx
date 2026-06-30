'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createForumReply } from '@/app/actions/community'
import { Loader2, Lock } from 'lucide-react'

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" render={<Link href="/community/forums" />}>
        Back to forums
      </Button>

      <Card>
        <CardContent className="space-y-2 py-4">
          <p className="text-xs text-muted-foreground">
            {thread.category} &middot; by {thread.authorName} &middot;{' '}
            {new Date(thread.createdAt).toLocaleString()}
          </p>
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
