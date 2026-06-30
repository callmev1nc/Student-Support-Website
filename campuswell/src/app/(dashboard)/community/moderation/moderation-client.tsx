'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  moderateContent,
  resolveReport,
  dismissReport,
} from '@/app/actions/moderation'
import { Loader2, ShieldCheck, Eye, EyeOff, Lock, Unlock, PinOff, Pin, Check, X, AlertTriangle } from 'lucide-react'

type Report = {
  id: string
  reason: string
  detail: string | null
  status: string
  createdAt: string
  resolvedAt: string | null
  reporterId: string
  reporterName: string
  targetType: string
  targetId: string
}

type Thread = {
  id: string
  title: string
  category: string
  isHidden: boolean
  isLocked: boolean
  isPinned: boolean
  authorName: string
  replyCount: number
  createdAt: string
}

type Question = {
  id: string
  title: string
  isHidden: boolean
  isResolved: boolean
  authorName: string
  answerCount: number
  createdAt: string
}

export function ModerationClient({
  reports,
  threads,
  questions,
}: {
  reports: Report[]
  threads: Thread[]
  questions: Question[]
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

  function moderate(targetType: string, targetId: string, action: string, reportId?: string) {
    const fd = new FormData()
    fd.set('targetType', targetType)
    fd.set('targetId', targetId)
    fd.set('action', action)
    if (reportId) fd.set('reportId', reportId)
    act(moderateContent, fd)
  }

  function resolve(reportId: string) {
    const fd = new FormData()
    fd.set('reportId', reportId)
    act(resolveReport, fd)
  }

  function dismiss(reportId: string) {
    const fd = new FormData()
    fd.set('reportId', reportId)
    act(dismissReport, fd)
  }

  const openReports = reports.filter((r) => r.status === 'OPEN')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-6 text-[#C8102E]" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Moderation</h1>
          <p className="text-sm text-muted-foreground">
            Manage reported content and community flags.
          </p>
        </div>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">
            Reports {openReports.length > 0 && `(${openReports.length})`}
          </TabsTrigger>
          <TabsTrigger value="threads">Forum threads</TabsTrigger>
          <TabsTrigger value="questions">Q&amp;A</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-3">
          {openReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShieldCheck className="size-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">No open reports.</p>
              </CardContent>
            </Card>
          ) : (
            openReports.map((r) => (
              <Card key={r.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="size-4 text-amber-500" />
                        {r.reason}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Reported by {r.reporterName} &middot; {r.targetType.toLowerCase()} &middot;{' '}
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                      {r.detail && (
                        <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderate(r.targetType, r.targetId, 'hide', r.id)}
                        disabled={pending}
                      >
                        <EyeOff className="size-4" /> Hide
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderate(r.targetType, r.targetId, 'unhide', r.id)}
                        disabled={pending}
                      >
                        <Eye className="size-4" /> Unhide
                      </Button>
                      {r.targetType === 'THREAD' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moderate(r.targetType, r.targetId, 'lock', r.id)}
                            disabled={pending}
                          >
                            <Lock className="size-4" /> Lock
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moderate(r.targetType, r.targetId, 'unlock', r.id)}
                            disabled={pending}
                          >
                            <Unlock className="size-4" /> Unlock
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        onClick={() => resolve(r.id)}
                        disabled={pending}
                      >
                        <Check className="size-4" /> Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismiss(r.id)}
                        disabled={pending}
                      >
                        <X className="size-4" /> Dismiss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="threads" className="space-y-3">
          {threads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">No threads.</p>
              </CardContent>
            </Card>
          ) : (
            threads.map((t) => (
              <Card key={t.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        {t.isHidden && <span className="mr-1 text-red-500">[HIDDEN]</span>}
                        {t.isLocked && <span className="mr-1 text-amber-500">[LOCKED]</span>}
                        {t.isPinned && <span className="mr-1 text-blue-500">[PINNED]</span>}
                        {t.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        by {t.authorName} &middot; {t.replyCount} replies &middot;{' '}
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderate('THREAD', t.id, t.isHidden ? 'unhide' : 'hide')}
                        disabled={pending}
                      >
                        {t.isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderate('THREAD', t.id, t.isLocked ? 'unlock' : 'lock')}
                        disabled={pending}
                      >
                        {t.isLocked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderate('THREAD', t.id, t.isPinned ? 'unpin' : 'pin')}
                        disabled={pending}
                      >
                        {t.isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-3">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">No questions.</p>
              </CardContent>
            </Card>
          ) : (
            questions.map((q) => (
              <Card key={q.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        {q.isHidden && <span className="mr-1 text-red-500">[HIDDEN]</span>}
                        {q.isResolved && <span className="mr-1 text-green-500">[RESOLVED]</span>}
                        {q.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        by {q.authorName} &middot; {q.answerCount} answers &middot;{' '}
                        {new Date(q.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderate('QUESTION', q.id, q.isHidden ? 'unhide' : 'hide')}
                        disabled={pending}
                      >
                        {q.isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
