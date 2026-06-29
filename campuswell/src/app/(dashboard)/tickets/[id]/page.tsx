import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TicketStatusBadge } from '@/components/ticket-status-badge'
import { PriorityBadge } from '@/components/priority-badge'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  MessageSquare,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import {
  StatusDropdown,
  AssignToSelfButton,
  CloseTicketButton,
  CommentForm,
} from './ticket-actions'

// ---------------------------------------------------------------------------
// Category label helper
// ---------------------------------------------------------------------------
const categoryLabels: Record<string, string> = {
  ACADEMIC: 'Academic',
  MENTAL_HEALTH: 'Mental Health',
  TECHNICAL: 'Technical',
  BULLYING: 'Bullying & Harassment',
  ATTENDANCE: 'Attendance',
  FINANCIAL: 'Financial',
  GENERAL: 'General',
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId, role } = await requireUser()
  const { id } = await params

  // Fetch ticket with relations
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      student: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: { id: true, name: true, role: true, avatarUrl: true },
          },
        },
      },
    },
  })

  if (!ticket) {
    notFound()
  }

  // Permission check: students can only see their own tickets
  const isOwner = ticket.student.id === userId
  const isAssigned = ticket.assignedTo?.id === userId
  const isStaffOrAdmin = role === 'STAFF' || role === 'ADMIN'

  if (!isOwner && !isAssigned && !isStaffOrAdmin) {
    notFound()
  }

  const isClosed = ticket.status === 'CLOSED'

  // Determine which actions the current user can take
  const canChangeStatus = isStaffOrAdmin && !isClosed
  const canAssignToSelf = (role === 'STAFF' || role === 'ADMIN') && !ticket.assignedToId && !isClosed
  const canClose = (isOwner || isStaffOrAdmin) && !isClosed

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/tickets" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Ticket Details</h1>
      </div>

      {/* Ticket card */}
      <Card>
        <CardHeader className="space-y-4">
          {/* Title + badges */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-snug">
                {ticket.subject}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Ticket #{ticket.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <PriorityBadge
                priority={ticket.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'}
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
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Tag className="size-3.5" />
              {categoryLabels[ticket.category] ?? ticket.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Created {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Updated{' '}
              {formatDistanceToNow(new Date(ticket.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* People */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Submitted by:</span>
              <span className="font-medium">{ticket.student.name}</span>
              {role !== 'STUDENT' && (
                <span className="text-muted-foreground">
                  ({ticket.student.email})
                </span>
              )}
            </span>
            {ticket.assignedTo && (
              <span className="flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Assigned to:</span>
                <span className="font-medium">{ticket.assignedTo.name}</span>
              </span>
            )}
          </div>

          {/* Action buttons */}
          {(canChangeStatus || canAssignToSelf || canClose) && (
            <Separator />
          )}
          <div className="flex flex-wrap gap-2">
            {canChangeStatus && (
              <StatusDropdown ticketId={ticket.id} currentStatus={ticket.status} />
            )}
            {canAssignToSelf && (
              <AssignToSelfButton ticketId={ticket.id} />
            )}
            {canClose && (
              <CloseTicketButton ticketId={ticket.id} />
            )}
          </div>
        </CardHeader>

        <Separator />

        {/* Description */}
        <CardContent className="pt-6">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Description
          </h3>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {ticket.description}
          </div>
        </CardContent>
      </Card>

      {/* Comment thread */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">
              Comments ({ticket.comments.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing comments */}
          {ticket.comments.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No comments yet.
            </p>
          ) : (
            <div className="space-y-4">
              {ticket.comments.map((comment: { id: string; content: string; createdAt: Date; author: { id: string; name: string; role: string; avatarUrl: string | null } }) => {
                const roleBadgeStyles: Record<string, string> = {
                  STUDENT:
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                  STAFF:
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                  ADMIN:
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                }
                const roleLabels: Record<string, string> = {
                  STUDENT: 'Student',
                  STAFF: 'Staff',
                  ADMIN: 'Admin',
                }

                return (
                  <div key={comment.id} className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {comment.author.name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() ?? '?'}
                    </div>
                    {/* Body */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                          {comment.author.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`border-0 text-[10px] px-1.5 py-0 ${
                            roleBadgeStyles[comment.author.role] ?? ''
                          }`}
                        >
                          {roleLabels[comment.author.role] ?? comment.author.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Comment form */}
          {!isClosed ? (
            <>
              <Separator />
              <CommentForm ticketId={ticket.id} />
            </>
          ) : (
            <p className="pt-2 text-center text-sm text-muted-foreground">
              This ticket is closed. Comments are disabled.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
