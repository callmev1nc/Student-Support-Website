'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search, Pin, Lock, MessageSquare } from 'lucide-react'

type Thread = {
  id: string
  title: string
  contentPreview: string
  category: string
  authorName: string
  replyCount: number
  createdAt: string
  isPinned: boolean
  isLocked: boolean
}

export function ForumsClient({ threads }: { threads: Thread[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')

  const categories = useMemo(
    () => ['ALL', ...Array.from(new Set(threads.map((t) => t.category)))],
    [threads],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return threads.filter(
      (t) =>
        (category === 'ALL' || t.category === category) &&
        (!q ||
          t.title.toLowerCase().includes(q) ||
          t.contentPreview.toLowerCase().includes(q)),
    )
  }, [threads, search, category])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forums</h1>
          <p className="text-sm text-muted-foreground">
            Discussions across the community.
          </p>
        </div>
        <Button render={<Link href="/community/forums/new" />}>
          <Plus className="size-4" /> New thread
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No threads yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Link key={t.id} href={`/community/forums/${t.id}`}>
              <Card className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-semibold">
                        {t.isPinned && <Pin className="size-3.5 text-[#C8102E]" />}
                        {t.isLocked && (
                          <Lock className="size-3.5 text-muted-foreground" />
                        )}
                        <span className="truncate">{t.title}</span>
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {t.contentPreview}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.category} &middot; by {t.authorName} &middot;{' '}
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {t.replyCount} {t.replyCount === 1 ? 'reply' : 'replies'}
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
