export type { Role, TicketCategory, TicketPriority, TicketStatus, AppointmentStatus, NotificationType } from '@/generated/prisma/enums'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'STAFF' | 'ADMIN'
  avatarUrl?: string | null
}

export interface DashboardStats {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  upcomingAppointments: number
  unreadMessages: number
  unreadNotifications: number
}
