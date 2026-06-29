'use server'

import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/session'
import { parseForm, createStudyTaskSchema, updateStudyTaskSchema, createCourseSchema, createGradeSchema, saveFocusSessionSchema } from '@/lib/validation'
import type { StudyTaskCategory, TicketPriority, FocusMode } from '@/generated/prisma/enums'
import { revalidatePath } from 'next/cache'

export async function createStudyTask(formData: FormData) {
  const { userId } = await requireUser()

  const data = parseForm(createStudyTaskSchema, formData)

  const task = await prisma.studyTask.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      category: data.category as StudyTaskCategory,
      priority: data.priority as TicketPriority,
      dueAt: data.dueAt ?? null,
      courseId: data.courseId ?? null,
      userId,
    },
  })

  revalidatePath('/study')
  return task
}

export async function updateStudyTask(formData: FormData) {
  const { userId } = await requireUser()

  const data = parseForm(updateStudyTaskSchema, formData)

  const existing = await prisma.studyTask.findUnique({ where: { id: data.id } })
  if (!existing || existing.userId !== userId) {
    throw new Error('Task not found.')
  }

  const task = await prisma.studyTask.update({
    where: { id: data.id },
    data: {
      title: data.title,
      description: data.description ?? null,
      category: data.category as StudyTaskCategory,
      priority: data.priority as TicketPriority,
      dueAt: data.dueAt ?? null,
      courseId: data.courseId ?? null,
    },
  })

  revalidatePath('/study')
  return task
}

export async function toggleStudyTaskStatus(formData: FormData) {
  const { userId } = await requireUser()

  const taskId = formData.get('taskId') as string
  if (!taskId) throw new Error('Task ID is required.')

  const existing = await prisma.studyTask.findUnique({ where: { id: taskId } })
  if (!existing || existing.userId !== userId) {
    throw new Error('Task not found.')
  }

  const newStatus = existing.status === 'DONE' ? 'TODO' : 'DONE'
  const completedAt = newStatus === 'DONE' ? new Date() : null

  await prisma.studyTask.update({
    where: { id: taskId },
    data: { status: newStatus, completedAt },
  })

  revalidatePath('/study')
}

export async function deleteStudyTask(formData: FormData) {
  const { userId } = await requireUser()

  const taskId = formData.get('taskId') as string
  if (!taskId) throw new Error('Task ID is required.')

  const existing = await prisma.studyTask.findUnique({ where: { id: taskId } })
  if (!existing || existing.userId !== userId) {
    throw new Error('Task not found.')
  }

  await prisma.studyTask.delete({ where: { id: taskId } })

  revalidatePath('/study')
}

export async function saveFocusSession(formData: FormData) {
  const { userId } = await requireUser()

  const data = parseForm(saveFocusSessionSchema, formData)

  const session = await prisma.focusSession.create({
    data: {
      startedAt: data.startedAt,
      endedAt: data.endedAt,
      durationSeconds: data.durationSeconds,
      mode: data.mode as FocusMode,
      completed: data.completed,
      taskId: data.taskId ?? null,
      userId,
    },
  })

  revalidatePath('/study')
  return session
}

export async function createCourse(formData: FormData) {
  const { userId } = await requireUser()

  const data = parseForm(createCourseSchema, formData)

  const course = await prisma.course.create({
    data: {
      code: data.code,
      name: data.name,
      credits: data.credits,
      term: data.term ?? null,
      color: data.color ?? null,
      userId,
    },
  })

  revalidatePath('/study')
  return course
}

export async function createGrade(formData: FormData) {
  const { userId } = await requireUser()

  const data = parseForm(createGradeSchema, formData)

  // Verify the course belongs to the user
  const course = await prisma.course.findUnique({ where: { id: data.courseId } })
  if (!course || course.userId !== userId) {
    throw new Error('Course not found.')
  }

  const grade = await prisma.grade.create({
    data: {
      name: data.name,
      score: data.score,
      maxScore: data.maxScore ?? 100,
      weight: data.weight ?? null,
      courseId: data.courseId,
      userId,
    },
  })

  revalidatePath('/study')
  return grade
}

export async function deleteGrade(formData: FormData) {
  const { userId } = await requireUser()

  const gradeId = formData.get('gradeId') as string
  if (!gradeId) throw new Error('Grade ID is required.')

  const existing = await prisma.grade.findUnique({ where: { id: gradeId } })
  if (!existing || existing.userId !== userId) {
    throw new Error('Grade not found.')
  }

  await prisma.grade.delete({ where: { id: gradeId } })

  revalidatePath('/study')
}

export async function deleteCourse(formData: FormData) {
  const { userId } = await requireUser()

  const courseId = formData.get('courseId') as string
  if (!courseId) throw new Error('Course ID is required.')

  const existing = await prisma.course.findUnique({ where: { id: courseId } })
  if (!existing || existing.userId !== userId) {
    throw new Error('Course not found.')
  }

  await prisma.course.delete({ where: { id: courseId } })

  revalidatePath('/study')
}
