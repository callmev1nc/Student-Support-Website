'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TicketStatusBadge } from '@/components/ticket-status-badge'
import { PriorityBadge } from '@/components/priority-badge'
import {
  Plus,
  Search,
  Ticket,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TicketRow = {
  id: string
  subject: string
  category: string
  priority: string
  status: string
  createdAt: string
  student: { name: string } | null
  assignedTo: { name: string } | null
}

// ---------------------------------------------------------------------------
// Category label helper
// ---------------------------------------------------------------------------
const categoryLabels: Record<string, string> = {
  ACADEMIC: 'Academic',
  MENTAL_HEALTH: 'Mental Health',
  TECHNICAL: 'Technical',
  BULLYING: 'Bullying',
  ATTENDANCE: 'Attendance',
  FINANCIAL: 'Financial',
  GENERAL: 'General',
}

// ---------------------------------------------------------------------------
// Priority left-border colour helper
// ---------------------------------------------------------------------------
const priorityBorder: Record<string, string> = {
  LOW: 'border-l-gray-400',
  MEDIUM: 'border-l-blue-500',
  HIGH: 'border-l-orange-500',
  URGENT: 'border-l-red-600',
}

// ---------------------------------------------------------------------------
// Status group definitions
// ---------------------------------------------------------------------------
const openStatuses = ['NEW', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING']

function belongsTo(status: string, tab: string): boolean {
  switch (tab) {
    case 'open':
      return openStatuses.includes(status)
    case 'resolved':
      return status === 'RESOLVED'
    case 'closed':
      return status === 'CLOSED'
    default:
      return true
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function TicketList({
  tickets,
  role,
}: {
  tickets: TicketRow[]
  role: string
}) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tickets.filter((t) => {
      if (!belongsTo(t.status, activeTab)) return false
      if (
        q &&
        !t.subject.toLowerCase().includes(q) &&
        !t.category.toLowerCase().includes(q) &&
        !(t.student?.name ?? '').toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [tickets, search, activeTab])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {role === 'STUDENT' ? 'My Tickets' : 'Support Tickets'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {role === 'STUDENT'
              ? 'Track and manage your support requests.'
              : 'View and manage all support tickets.'}
          </p>
        </div>
        <Button render={<Link href="/tickets/new" />}>
          <Plus className="size-4" />
          New Ticket
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        {['all', 'open', 'resolved', 'closed'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Ticket className="size-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {search
                      ? 'No tickets match your search.'
                      : tab === 'all'
                        ? 'No tickets yet.'
                        : `No ${tab} tickets.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block"
                  >
                    <Card
                      className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 ${
                        priorityBorder[ticket.priority] ?? 'border-l-gray-300'
                      }`}
                    >
                      <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-4">
                        {/* Subject + meta */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {ticket.subject}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              {categoryLabels[ticket.category] ?? ticket.category}
                            </span>
                            {ticket.assignedTo?.name && (
                              <span>Assigned to {ticket.assignedTo.name}</span>
                            )}
                            {role !== 'STUDENT' && ticket.student?.name && (
                              <span>By {ticket.student.name}</span>
                            )}
                            <span>
                              {formatDistanceToNow(new Date(ticket.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex shrink-0 items-center gap-2">
                          <PriorityBadge
                            priority={
                              ticket.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
                            }
                          />
                          <TicketStatusBadge
                            status={
                              ticket.status as
                                | 'NEW'
                                | 'IN_REVIEW'
                                | 'ASSIGNED'
                                | 'IN_PROGRESS'
                                | 'WAITING'
                                | 'RESOLVED'
                                | 'CLOSED'
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
