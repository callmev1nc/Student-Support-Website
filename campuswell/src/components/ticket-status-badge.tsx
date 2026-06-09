import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export type TicketStatus =
  | 'NEW'
  | 'IN_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'RESOLVED'
  | 'CLOSED'

const statusStyles: Record<TicketStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ASSIGNED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  IN_PROGRESS: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  WAITING: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const statusLabels: Record<TicketStatus, string> = {
  NEW: 'New',
  IN_REVIEW: 'In Review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  WAITING: 'Waiting',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}

interface TicketStatusBadgeProps {
  status: TicketStatus
  className?: string
}

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0 font-medium',
        statusStyles[status] ?? statusStyles.NEW,
        className
      )}
    >
      {statusLabels[status] ?? status}
    </Badge>
  )
}
