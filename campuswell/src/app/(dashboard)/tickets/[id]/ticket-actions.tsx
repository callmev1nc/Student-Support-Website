'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Loader2, ChevronDown, UserPlus, XCircle } from 'lucide-react'
import {
  updateTicketStatus,
  assignTicket,
  addComment,
  closeTicket,
} from '@/app/actions/tickets'

// ---------------------------------------------------------------------------
// Status Change Dropdown (staff / admin)
// ---------------------------------------------------------------------------
const statuses = [
  { value: 'NEW', label: 'New' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING', label: 'Waiting' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
] as const

export function StatusDropdown({
  ticketId,
  currentStatus,
}: {
  ticketId: string
  currentStatus: string
}) {
  const [pending, setPending] = useState(false)

  async function handleStatusChange(status: string) {
    setPending(true)
    const fd = new FormData()
    fd.set('ticketId', ticketId)
    fd.set('status', status)
    await updateTicketStatus(fd)
    setPending(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            Change Status
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {statuses.map((s) => (
          <DropdownMenuItem
            key={s.value}
            disabled={s.value === currentStatus}
            onClick={() => handleStatusChange(s.value)}
          >
            {s.label}
            {s.value === currentStatus && ' (current)'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ---------------------------------------------------------------------------
// Assign to Self button (staff)
// ---------------------------------------------------------------------------
export function AssignToSelfButton({ ticketId }: { ticketId: string }) {
  const [pending, setPending] = useState(false)

  async function handleAssign() {
    setPending(true)
    const fd = new FormData()
    fd.set('ticketId', ticketId)
    await assignTicket(fd)
    setPending(false)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleAssign} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <UserPlus className="size-4" />
      )}
      Assign to Me
    </Button>
  )
}

// ---------------------------------------------------------------------------
// Close Ticket button (student owner, staff, admin)
// ---------------------------------------------------------------------------
export function CloseTicketButton({ ticketId }: { ticketId: string }) {
  const [pending, setPending] = useState(false)

  async function handleClose() {
    setPending(true)
    const fd = new FormData()
    fd.set('ticketId', ticketId)
    await closeTicket(fd)
    setPending(false)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClose} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <XCircle className="size-4" />
      )}
      Close Ticket
    </Button>
  )
}

// ---------------------------------------------------------------------------
// Comment Form
// ---------------------------------------------------------------------------
export function CommentForm({ ticketId }: { ticketId: string }) {
  const [pending, setPending] = useState(false)
  const [content, setContent] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setPending(true)
    const fd = new FormData()
    fd.set('ticketId', ticketId)
    fd.set('content', content)
    await addComment(fd)
    setContent('')
    setPending(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        disabled={pending}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending || !content.trim()}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Post Comment
        </Button>
      </div>
    </form>
  )
}
