/**
 * Shared date/time helpers for appointment booking.
 * Extracted from booking-wizard.tsx and appointments.ts actions.
 */

export const SLOT_START_HOUR = 9
export const SLOT_END_HOUR = 17
export const SLOT_INTERVAL_MINUTES = 30

/** Conflict window (half-slot buffer) in ms — must match SLOT_INTERVAL_MINUTES. */
export const CONFLICT_WINDOW_MS = (SLOT_INTERVAL_MINUTES - 1) * 60 * 1000

/** Generate all time slots for a given date. */
export function generateTimeSlots(date: Date): Date[] {
  const slots: Date[] = []
  const base = new Date(date)
  base.setHours(SLOT_START_HOUR, 0, 0, 0)

  while (base.getHours() < SLOT_END_HOUR) {
    slots.push(new Date(base))
    base.setMinutes(base.getMinutes() + SLOT_INTERVAL_MINUTES)
  }

  return slots
}

/** Format a Date to a short time string like "9:00 AM". */
export function formatSlotTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Check if a slot is in the past. */
export function isSlotInPast(slot: Date): boolean {
  return slot <= new Date()
}
