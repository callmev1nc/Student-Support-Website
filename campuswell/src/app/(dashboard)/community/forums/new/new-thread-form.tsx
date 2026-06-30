'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createForumThread } from '@/app/actions/community'
import { Loader2 } from 'lucide-react'

const CATEGORIES = ['GENERAL', 'ACADEMIC', 'SOCIAL', 'WELLBEING', 'CAREER', 'OTHER']

export function NewThreadForm() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [anon, setAnon] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setPending(true)
    if (anon) formData.set('isAnonymous', 'true')
    try {
      await createForumThread(formData)
    } catch (e) {
      setPending(false)
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">New thread</h1>
        <Button variant="ghost" size="sm" render={<Link href="/community/forums" />}>
          Back to forums
        </Button>
      </div>

      <form
        action={handleSubmit}
        className="space-y-4 rounded-lg border bg-card p-4"
      >
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required minLength={3} disabled={pending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue="GENERAL"
            disabled={pending}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            name="content"
            required
            minLength={3}
            rows={6}
            disabled={pending}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={anon}
            onChange={(e) => setAnon(e.target.checked)}
            disabled={pending}
          />
          Post anonymously
        </label>

        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Post thread
        </Button>
      </form>
    </div>
  )
}
