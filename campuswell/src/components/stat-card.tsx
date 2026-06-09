import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down'
  }
  className?: string
}

export function StatCard({ icon: Icon, label, value, trend, className }: StatCardProps) {
  return (
    <Card className={cn('py-3', className)}>
      <CardContent className="flex items-center gap-4 px-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#C8102E]/10 text-[#C8102E] dark:bg-[#C8102E]/20 dark:text-[#ff6b6b]">
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium',
                trend.direction === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend.direction === 'up' ? '+' : ''}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
