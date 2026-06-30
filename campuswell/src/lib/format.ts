/**
 * Shared formatting helpers. Extracted from inline maps in dashboard/page.tsx,
 * appointments-client.tsx, and tickets/[id]/page.tsx.
 */

export function roleLabel(role: string): string {
  if (role === 'ADMIN') return 'Administrator'
  if (role === 'STAFF') return 'Staff'
  return 'Student'
}

export const roleBadgeStyles: Record<string, string> = {
  STUDENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  STAFF: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export const roleLabels: Record<string, string> = {
  STUDENT: 'Student',
  STAFF: 'Staff',
  ADMIN: 'Admin',
}

export const appointmentStatusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

export const appointmentStatusLabels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}
