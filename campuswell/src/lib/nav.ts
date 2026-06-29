import type { ElementType } from 'react'
import {
  LayoutDashboard,
  Ticket,
  CalendarDays,
  MessageSquare,
  BookOpen,
  Megaphone,
  BarChart3,
  Briefcase,
  GraduationCap,
  HeartPulse,
} from 'lucide-react'

export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN'

export type NavItem = {
  label: string
  href: string
  icon: ElementType
  badge?: number
}

// Single source of truth for the sidebar + mobile-nav. Add new features' nav
// entries here ONCE - previously this map was duplicated across both components,
// so every feature had to be added in two places (easy to forget on mobile).
export const navItemsByRole: Record<UserRole, NavItem[]> = {
  STUDENT: [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Support Tickets', href: '/tickets', icon: Ticket },
    { label: 'Appointments', href: '/appointments', icon: CalendarDays },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Study', href: '/study', icon: GraduationCap },
    { label: 'Resources', href: '/resources', icon: BookOpen },
    { label: 'Wellbeing', href: '/wellbeing', icon: HeartPulse },
    { label: 'Announcements', href: '/announcements', icon: Megaphone },
  ],
  STAFF: [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'My Cases', href: '/tickets?filter=mine', icon: Briefcase },
    { label: 'All Tickets', href: '/tickets', icon: Ticket },
    { label: 'Calendar', href: '/appointments', icon: CalendarDays },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Resources', href: '/resources', icon: BookOpen },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'All Tickets', href: '/tickets', icon: Ticket },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Announcements', href: '/announcements', icon: Megaphone },
    { label: 'Resources', href: '/resources', icon: BookOpen },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
  ],
}
