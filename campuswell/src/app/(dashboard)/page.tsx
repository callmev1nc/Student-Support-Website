import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { TicketStatusBadge } from "@/components/ticket-status-badge"
import { PriorityBadge } from "@/components/priority-badge"
import {
  Ticket,
  CheckCircle2,
  CalendarDays,
  MessageSquare,
  Plus,
  CalendarPlus,
  Send,
  Clock,
  ListTodo,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function DashboardPage() {
  const session = await requireUser()
  const { userId, role } = session

  // --- Fetch stats based on role ---
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart.getTime() + 86_400_000)

  const [openTickets, resolvedTickets, upcomingAppointments, unreadMessages, dueTodayTasks] =
    await Promise.all([
      // Open tickets count
      prisma.ticket.count({
        where: {
          status: { in: ["NEW", "IN_REVIEW", "ASSIGNED", "IN_PROGRESS", "WAITING"] },
          ...(role === "STUDENT" ? { studentId: userId } : {}),
          ...(role === "STAFF" ? { assignedToId: userId } : {}),
        },
      }),

      // Resolved tickets count
      prisma.ticket.count({
        where: {
          status: { in: ["RESOLVED", "CLOSED"] },
          ...(role === "STUDENT" ? { studentId: userId } : {}),
          ...(role === "STAFF" ? { assignedToId: userId } : {}),
        },
      }),

      // Upcoming appointments
      prisma.appointment.count({
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          scheduledAt: { gte: new Date() },
          ...(role === "STUDENT"
            ? { studentId: userId }
            : role === "STAFF"
              ? { staffId: userId }
              : {}),
        },
      }),

      // Unread messages count
      prisma.message.count({
        where: {
          readAt: null,
          senderId: { not: userId },
          conversation: {
            OR: [
              { participantAId: userId },
              { participantBId: userId },
            ],
          },
        },
      }),

      // Due today study tasks (students only)
      role === 'STUDENT'
        ? prisma.studyTask.count({
            where: {
              userId,
              dueAt: { gte: todayStart, lt: todayEnd },
              status: { in: ['TODO', 'IN_PROGRESS'] },
            },
          })
        : Promise.resolve(0),
    ])

  // --- Recent tickets ---
  const recentTickets = await prisma.ticket.findMany({
    where: {
      ...(role === "STUDENT" ? { studentId: userId } : {}),
      ...(role === "STAFF" ? { assignedToId: userId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      student: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  })

  // --- Recent appointments ---
  const recentAppointments = await prisma.appointment.findMany({
    where: {
      ...(role === "STUDENT"
        ? { studentId: userId }
        : role === "STAFF"
          ? { staffId: userId }
          : {}),
    },
    orderBy: { scheduledAt: "desc" },
    take: 5,
    include: {
      student: { select: { name: true } },
      staff: { select: { name: true } },
    },
  })

  // --- Greeting ---
  const firstName = session.user.name?.split(" ")[0] ?? "User"
  const roleLabel =
    role === "ADMIN" ? "Administrator" : role === "STAFF" ? "Staff" : "Student"

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening on the platform ({roleLabel} view)
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Ticket}
          label="Open Tickets"
          value={openTickets}
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={resolvedTickets}
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming Appointments"
          value={upcomingAppointments}
        />
        <StatCard
          icon={MessageSquare}
          label="Unread Messages"
          value={unreadMessages}
        />
        {role === 'STUDENT' && (
          <StatCard
            icon={ListTodo}
            label="Due Today"
            value={dueTodayTasks}
          />
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/tickets/new" />}>
            <Plus className="size-4" />
            New Ticket
          </Button>
          {(role === "STUDENT" || role === "ADMIN") && (
            <Button variant="outline" render={<Link href="/appointments/book" />}>
              <CalendarPlus className="size-4" />
              Book Appointment
            </Button>
          )}
          <Button variant="outline" render={<Link href="/messages" />}>
            <Send className="size-4" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Two-column: Recent tickets + Recent appointments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent tickets */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Recent Tickets
              </CardTitle>
              <Button variant="ghost" size="xs" render={<Link href="/tickets" />}>
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No tickets yet
              </p>
            ) : (
              <ul className="divide-y dark:divide-slate-800">
                {recentTickets.map((ticket) => (
                  <li key={ticket.id}>
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="flex flex-col gap-1.5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center sm:gap-3 sm:px-1"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {role === "STUDENT" && ticket.assignedTo?.name
                            ? `Assigned to ${ticket.assignedTo.name}`
                            : role !== "STUDENT" && ticket.student?.name
                              ? `By ${ticket.student.name}`
                              : ""}
                          {" "}
                          {formatDistanceToNow(new Date(ticket.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <PriorityBadge priority={ticket.priority} />
                        <TicketStatusBadge status={ticket.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent appointments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Recent Appointments
              </CardTitle>
              <Button variant="ghost" size="xs" render={<Link href="/appointments" />}>
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No appointments yet
              </p>
            ) : (
              <ul className="divide-y dark:divide-slate-800">
                {recentAppointments.map((appt) => {
                  const statusStyles: Record<string, string> = {
                    PENDING:
                      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    CONFIRMED:
                      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    CANCELLED:
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                    COMPLETED:
                      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                  }
                  const statusLabels: Record<string, string> = {
                    PENDING: "Pending",
                    CONFIRMED: "Confirmed",
                    CANCELLED: "Cancelled",
                    COMPLETED: "Completed",
                  }

                  return (
                    <li key={appt.id}>
                      <div className="flex items-center gap-3 py-3 px-1">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#C8102E]/10 text-[#C8102E] dark:bg-[#C8102E]/20 dark:text-[#ff6b6b]">
                          <Clock className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {appt.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(appt.scheduledAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              },
                            )}
                            {" "}
                            {role === "STUDENT" && appt.staff?.name
                              ? `with ${appt.staff.name}`
                              : role === "STAFF" && appt.student?.name
                                ? `with ${appt.student.name}`
                                : ""}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[appt.status] ?? statusStyles.PENDING}`}
                        >
                          {statusLabels[appt.status] ?? appt.status}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
