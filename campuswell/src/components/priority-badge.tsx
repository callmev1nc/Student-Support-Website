import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

const priorityStyles: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const priorityLabels: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0 font-medium',
        priorityStyles[priority] ?? priorityStyles.MEDIUM,
        className
      )}
    >
      {priorityLabels[priority] ?? priority}
    </Badge>
  )
}
