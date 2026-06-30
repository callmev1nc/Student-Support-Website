'use server'

import { prisma } from '@/lib/prisma'
import { requireUser, requireRole } from '@/lib/session'
import { bookAppointmentSchema, rescheduleAppointmentSchema, parseForm } from '@/lib/validation'
import { CONFLICT_WINDOW_MS } from '@/lib/datetime'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ---------------------------------------------------------------------------
// Book a new appointment (student only)
// ---------------------------------------------------------------------------
export async function bookAppointment(formData: FormData) {
  const { userId, role } = await requireUser()

  if (role !== 'STUDENT') {
    throw new Error('Only students can book appointments.')
  }

  const { staffId, scheduledAt: scheduledDate, title, description: rawDescription } = parseForm(bookAppointmentSchema, formData)
  const description = rawDescription || null

  // Verify the staff member exists and has the STAFF role
  const staffUser = await prisma.user.findUnique({
    where: { id: staffId },
    select: { id: true, role: true, name: true },
  })

  if (!staffUser || staffUser.role !== 'STAFF') {
    throw new Error('Invalid staff member selected.')
  }

  // Check for scheduling conflicts (same staff, overlapping time)
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      staffId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      scheduledAt: {
        gte: new Date(scheduledDate.getTime() - CONFLICT_WINDOW_MS),
        lte: new Date(scheduledDate.getTime() + CONFLICT_WINDOW_MS),
      },
    },
  })

  if (conflictingAppointment) {
    throw new Error('This time slot is no longer available. Please choose another time.')
  }

  const appointment = await prisma.appointment.create({
    data: {
      title,
      description,
      scheduledAt: scheduledDate,
      durationMinutes: 30,
      studentId: userId,
      staffId,
    },
    include: {
      student: { select: { id: true, name: true } },
      staff: { select: { id: true, name: true } },
    },
  })

  // Notify the staff member about the new booking
  await prisma.notification.create({
    data: {
      title: 'New Appointment Booking',
      message: `${appointment.student.name} has booked an appointment: "${title}" on ${scheduledDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}.`,
      type: 'APPOINTMENT',
      link: `/appointments/${appointment.id}`,
      userId: staffId,
    },
  })

  revalidatePath('/appointments')
  redirect('/appointments')
}

// ---------------------------------------------------------------------------
// Confirm a pending appointment (staff only)
// ---------------------------------------------------------------------------
export async function confirmAppointment(formData: FormData) {
  const { userId, role } = await requireUser()

  if (role !== 'STAFF' && role !== 'ADMIN') {
    throw new Error('Only staff can confirm appointments.')
  }

  const appointmentId = formData.get('appointmentId') as string

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      student: { select: { id: true, name: true } },
      staff: { select: { id: true } },
    },
  })

  if (!appointment) {
    throw new Error('Appointment not found.')
  }

  // Verify the staff member is the one assigned (or admin)
  if (role !== 'ADMIN' && appointment.staff.id !== userId) {
    throw new Error('You can only confirm your own appointments.')
  }

  if (appointment.status !== 'PENDING') {
    throw new Error('Only pending appointments can be confirmed.')
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CONFIRMED' },
  })

  // Notify the student
  await prisma.notification.create({
    data: {
      title: 'Appointment Confirmed',
      message: `Your appointment "${appointment.title}" has been confirmed by staff.`,
      type: 'APPOINTMENT',
      link: `/appointments/${appointmentId}`,
      userId: appointment.student.id,
    },
  })

  revalidatePath('/appointments')
  revalidatePath(`/appointments/${appointmentId}`)
}

// ---------------------------------------------------------------------------
// Cancel an appointment (student owner or assigned staff or admin)
// ---------------------------------------------------------------------------
export async function cancelAppointment(formData: FormData) {
  const { userId, role } = await requireUser()

  const appointmentId = formData.get('appointmentId') as string

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      student: { select: { id: true, name: true } },
      staff: { select: { id: true, name: true } },
    },
  })

  if (!appointment) {
    throw new Error('Appointment not found.')
  }

  const isStudent = appointment.student.id === userId
  const isStaff = appointment.staff.id === userId
  const isAdmin = role === 'ADMIN'

  if (!isStudent && !isStaff && !isAdmin) {
    throw new Error('You do not have permission to cancel this appointment.')
  }

  if (appointment.status === 'CANCELLED') {
    throw new Error('This appointment is already cancelled.')
  }

  if (appointment.status === 'COMPLETED') {
    throw new Error('Completed appointments cannot be cancelled.')
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' },
  })

  // Notify the other party
  const notifications: { title: string; message: string; type: 'APPOINTMENT'; link: string; userId: string }[] = []

  // Notify student if someone else cancelled
  if (!isStudent) {
    notifications.push({
      title: 'Appointment Cancelled',
      message: `Your appointment "${appointment.title}" has been cancelled.`,
      type: 'APPOINTMENT',
      link: `/appointments/${appointmentId}`,
      userId: appointment.student.id,
    })
  }

  // Notify staff if student cancelled
  if (isStudent) {
    notifications.push({
      title: 'Appointment Cancelled by Student',
      message: `The appointment "${appointment.title}" has been cancelled by ${appointment.student.name}.`,
      type: 'APPOINTMENT',
      link: `/appointments/${appointmentId}`,
      userId: appointment.staff.id,
    })
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications })
  }

  revalidatePath('/appointments')
  revalidatePath(`/appointments/${appointmentId}`)
}

// ---------------------------------------------------------------------------
// Mark appointment as completed (staff only)
// ---------------------------------------------------------------------------
export async function completeAppointment(formData: FormData) {
  const { userId, role } = await requireRole('STAFF', 'ADMIN')

  const appointmentId = formData.get('appointmentId') as string

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      student: { select: { id: true, name: true } },
      staff: { select: { id: true } },
    },
  })

  if (!appointment) {
    throw new Error('Appointment not found.')
  }

  // Verify the staff member is the one assigned (or admin)
  if (role !== 'ADMIN' && appointment.staff.id !== userId) {
    throw new Error('You can only complete your own appointments.')
  }

  if (appointment.status !== 'CONFIRMED') {
    throw new Error('Only confirmed appointments can be marked as completed.')
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'COMPLETED' },
  })

  // Notify the student
  await prisma.notification.create({
    data: {
      title: 'Appointment Completed',
      message: `Your appointment "${appointment.title}" has been marked as completed.`,
      type: 'APPOINTMENT',
      link: `/appointments/${appointmentId}`,
      userId: appointment.student.id,
    },
  })

  revalidatePath('/appointments')
  revalidatePath(`/appointments/${appointmentId}`)
}

// ---------------------------------------------------------------------------
// Reschedule an appointment (student only: cancel + rebook)
// ---------------------------------------------------------------------------
export async function rescheduleAppointment(formData: FormData) {
  const { userId, role } = await requireUser()

  if (role !== 'STUDENT') {
    throw new Error('Only students can reschedule appointments.')
  }

  const { appointmentId, newScheduledAt: newDate } = parseForm(rescheduleAppointmentSchema, formData)

  const existing = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      student: { select: { id: true, name: true } },
      staff: { select: { id: true, name: true } },
    },
  })

  if (!existing) {
    throw new Error('Appointment not found.')
  }

  if (existing.student.id !== userId) {
    throw new Error('You can only reschedule your own appointments.')
  }

  if (existing.status !== 'PENDING' && existing.status !== 'CONFIRMED') {
    throw new Error('Only pending or confirmed appointments can be rescheduled.')
  }

  // Check for scheduling conflicts at the new time
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      staffId: existing.staffId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      id: { not: appointmentId },
      scheduledAt: {
        gte: new Date(newDate.getTime() - CONFLICT_WINDOW_MS),
        lte: new Date(newDate.getTime() + CONFLICT_WINDOW_MS),
      },
    },
  })

  if (conflictingAppointment) {
    throw new Error('The selected time slot is not available. Please choose another time.')
  }

  // Cancel the old appointment and create a new one in a transaction
  const newAppointment = await prisma.$transaction(async (tx) => {
    // Cancel the existing appointment
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    })

    // Create the new appointment
    return tx.appointment.create({
      data: {
        title: existing.title,
        description: existing.description,
        scheduledAt: newDate,
        durationMinutes: existing.durationMinutes,
        studentId: userId,
        staffId: existing.staffId,
      },
      include: {
        student: { select: { id: true, name: true } },
        staff: { select: { id: true, name: true } },
      },
    })
  })

  // Notify the staff member about the reschedule
  await prisma.notification.create({
    data: {
      title: 'Appointment Rescheduled',
      message: `${newAppointment.student.name} has rescheduled "${existing.title}" to ${newDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}.`,
      type: 'APPOINTMENT',
      link: `/appointments/${newAppointment.id}`,
      userId: existing.staff.id,
    },
  })

  revalidatePath('/appointments')
  revalidatePath(`/appointments/${appointmentId}`)
  redirect('/appointments')
}
