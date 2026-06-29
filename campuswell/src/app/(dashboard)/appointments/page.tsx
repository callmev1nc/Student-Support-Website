import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { AppointmentList } from './appointments-client'

export default async function AppointmentsPage() {
  const { userId, role } = await requireUser()

  // Fetch appointments based on role
  const where =
    role === 'STUDENT'
      ? { studentId: userId }
      : role === 'STAFF'
        ? { staffId: userId }
        : {} // ADMIN sees all

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { scheduledAt: 'desc' },
    include: {
      student: { select: { id: true, name: true } },
      staff: { select: { id: true, name: true } },
    },
  })

  // Serialize dates for client component
  const serialized = appointments.map(
    (a: {
      id: string
      title: string
      description: string | null
      status: string
      scheduledAt: Date
      durationMinutes: number
      createdAt: Date
      updatedAt: Date
      student: { id: string; name: string } | null
      staff: { id: string; name: string } | null
    }) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      status: a.status,
      scheduledAt: a.scheduledAt.toISOString(),
      durationMinutes: a.durationMinutes,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      student: a.student ? { id: a.student.id, name: a.student.name } : null,
      staff: a.staff ? { id: a.staff.id, name: a.staff.name } : null,
    }),
  )

  return <AppointmentList appointments={serialized} role={role} />
}
