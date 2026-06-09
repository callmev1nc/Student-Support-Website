'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { X, Info } from 'lucide-react'

export function SeedDataBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      data-slot="seed-data-banner"
      className={cn(
        'relative flex items-center gap-3 border-b bg-amber-50 px-4 py-2.5 text-sm dark:bg-amber-900/20'
      )}
    >
      <Info className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-amber-800 dark:text-amber-200">
        <span className="font-medium">
          This is a demo environment with sample data.
        </span>
        <span className="text-xs text-amber-600 dark:text-amber-400">
          Login hints: <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-xs">admin@campuswell.edu</code> / <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-xs">admin123</code>
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}
