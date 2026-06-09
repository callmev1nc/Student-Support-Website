'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, CalendarClock } from 'lucide-react'
import {
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
} from '@/app/actions/appointments'

// ---------------------------------------------------------------------------
// Confirm Appointment (staff / admin)
// ---------------------------------------------------------------------------
export function ConfirmButton({ appointmentId }: { appointmentId: string }) {
  const [pending, setPending] = useState(false)

  async function handleConfirm() {
    setPending(true)
    const fd = new FormData()
    fd.set('appointmentId', appointmentId)
    await confirmAppointment(fd)
    setPending(false)
  }

  return (
    <Button size="sm" onClick={handleConfirm} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CheckCircle2 className="size-4" />
      )}
      Confirm
    </Button>
  )
}

// ---------------------------------------------------------------------------
// Cancel Appointment (student, staff, or admin)
// ---------------------------------------------------------------------------
export function CancelButton({ appointmentId }: { appointmentId: string }) {
  const [pending, setPending] = useState(false)

  async function handleCancel() {
    setPending(true)
    const fd = new FormData()
    fd.set('appointmentId', appointmentId)
    await cancelAppointment(fd)
    setPending(false)
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleCancel} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <XCircle className="size-4" />
      )}
      Cancel Appointment
    </Button>
  )
}

// ---------------------------------------------------------------------------
// Complete Appointment (staff / admin)
// ---------------------------------------------------------------------------
export function CompleteButton({ appointmentId }: { appointmentId: string }) {
  const [pending, setPending] = useState(false)

  async function handleComplete() {
    setPending(true)
    const fd = new FormData()
    fd.set('appointmentId', appointmentId)
    await completeAppointment(fd)
    setPending(false)
  }

  return (
    <Button size="sm" onClick={handleComplete} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CheckCircle2 className="size-4" />
      )}
      Mark Completed
    </Button>
  )
}

// ---------------------------------------------------------------------------
// Reschedule Appointment (student only)
// ---------------------------------------------------------------------------
export function RescheduleButton({ appointmentId }: { appointmentId: string }) {
  const [pending, setPending] = useState(false)

  async function handleReschedule() {
    setPending(true)
    // Redirect to booking page with context (simple approach: go back to book)
    window.location.href = '/appointments/book'
  }

  return (
    <Button variant="outline" size="sm" onClick={handleReschedule} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CalendarClock className="size-4" />
      )}
      Reschedule
    </Button>
  )
}
