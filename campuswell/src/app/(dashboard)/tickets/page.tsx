import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { TicketList } from './tickets-client'

export default async function TicketsPage() {
  const { userId, role } = await requireUser()

  // Fetch tickets based on role
  const where =
    role === 'STUDENT'
      ? { studentId: userId }
      : role === 'STAFF'
        ? { OR: [{ assignedToId: userId }, { assignedToId: null }] }
        : {} // ADMIN sees all

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  })

  // Serialize dates for client component
  const serialized = tickets.map((t: { id: string; subject: string; category: string; priority: string; status: string; createdAt: Date; student: { name: string } | null; assignedTo: { name: string } | null }) => ({
    id: t.id,
    subject: t.subject,
    category: t.category,
    priority: t.priority,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    student: t.student ? { name: t.student.name } : null,
    assignedTo: t.assignedTo ? { name: t.assignedTo.name } : null,
  }))

  return <TicketList tickets={serialized} role={role} />
}
