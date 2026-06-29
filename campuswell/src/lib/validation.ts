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

/** First human-readable error message from a failed safeParse, for JSON 400s. */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid input.'
}
