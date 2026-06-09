'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  CalendarDays,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { bookAppointment } from '@/app/actions/appointments'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type StaffMember = {
  id: string
  name: string
  email: string
  bio: string | null
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SLOT_START_HOUR = 9 // 9:00 AM
const SLOT_END_HOUR = 17 // 5:00 PM
const SLOT_INTERVAL_MINUTES = 30

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate all 30-minute slots for a given date */
function generateTimeSlots(date: Date): Date[] {
  const slots: Date[] = []
  const base = new Date(date)
  base.setHours(SLOT_START_HOUR, 0, 0, 0)

  while (base.getHours() < SLOT_END_HOUR) {
    slots.push(new Date(base))
    base.setMinutes(base.getMinutes() + SLOT_INTERVAL_MINUTES)
  }

  return slots
}

/** Format a Date to a short time string like "9:00 AM" */
function formatSlotTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Check if a slot is in the past */
function isSlotInPast(slot: Date): boolean {
  return slot <= new Date()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function BookingWizard({
  staffMembers,
}: {
  staffMembers: StaffMember[]
}) {
  const router = useRouter()

  // Step state
  const [step, setStep] = useState(1)

  // Form state
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0], // today in YYYY-MM-DD
  )
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Submission state
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calendar navigation
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  // Derived: available time slots for the selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return []
    const date = new Date(selectedDate + 'T00:00:00')
    return generateTimeSlots(date)
  }, [selectedDate])

  // Derived: selected staff object
  const selectedStaff = useMemo(
    () => staffMembers.find((s) => s.id === selectedStaffId) ?? null,
    [staffMembers, selectedStaffId],
  )

  // Derived: selected datetime
  const selectedDateTime = useMemo(() => {
    if (!selectedDate || !selectedTime) return null
    return new Date(`${selectedDate}T${selectedTime}`)
  }, [selectedDate, selectedTime])

  // Derived: calendar days for the current month view
  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = firstDay.getDay() // 0=Sun
    const totalDays = lastDay.getDate()

    const days: { date: string; dayOfMonth: number; isCurrentMonth: boolean; isPast: boolean }[] = []

    // Padding for previous month
    const prevMonthLast = new Date(year, month, 0).getDate()
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLast - i)
      days.push({
        date: d.toISOString().split('T')[0],
        dayOfMonth: prevMonthLast - i,
        isCurrentMonth: false,
        isPast: d < new Date(new Date().toISOString().split('T')[0]),
      })
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      days.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        dayOfMonth: i,
        isCurrentMonth: true,
        isPast: d < today,
      })
    }

    // Padding for next month
    const remaining = 42 - days.length // 6 rows of 7
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      days.push({
        date: d.toISOString().split('T')[0],
        dayOfMonth: i,
        isCurrentMonth: false,
        isPast: false,
      })
    }

    return days
  }, [calendarMonth])

  // Month label
  const monthLabel = useMemo(() => {
    const { year, month } = calendarMonth
    return new Date(year, month).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    })
  }, [calendarMonth])

  // Navigation helpers
  function prevMonth() {
    setCalendarMonth((prev) => {
      const m = prev.month === 0 ? 11 : prev.month - 1
      const y = prev.month === 0 ? prev.year - 1 : prev.year
      return { year: y, month: m }
    })
  }

  function nextMonth() {
    setCalendarMonth((prev) => {
      const m = prev.month === 11 ? 0 : prev.month + 1
      const y = prev.month === 11 ? prev.year + 1 : prev.year
      return { year: y, month: m }
    })
  }

  // Can proceed checks
  const canProceedStep1 = !!selectedStaffId
  const canProceedStep2 = !!selectedDate
  const canProceedStep3 = !!selectedTime
  const canSubmit = title.trim().length >= 3

  // Submit
  async function handleSubmit() {
    if (!selectedStaffId || !selectedDateTime || !title.trim()) return

    setError(null)
    setPending(true)

    try {
      const fd = new FormData()
      fd.set('staffId', selectedStaffId)
      fd.set('scheduledAt', selectedDateTime.toISOString())
      fd.set('title', title.trim())
      fd.set('description', description.trim())
      await bookAppointment(fd)
    } catch (err) {
      setPending(false)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  // Step indicator
  const steps = [
    { number: 1, label: 'Staff' },
    { number: 2, label: 'Date' },
    { number: 3, label: 'Time' },
    { number: 4, label: 'Confirm' },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Book an Appointment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule a session with a support staff member.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2">
            <div
              className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                step >= s.number
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s.number ? (
                <CheckCircle2 className="size-4" />
              ) : (
                s.number
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                step >= s.number ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="mx-1 h-px w-6 bg-border sm:w-10" />
            )}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Select Staff */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4" />
              Select a Staff Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staffMembers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No staff members are currently available.
              </p>
            ) : (
              <div className="space-y-2">
                {staffMembers.map((staff) => (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedStaffId === staff.id
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-border hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {staff.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{staff.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {staff.email}
                        </p>
                        {staff.bio && (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {staff.bio}
                          </p>
                        )}
                      </div>
                      {selectedStaffId === staff.id && (
                        <CheckCircle2 className="size-5 shrink-0 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
              >
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Date */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4" />
              Select a Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Calendar navigation */}
            <div className="flex items-center justify-between mb-3">
              <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm font-semibold">{monthLabel}</span>
              <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div
                  key={d}
                  className="flex items-center justify-center text-xs font-medium text-muted-foreground h-8"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const isSelected = day.date === selectedDate
                const isToday =
                  day.date === new Date().toISOString().split('T')[0]

                return (
                  <button
                    key={day.date}
                    type="button"
                    disabled={day.isPast}
                    onClick={() => {
                      setSelectedDate(day.date)
                      setSelectedTime(null) // reset time when date changes
                    }}
                    className={`flex h-8 items-center justify-center rounded-md text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : isToday
                          ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/20'
                          : 'hover:bg-muted'
                    } ${!day.isCurrentMonth ? 'text-muted-foreground/50' : ''}`}
                  >
                    {day.dayOfMonth}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
              >
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select Time */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4" />
              Select a Time Slot
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              {' '}
({SLOT_INTERVAL_MINUTES}-minute sessions)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {timeSlots.map((slot) => {
                const timeStr = formatSlotTime(slot)
                const slotKey = `${String(slot.getHours()).padStart(2, '0')}:${String(slot.getMinutes()).padStart(2, '0')}`
                const isSelected = selectedTime === slotKey
                const isPast = isSlotInPast(slot)

                return (
                  <button
                    key={slotKey}
                    type="button"
                    disabled={isPast}
                    onClick={() => setSelectedTime(slotKey)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {timeStr}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
              >
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirm Booking */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="size-4" />
              Confirm Your Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Review details */}
            <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Staff Member</p>
                  <p className="text-sm font-medium">{selectedStaff?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedStaff?.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium">
                    {selectedDateTime?.toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium">
                    {selectedDateTime?.toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}{' '}
                    ({SLOT_INTERVAL_MINUTES} minutes)
                  </p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Appointment Title</Label>
              <Input
                id="title"
                placeholder="e.g., Academic Advising Session"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                Briefly describe the purpose of this appointment (min 3 characters).
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description{' '}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Add any additional details or questions for the staff member..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={pending}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                disabled={pending}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={pending || !canSubmit}
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                Confirm Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
