'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Plus,
  Search,
  CalendarX2,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AppointmentRow = {
  id: string
  title: string
  description: string | null
  status: string
  scheduledAt: string
  durationMinutes: number
  createdAt: string
  updatedAt: string
  student: { id: string; name: string } | null
  staff: { id: string; name: string } | null
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
const statusStyles: Record<string, string> = {
  PENDING:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  CONFIRMED:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  COMPLETED:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}

// ---------------------------------------------------------------------------
// Status border colour (left border like priority in tickets)
// ---------------------------------------------------------------------------
const statusBorder: Record<string, string> = {
  PENDING: 'border-l-yellow-500',
  CONFIRMED: 'border-l-green-500',
  CANCELLED: 'border-l-red-500',
  COMPLETED: 'border-l-blue-500',
}

// ---------------------------------------------------------------------------
// Tab grouping
// ---------------------------------------------------------------------------
function belongsTo(status: string, tab: string): boolean {
  switch (tab) {
    case 'upcoming':
      return status === 'PENDING' || status === 'CONFIRMED'
    case 'past':
      return status === 'COMPLETED' || status === 'CANCELLED'
    default:
      return true
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AppointmentList({
  appointments,
  role,
}: {
  appointments: AppointmentRow[]
  role: string
}) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return appointments.filter((a) => {
      if (!belongsTo(a.status, activeTab)) return false
      if (
        q &&
        !a.title.toLowerCase().includes(q) &&
        !(a.student?.name ?? '').toLowerCase().includes(q) &&
        !(a.staff?.name ?? '').toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [appointments, search, activeTab])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {role === 'STUDENT'
              ? 'My Appointments'
              : role === 'STAFF'
                ? 'My Bookings'
                : 'All Appointments'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {role === 'STUDENT'
              ? 'View and manage your appointments.'
              : role === 'STAFF'
                ? 'View and manage your student bookings.'
                : 'View and manage all appointments on the platform.'}
          </p>
        </div>
        {role === 'STUDENT' && (
          <Button render={<Link href="/appointments/book" />}>
            <Plus className="size-4" />
            Book Appointment
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search appointments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        {['all', 'upcoming', 'past'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarX2 className="size-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {search
                      ? 'No appointments match your search.'
                      : tab === 'all'
                        ? 'No appointments yet.'
                        : `No ${tab} appointments.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((appointment) => (
                  <Link
                    key={appointment.id}
                    href={`/appointments/${appointment.id}`}
                    className="block"
                  >
                    <Card
                      className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 ${
                        statusBorder[appointment.status] ?? 'border-l-gray-300'
                      }`}
                    >
                      <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-4">
                        {/* Title + meta */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {appointment.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              {format(new Date(appointment.scheduledAt), 'MMM d, yyyy h:mm a')}
                            </span>
                            <span>{appointment.durationMinutes} min</span>
                            {role !== 'STUDENT' && appointment.student?.name && (
                              <span>Student: {appointment.student.name}</span>
                            )}
                            {role !== 'STAFF' && appointment.staff?.name && (
                              <span>Staff: {appointment.staff.name}</span>
                            )}
                            <span>
                              {formatDistanceToNow(new Date(appointment.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[appointment.status] ?? statusStyles.PENDING}`}
                        >
                          {statusLabels[appointment.status] ?? appointment.status}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
