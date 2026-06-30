'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { answerQuestion, acceptAnswer } from '@/app/actions/community'
import { reportContent } from '@/app/actions/moderation'
import { Loader2, Check, CheckCircle2, Flag } from 'lucide-react'

type Answer = {
  id: string
  content: string
  authorName: string
  isAccepted: boolean
  createdAt: string
}

type Question = {
  id: string
  title: string
  body: string
  authorName: string
  isResolved: boolean
  createdAt: string
  isOwn: boolean
  answers: Answer[]
}

export function QnaDetailClient({
  question,
  canAnswer,
}: {
  question: Question
  canAnswer: boolean
}) {
  const [content, setContent] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submit(formData: FormData) {
    setError(null)
    formData.set('questionId', question.id)
    startTransition(async () => {
      try {
        await answerQuestion(formData)
        setContent('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not post answer.')
      }
    })
  }

  function accept(answerId: string) {
    setError(null)
    const fd = new FormData()
    fd.set('answerId', answerId)
    startTransition(async () => {
      try {
        await acceptAnswer(fd)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not accept answer.')
      }
    })
  }

  const [reportOpen, setReportOpen] = useState(false)
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
        setReportOpen(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not submit report.')
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" render={<Link href="/community/qna" />}>
        Back to Q&amp;A
      </Button>

      <Card>
        <CardContent className="space-y-2 py-4">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              {question.isResolved && (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="size-3.5" /> Resolved
                </span>
              )}
              by {question.authorName} &middot;{' '}
              {new Date(question.createdAt).toLocaleString()}
            </p>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setReportOpen((v) => !v)}
              className="text-muted-foreground hover:text-red-500"
            >
              <Flag className="size-3.5" />
            </Button>
          </div>
          {reportOpen && (
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
                <Button size="sm" onClick={() => report('QUESTION', question.id)} disabled={pending || !reportReason.trim()}>
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  Submit report
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReportOpen(false)} disabled={pending}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{question.title}</h1>
          <p className="whitespace-pre-wrap text-sm">{question.body}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {question.answers.length}{' '}
          {question.answers.length === 1 ? 'answer' : 'answers'}
        </h2>
        {question.answers.map((a) => (
          <Card key={a.id} className={a.isAccepted ? 'border-green-500/50' : ''}>
            <CardContent className="space-y-1 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {a.authorName} &middot;{' '}
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{a.content}</p>
                </div>
                <div className="shrink-0">
                  {a.isAccepted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                      <Check className="size-3.5" /> Accepted
                    </span>
                  ) : (
                    question.isOwn &&
                    canAnswer === false &&
                    !question.answers.some((x) => x.isAccepted) && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => accept(a.id)}
                      >
                        <Check className="size-3.5" /> Accept
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {canAnswer ? (
        <form action={submit} className="space-y-3 rounded-lg border bg-card p-4">
          <Label htmlFor="content">Your answer</Label>
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
            <input type="checkbox" name="showName" value="true" disabled={pending} />
            Show my name (otherwise anonymous)
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={pending || !content.trim()}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Post answer
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          This question is resolved &mdash; new answers are closed.
        </p>
      )}

      {error && !canAnswer && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
