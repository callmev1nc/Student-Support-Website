import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { StudyHubClient } from './study-hub-client'

export const dynamic = 'force-dynamic'

export default async function StudyPage() {
  const { userId, role } = await requireUser()

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000)

  const [tasks, courses, grades, recentSessions] = await Promise.all([
    prisma.studyTask.findMany({
      where: { userId },
      orderBy: { dueAt: 'asc' },
      include: { course: { select: { id: true, code: true, name: true, color: true } } },
    }),
    prisma.course.findMany({
      where: { userId, archived: false },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.grade.findMany({
      where: { userId },
      include: { course: { select: { id: true, code: true, name: true, color: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.focusSession.findMany({
      where: { userId, startedAt: { gte: sevenDaysAgo } },
      orderBy: { startedAt: 'asc' },
    }),
  ])

  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    priority: t.priority,
    status: t.status,
    dueAt: t.dueAt?.toISOString() ?? null,
    completedAt: t.completedAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    course: t.course
      ? { id: t.course.id, code: t.course.code, name: t.course.name, color: t.course.color }
      : null,
  }))

  const serializedCourses = courses.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    credits: c.credits,
    term: c.term,
    color: c.color,
  }))

  const serializedGrades = grades.map((g) => ({
    id: g.id,
    name: g.name,
    score: Number(g.score),
    maxScore: Number(g.maxScore),
    weight: g.weight ? Number(g.weight) : null,
    courseId: g.courseId,
    course: g.course
      ? { id: g.course.id, code: g.course.code, name: g.course.name, color: g.course.color }
      : null,
  }))

  const serializedSessions = recentSessions.map((s) => ({
    id: s.id,
    startedAt: s.startedAt.toISOString(),
    endedAt: s.endedAt.toISOString(),
    durationSeconds: s.durationSeconds,
    mode: s.mode,
    completed: s.completed,
    taskId: s.taskId,
  }))

  return (
    <StudyHubClient
      tasks={serializedTasks}
      courses={serializedCourses}
      grades={serializedGrades}
      recentSessions={serializedSessions}
      role={role}
    />
  )
}
