'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { StudyTaskList } from './components/study-task-list'
import { PomodoroTimer } from './components/pomodoro-timer'
import { GradeTracker } from './components/grade-tracker'

type TaskRow = {
  id: string
  title: string
  description: string | null
  category: string
  priority: string
  status: string
  dueAt: string | null
  completedAt: string | null
  createdAt: string
  course: { id: string; code: string; name: string; color: string | null } | null
}

type CourseRow = {
  id: string
  code: string
  name: string
  credits: number
  term: string | null
  color: string | null
}

type GradeRow = {
  id: string
  name: string
  score: number
  maxScore: number
  weight: number | null
  courseId: string
  course: { id: string; code: string; name: string; color: string | null } | null
}

type SessionRow = {
  id: string
  startedAt: string
  endedAt: string
  durationSeconds: number
  mode: string
  completed: boolean
  taskId: string | null
}

interface StudyHubClientProps {
  tasks: TaskRow[]
  courses: CourseRow[]
  grades: GradeRow[]
  recentSessions: SessionRow[]
  role: string
}

export function StudyHubClient({ tasks, courses, grades, recentSessions, role }: StudyHubClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Study Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plan your tasks, track your focus, and monitor your grades.
        </p>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <StudyTaskList tasks={tasks} courses={courses} />
        </TabsContent>

        <TabsContent value="timer" className="mt-6">
          <PomodoroTimer recentSessions={recentSessions} />
        </TabsContent>

        <TabsContent value="grades" className="mt-6">
          <GradeTracker courses={courses} grades={grades} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
