'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createStudyTask, updateStudyTask } from '@/app/actions/study'
import { Loader2 } from 'lucide-react'

type CourseRow = {
  id: string
  code: string
  name: string
  credits: number
  term: string | null
  color: string | null
}

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

const categories = [
  { value: 'HOMEWORK', label: 'Homework' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'EXAM_PREP', label: 'Exam Prep' },
  { value: 'READING', label: 'Reading' },
  { value: 'PROJECT', label: 'Project' },
  { value: 'OTHER', label: 'Other' },
]

const priorities = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

interface StudyTaskFormProps {
  courses: CourseRow[]
  editingTask?: TaskRow | null
  onClose?: () => void
}

export function StudyTaskForm({ courses, editingTask, onClose }: StudyTaskFormProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setPending(true)

    try {
      if (editingTask) {
        await updateStudyTask(formData)
      } else {
        await createStudyTask(formData)
      }
      onClose?.()
    } catch (err) {
      setPending(false)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {editingTask && (
        <input type="hidden" name="id" value={editingTask.id} />
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="What do you need to do?"
          required
          minLength={3}
          defaultValue={editingTask?.title ?? ''}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Add details..."
          rows={3}
          defaultValue={editingTask?.description ?? ''}
          disabled={pending}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue={editingTask?.category ?? 'HOMEWORK'} disabled={pending}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" defaultValue={editingTask?.priority ?? 'MEDIUM'} disabled={pending}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((pri) => (
                <SelectItem key={pri.value} value={pri.value}>{pri.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueAt">Due Date (optional)</Label>
          <Input
            id="dueAt"
            name="dueAt"
            type="datetime-local"
            defaultValue={editingTask?.dueAt ? new Date(editingTask.dueAt).toISOString().slice(0, 16) : ''}
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="courseId">Course (optional)</Label>
          <Select name="courseId" defaultValue={editingTask?.course?.id ?? ''} disabled={pending}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="No course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No course</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {editingTask ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
