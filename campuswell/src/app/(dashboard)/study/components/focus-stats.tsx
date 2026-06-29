'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import { StudyChartsWrapper } from './study-charts-wrapper'

type SessionRow = {
  id: string
  startedAt: string
  endedAt: string
  durationSeconds: number
  mode: string
  completed: boolean
  taskId: string | null
}

interface FocusStatsProps {
  recentSessions: SessionRow[]
}

export function FocusStats({ recentSessions }: FocusStatsProps) {
  const completedSessions = recentSessions.filter((s) => s.completed)
  const totalMinutes = Math.round(
    completedSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60,
  )
  const todayMinutes = Math.round(
    completedSessions
      .filter(
        (s) =>
          new Date(s.startedAt).toDateString() === new Date().toDateString(),
      )
      .reduce((sum, s) => sum + s.durationSeconds, 0) / 60,
  )

  // Aggregate by day for the chart
  const dayMap = new Map<string, number>()
  for (const s of completedSessions) {
    const day = new Date(s.startedAt).toLocaleDateString(undefined, {
      weekday: 'short',
    })
    dayMap.set(day, (dayMap.get(day) ?? 0) + s.durationSeconds)
  }

  const chartData = Array.from(dayMap.entries())
    .map(([day, seconds]) => ({ day, minutes: Math.round(seconds / 60) }))
    .sort((a, b) => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      return days.indexOf(a.day) - days.indexOf(b.day)
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Focus Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#C8102E]/10 text-[#C8102E] dark:bg-[#C8102E]/20 dark:text-[#ff6b6b]">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Today</p>
              <p className="text-xl font-semibold">{todayMinutes}m</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">7 Days</p>
              <p className="text-xl font-semibold">{totalMinutes}m</p>
            </div>
          </div>
        </div>

        {chartData.length > 0 && (
          <StudyChartsWrapper data={chartData} />
        )}

        {chartData.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No focus sessions this week. Start a Pomodoro to track your time!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
