import { z } from 'zod'

// Centralized input schemas. Messages intentionally match the previous
// hand-rolled checks so user-facing behavior is unchanged.

export const createTicketSchema = z.object({
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters long.'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters long.'),
  category: z.enum([
    'ACADEMIC',
    'MENTAL_HEALTH',
    'TECHNICAL',
    'BULLYING',
    'ATTENDANCE',
    'FINANCIAL',
    'GENERAL',
  ]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
})

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum([
    'NEW',
    'IN_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'WAITING',
    'RESOLVED',
    'CLOSED',
  ]),
})

export const addCommentSchema = z.object({
  ticketId: z.string().min(1),
  content: z.string().trim().min(1, 'Comment cannot be empty.'),
})

export const bookAppointmentSchema = z.object({
  staffId: z.string().trim().min(1, 'Please select a staff member.'),
  scheduledAt: z
    .coerce
    .date()
    .refine((d) => !Number.isNaN(d.getTime()) && d > new Date(), {
      message: 'Appointment must be a valid date and time in the future.',
    }),
  title: z.string().trim().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().trim().optional(),
})

export const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string().min(1),
  newScheduledAt: z
    .coerce
    .date()
    .refine((d) => !Number.isNaN(d.getTime()) && d > new Date(), {
      message: 'Appointment must be a valid date and time in the future.',
    }),
})

export const messageSendSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().trim().min(1),
})

export const messageStartSchema = z.object({
  recipientId: z.string().min(1),
  content: z.string().trim().min(1),
})

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long.'),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long.'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters long.'),
    confirmPassword: z.string().min(1),
    role: z.enum(['STUDENT', 'STAFF']),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

/**
 * Parse a FormData payload against a schema, throwing the first validation
 * message on failure. For server actions that surface thrown errors to the UI.
 */
export function parseForm<T>(schema: z.ZodType<T>, formData: FormData): T {
  const result = schema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? 'Invalid input.')
  }
  return result.data
}

// ── Study / Academic schemas ────────────────────────────────────────────────

export const createStudyTaskSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().trim().optional(),
  category: z.enum(['HOMEWORK', 'ASSIGNMENT', 'QUIZ', 'EXAM_PREP', 'READING', 'PROJECT', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueAt: z.coerce.date().optional(),
  courseId: z.string().optional(),
})

export const updateStudyTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().trim().optional().nullable(),
  category: z.enum(['HOMEWORK', 'ASSIGNMENT', 'QUIZ', 'EXAM_PREP', 'READING', 'PROJECT', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueAt: z.coerce.date().optional().nullable(),
  courseId: z.string().optional().nullable(),
})

export const createCourseSchema = z.object({
  code: z.string().trim().min(2, 'Course code must be at least 2 characters long.'),
  name: z.string().trim().min(2, 'Course name must be at least 2 characters long.'),
  credits: z.coerce.number().int().min(1).max(20),
  term: z.string().trim().optional(),
  color: z.string().trim().optional(),
})

export const createGradeSchema = z.object({
  name: z.string().trim().min(2, 'Grade name must be at least 2 characters long.'),
  score: z.coerce.number().min(0, 'Score must be a positive number.'),
  maxScore: z.coerce.number().min(1, 'Max score must be at least 1.').default(100),
  weight: z.coerce.number().min(0).max(100).optional(),
  courseId: z.string().min(1, 'Please select a course.'),
}).refine((d) => d.score <= d.maxScore, {
  message: 'Score cannot exceed max score.',
  path: ['score'],
})

export const saveFocusSessionSchema = z.object({
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
  durationSeconds: z.coerce.number().int().min(1).max(7200),
  mode: z.enum(['POMODORO', 'SHORT_BREAK', 'LONG_BREAK']),
  completed: z.boolean().default(true),
  taskId: z.string().optional().nullable(),
})

/** First human-readable error message from a failed safeParse, for JSON 400s. */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid input.'
}
