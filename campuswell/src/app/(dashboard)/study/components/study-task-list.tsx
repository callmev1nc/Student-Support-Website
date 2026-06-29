'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PriorityBadge } from '@/components/priority-badge'
import { StudyStatusBadge } from '@/components/study-status-badge'
import { toggleStudyTaskStatus, deleteStudyTask } from '@/app/actions/study'
import { Loader2, Plus, Trash2, ListTodo, CheckCircle2, Circle } from 'lucide-react'
import { StudyTaskForm } from './study-task-form'
import { formatDistanceToNow } from 'date-fns'

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

const categoryLabels: Record<string, string> = {
  HOMEWORK: 'Homework',
  ASSIGNMENT: 'Assignment',
  QUIZ: 'Quiz',
  EXAM_PREP: 'Exam Prep',
  READING: 'Reading',
  PROJECT: 'Project',
  OTHER: 'Other',
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return (
    d.getUTCFullYear() === now.getFullYear() &&
    d.getUTCMonth() === now.getMonth() &&
    d.getUTCDate() === now.getDate()
  )
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date() && !isToday(dateStr)
}

function belongsTo(task: TaskRow, tab: string): boolean {
  switch (tab) {
    case 'today':
      return task.dueAt !== null && isToday(task.dueAt) && task.status !== 'DONE'
    case 'upcoming':
      return task.dueAt !== null && !isToday(task.dueAt) && !isOverdue(task.dueAt) && task.status !== 'DONE'
    case 'overdue':
      return task.dueAt !== null && isOverdue(task.dueAt) && task.status !== 'DONE'
    case 'done':
      return task.status === 'DONE'
    default:
      return true
  }
}

interface StudyTaskListProps {
  tasks: TaskRow[]
  courses: CourseRow[]
}

export function StudyTaskList({ tasks, courses }: StudyTaskListProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [toggling, setToggling] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null)

  const filtered = useMemo(() => {
    return tasks.filter((t) => belongsTo(t, activeTab))
  }, [tasks, activeTab])

  async function handleToggle(taskId: string) {
    setToggling(taskId)
    try {
      const formData = new FormData()
      formData.set('taskId', taskId)
      await toggleStudyTaskStatus(formData)
    } catch {
      // Ignore — the form will revalidate
    } finally {
      setToggling(null)
    }
  }

  async function handleDelete(taskId: string) {
    const formData = new FormData()
    formData.set('taskId', taskId)
    await deleteStudyTask(formData)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" />
          {showForm ? 'Cancel' : 'New Task'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <StudyTaskForm
              courses={courses}
              editingTask={editingTask}
              onClose={() => { setShowForm(false); setEditingTask(null) }}
            />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>

        {['all', 'today', 'upcoming', 'overdue', 'done'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ListTodo className="size-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {tab === 'all'
                      ? 'No tasks yet. Create your first task!'
                      : `No ${tab} tasks.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map((task) => (
                  <Card key={task.id} className="py-0">
                    <CardContent className="flex items-center gap-3 py-3 px-4">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={toggling === task.id}
                        onClick={() => handleToggle(task.id)}
                      >
                        {task.status === 'DONE' ? (
                          <CheckCircle2 className="size-4 text-green-600" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground" />
                        )}
                      </Button>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          <span>{categoryLabels[task.category] ?? task.category}</span>
                          {task.course && (
                            <span className="text-xs">{task.course.code}</span>
                          )}
                          {task.dueAt && (
                            <span className={isOverdue(task.dueAt) && task.status !== 'DONE' ? 'text-red-600 font-medium' : ''}>
                              {formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <PriorityBadge priority={task.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'} />
                        <StudyStatusBadge status={task.status as 'TODO' | 'IN_PROGRESS' | 'DONE'} />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="size-3.5 text-muted-foreground hover:text-red-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
