import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export type StudyStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

const statusStyles: Record<StudyStatus, string> = {
  TODO: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  DONE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

const statusLabels: Record<StudyStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

interface StudyStatusBadgeProps {
  status: StudyStatus
  className?: string
}

export function StudyStatusBadge({ status, className }: StudyStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0 font-medium',
        statusStyles[status] ?? statusStyles.TODO,
        className,
      )}
    >
      {statusLabels[status] ?? status}
    </Badge>
  )
}
