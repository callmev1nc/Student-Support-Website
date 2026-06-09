import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BookingWizard } from './booking-wizard'

export default async function BookAppointmentPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const role = (session.user as Record<string, unknown>).role as string

  if (role !== 'STUDENT') {
    redirect('/appointments')
  }

  // Fetch all staff members for the student to choose from
  const staffMembers = await prisma.user.findMany({
    where: { role: 'STAFF' },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
    },
    orderBy: { name: 'asc' },
  })

  // Serialize for client component
  const serializedStaff = staffMembers.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    bio: s.bio,
  }))

  return <BookingWizard staffMembers={serializedStaff} />
}
