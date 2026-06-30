'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { askQuestion } from '@/app/actions/community'
import { Plus, Loader2, HelpCircle, CheckCircle2 } from 'lucide-react'

type Q = {
  id: string
  title: string
  bodyPreview: string
  authorName: string
  answerCount: number
  isResolved: boolean
  createdAt: string
}

export function QnaClient({ questions }: { questions: Q[] }) {
  const [show, setShow] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await askQuestion(formData)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not post question.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anonymous Q&amp;A</h1>
          <p className="text-sm text-muted-foreground">
            Ask anything &mdash; anonymous by default.
          </p>
        </div>
        <Button onClick={() => setShow((v) => !v)}>
          <Plus className="size-4" /> {show ? 'Cancel' : 'Ask a question'}
        </Button>
      </div>

      {show && (
        <form action={handleSubmit} className="space-y-3 rounded-lg border bg-card p-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="title">Question title</Label>
            <Input id="title" name="title" required minLength={5} disabled={pending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Details</Label>
            <Textarea id="body" name="body" required minLength={10} rows={4} disabled={pending} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="showName" value="true" disabled={pending} />
            Show my name (otherwise anonymous)
          </label>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Post question
          </Button>
        </form>
      )}

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No questions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link key={q.id} href={`/community/qna/${q.id}`}>
              <Card className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-semibold">
                        {q.isResolved && (
                          <CheckCircle2 className="size-4 text-green-600" />
                        )}
                        <span className="truncate">{q.title}</span>
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {q.bodyPreview}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        by {q.authorName} &middot;{' '}
                        {new Date(q.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {q.answerCount} {q.answerCount === 1 ? 'answer' : 'answers'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
