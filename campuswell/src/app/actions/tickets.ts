'use server'

import { prisma } from '@/lib/prisma'
import type { TicketCategory, TicketPriority, TicketStatus, NotificationType } from '@/generated/prisma/enums'
import { requireUser, requireRole } from '@/lib/session'
import { createTicketSchema, updateTicketStatusSchema, addCommentSchema, parseForm } from '@/lib/validation'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ---------------------------------------------------------------------------
// Create a new support ticket
// ---------------------------------------------------------------------------
export async function createTicket(formData: FormData) {
  const { userId, role } = await requireUser()

  const { subject, description, category, priority } = parseForm(createTicketSchema, formData)

  const ticket = await prisma.ticket.create({
    data: {
      subject,
      description,
      category: category as TicketCategory,
      priority: priority as TicketPriority,
      studentId: userId,
    },
  })

  // Notify all admin users about the new ticket
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  })

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin: { id: string }) => ({
        title: 'New Support Ticket',
        message: `Ticket "${subject}" has been submitted.`,
        type: 'TICKET',
        link: `/tickets/${ticket.id}`,
        userId: admin.id,
      })),
    })
  }

  revalidatePath('/tickets')
  redirect('/tickets')
}

// ---------------------------------------------------------------------------
// Update ticket status (staff / admin only)
// ---------------------------------------------------------------------------
export async function updateTicketStatus(formData: FormData) {
  await requireRole('STAFF', 'ADMIN')

  const { ticketId, status } = parseForm(updateTicketStatusSchema, formData)

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: status as TicketStatus },
    include: { student: { select: { id: true } } },
  })

  // Notify the student who owns the ticket
  await prisma.notification.create({
    data: {
      title: 'Ticket Status Updated',
      message: `Your ticket "${ticket.subject}" status has been updated to ${status.replace('_', ' ')}.`,
      type: 'TICKET',
      link: `/tickets/${ticketId}`,
      userId: ticket.student.id,
    },
  })

  revalidatePath('/tickets')
  revalidatePath(`/tickets/${ticketId}`)
}

// ---------------------------------------------------------------------------
// Assign a ticket to a staff member (staff / admin only)
// ---------------------------------------------------------------------------
export async function assignTicket(formData: FormData) {
  const { userId } = await requireRole('STAFF', 'ADMIN')

  const ticketId = formData.get('ticketId') as string
  const assignToId = (formData.get('assignToId') as string) || userId

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      assignedToId: assignToId,
      status: 'ASSIGNED',
    },
    include: { student: { select: { id: true } } },
  })

  // Notify the student
  await prisma.notification.create({
    data: {
      title: 'Ticket Assigned',
      message: `Your ticket "${ticket.subject}" has been assigned to a staff member.`,
      type: 'TICKET',
      link: `/tickets/${ticketId}`,
      userId: ticket.student.id,
    },
  })

  // Notify the assigned staff member (if different from current user)
  if (assignToId !== userId) {
    await prisma.notification.create({
      data: {
        title: 'Ticket Assigned to You',
        message: `Ticket "${ticket.subject}" has been assigned to you.`,
        type: 'TICKET',
        link: `/tickets/${ticketId}`,
        userId: assignToId,
      },
    })
  }

  revalidatePath('/tickets')
  revalidatePath(`/tickets/${ticketId}`)
}

// ---------------------------------------------------------------------------
// Add a comment to a ticket
// ---------------------------------------------------------------------------
export async function addComment(formData: FormData) {
  const { userId, role } = await requireUser()

  const { ticketId, content } = parseForm(addCommentSchema, formData)

  // Verify the user has access to this ticket
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      student: { select: { id: true } },
      assignedTo: { select: { id: true } },
    },
  })

  if (!ticket) {
    throw new Error('Ticket not found.')
  }

  const isOwner = ticket.student.id === userId
  const isAssigned = ticket.assignedTo?.id === userId
  const isAdmin = role === 'ADMIN'

  if (!isOwner && !isAssigned && !isAdmin) {
    throw new Error('You do not have access to this ticket.')
  }

  await prisma.comment.create({
    data: {
      content,
      ticketId,
      authorId: userId,
    },
  })

  // Notify relevant parties about the new comment
  const notifications: { title: string; message: string; type: 'TICKET'; link: string; userId: string }[] = []

  // Notify the ticket owner (if commenter is not the owner)
  if (userId !== ticket.student.id) {
    notifications.push({
      title: 'New Comment on Your Ticket',
      message: `A comment was added to your ticket "${ticket.subject}".`,
      type: 'TICKET',
      link: `/tickets/${ticketId}`,
      userId: ticket.student.id,
    })
  }

  // Notify the assigned staff (if commenter is not the assigned staff)
  if (ticket.assignedTo && userId !== ticket.assignedTo.id) {
    notifications.push({
      title: 'New Comment on Assigned Ticket',
      message: `A comment was added to ticket "${ticket.subject}".`,
      type: 'TICKET',
      link: `/tickets/${ticketId}`,
      userId: ticket.assignedTo.id,
    })
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications })
  }

  revalidatePath(`/tickets/${ticketId}`)
}

// ---------------------------------------------------------------------------
// Close a ticket (student owner, staff, or admin)
// ---------------------------------------------------------------------------
export async function closeTicket(formData: FormData) {
  const { userId, role } = await requireUser()

  const ticketId = formData.get('ticketId') as string

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      student: { select: { id: true } },
      assignedTo: { select: { id: true } },
    },
  })

  if (!ticket) {
    throw new Error('Ticket not found.')
  }

  const isOwner = ticket.student.id === userId
  const isAssigned = ticket.assignedTo?.id === userId
  const isStaffOrAdmin = role === 'STAFF' || role === 'ADMIN'

  if (!isOwner && !isAssigned && !isStaffOrAdmin) {
    throw new Error('You do not have permission to close this ticket.')
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'CLOSED' },
  })

  // Notify the student if someone else closed the ticket
  if (userId !== ticket.student.id) {
    await prisma.notification.create({
      data: {
        title: 'Ticket Closed',
        message: `Your ticket "${ticket.subject}" has been closed.`,
        type: 'TICKET',
        link: `/tickets/${ticketId}`,
        userId: ticket.student.id,
      },
    })
  }

  // Notify the assigned staff if the student closed it
  if (isOwner && ticket.assignedTo && userId !== ticket.assignedTo.id) {
    await prisma.notification.create({
      data: {
        title: 'Ticket Closed by Student',
        message: `Ticket "${ticket.subject}" has been closed by the student.`,
        type: 'TICKET',
        link: `/tickets/${ticketId}`,
        userId: ticket.assignedTo.id,
      },
    })
  }

  revalidatePath('/tickets')
  revalidatePath(`/tickets/${ticketId}`)
}
