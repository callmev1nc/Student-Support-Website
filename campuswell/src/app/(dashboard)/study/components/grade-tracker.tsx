'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCourse, createGrade, deleteGrade, deleteCourse } from '@/app/actions/study'
import { weightedAverage } from '@/lib/gpa'
import { Plus, Trash2, Loader2, GraduationCap } from 'lucide-react'

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

interface GradeTrackerProps {
  courses: CourseRow[]
  grades: GradeRow[]
}

function AddCourseForm({ onClose }: { onClose: () => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setPending(true)
    try {
      await createCourse(formData)
      onClose()
    } catch (err) {
      setPending(false)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 border rounded-lg p-4">
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Course Code</Label>
          <Input id="code" name="code" placeholder="e.g. COMP3028" required minLength={2} disabled={pending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Course Name</Label>
          <Input id="name" name="name" placeholder="e.g. Web Development" required minLength={2} disabled={pending} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="credits">Credits</Label>
          <Input id="credits" name="credits" type="number" defaultValue="10" min={1} max={20} disabled={pending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="term">Term (optional)</Label>
          <Input id="term" name="term" placeholder="e.g. 2025 Semester 1" disabled={pending} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Add Course
        </Button>
      </div>
    </form>
  )
}

function AddGradeForm({ courses, onClose }: { courses: CourseRow[]; onClose: () => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setPending(true)
    try {
      await createGrade(formData)
      onClose()
    } catch (err) {
      setPending(false)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 border rounded-lg p-4">
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Assessment Name</Label>
        <Input id="name" name="name" placeholder="e.g. Final Exam" required minLength={2} disabled={pending} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="score">Score</Label>
          <Input id="score" name="score" type="number" step="0.01" min="0" placeholder="85" required disabled={pending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxScore">Max Score</Label>
          <Input id="maxScore" name="maxScore" type="number" step="0.01" min="1" defaultValue="100" disabled={pending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight % (optional)</Label>
          <Input id="weight" name="weight" type="number" step="0.01" min="0" max="100" placeholder="e.g. 30" disabled={pending} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="courseId">Course</Label>
        <Select name="courseId" disabled={pending}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Add Grade
        </Button>
      </div>
    </form>
  )
}

export function GradeTracker({ courses, grades }: GradeTrackerProps) {
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showGradeForm, setShowGradeForm] = useState(false)

  const overallAvg = useMemo(() => weightedAverage(grades), [grades])

  async function handleDeleteGrade(gradeId: string) {
    const formData = new FormData()
    formData.set('gradeId', gradeId)
    await deleteGrade(formData)
  }

  async function handleDeleteCourse(courseId: string) {
    const formData = new FormData()
    formData.set('courseId', courseId)
    await deleteCourse(formData)
  }

  // Group grades by course
  const courseMap = useMemo(() => {
    const map = new Map<string, { course: CourseRow; grades: GradeRow[] }>()
    for (const c of courses) {
      map.set(c.id, { course: c, grades: [] })
    }
    for (const g of grades) {
      const entry = map.get(g.courseId)
      if (entry) entry.grades.push(g)
    }
    return map
  }, [courses, grades])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Grades</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowCourseForm(!showCourseForm)}>
            <Plus className="size-4" />
            {showCourseForm ? 'Cancel' : 'Course'}
          </Button>
          <Button size="sm" onClick={() => setShowGradeForm(!showGradeForm)}>
            <Plus className="size-4" />
            {showGradeForm ? 'Cancel' : 'Grade'}
          </Button>
        </div>
      </div>

      {showCourseForm && <AddCourseForm onClose={() => setShowCourseForm(false)} />}
      {showGradeForm && <AddGradeForm courses={courses} onClose={() => setShowGradeForm(false)} />}

      {/* Overall Average */}
      {grades.length > 0 && (
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#C8102E]/10 text-[#C8102E] dark:bg-[#C8102E]/20 dark:text-[#ff6b6b]">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Overall Average</p>
              <p className="text-2xl font-bold">{overallAvg.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-course breakdown */}
      {Array.from(courseMap.entries()).map(([courseId, { course, grades: courseGrades }]) => {
        const avg = weightedAverage(courseGrades)
        return (
          <Card key={courseId}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ backgroundColor: course.color ?? '#6B7280' }}
                  />
                  {course.code} — {course.name}
                  <span className="text-xs text-muted-foreground font-normal">
                    ({course.credits} cp)
                  </span>
                </CardTitle>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteCourse(courseId)}>
                  <Trash2 className="size-3.5 text-muted-foreground hover:text-red-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {courseGrades.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No grades recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium mb-2">
                    <span>Course Average</span>
                    <span className="text-lg font-bold">{avg.toFixed(1)}%</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium">Assessment</th>
                        <th className="pb-2 font-medium">Score</th>
                        <th className="pb-2 font-medium">Weight</th>
                        <th className="pb-2 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseGrades.map((g) => (
                        <tr key={g.id} className="border-b last:border-0">
                          <td className="py-2">{g.name}</td>
                          <td className="py-2">{g.score}/{g.maxScore} ({((g.score / g.maxScore) * 100).toFixed(0)}%)</td>
                          <td className="py-2">{g.weight != null ? `${g.weight}%` : '—'}</td>
                          <td className="py-2">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteGrade(g.id)}>
                              <Trash2 className="size-3 text-muted-foreground hover:text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {courses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No courses yet. Add your first course to start tracking grades!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
