import Link from 'next/link'
import { requireUser } from '@/lib/session'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, HelpCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CommunityHub() {
  await requireUser()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community</h1>
        <p className="text-sm text-muted-foreground">
          Connect with peers &mdash; ask, share, and support each other.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/community/forums">
          <Card className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#C8102E]/10 text-[#C8102E]">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <p className="font-semibold">Forums</p>
                <p className="text-xs text-muted-foreground">
                  Browse and start discussions.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/community/qna">
          <Card className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#C8102E]/10 text-[#C8102E]">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <p className="font-semibold">Anonymous Q&amp;A</p>
                <p className="text-xs text-muted-foreground">
                  Ask anything, anonymously.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
