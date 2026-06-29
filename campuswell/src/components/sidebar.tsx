'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Ticket,
  CalendarDays,
  MessageSquare,
  BookOpen,
  Megaphone,
  Settings,
  Users,
  BarChart3,
  Briefcase,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  GraduationCap,
  HeartPulse,
} from 'lucide-react'

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN'

const navItemsByRole: Record<UserRole, NavItem[]> = {
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

interface SidebarProps {
  unreadCount?: number
}

export function Sidebar({ unreadCount = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const role = (session?.user as any)?.role as UserRole | undefined
  const items = navItemsByRole[role ?? 'STUDENT']

  // Inject unread count into the Messages nav item
  const navItems = items.map((item) =>
    item.label === 'Messages'
      ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined }
      : item
  )

  return (
    <TooltipProvider delay={200}>
      <aside
        data-slot="sidebar"
        className={cn(
          'relative flex h-screen flex-col border-r bg-white dark:bg-slate-900 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b px-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#C8102E] text-white">
            <GraduationCap className="size-5" />
          </div>
          {!collapsed && (
            <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              CampusWell
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const basePath = item.href.split('?')[0]
              const isActive =
                pathname === basePath ||
                (basePath !== '/' && pathname.startsWith(basePath))
              const Icon = item.icon

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#C8102E]/10 text-[#C8102E] dark:bg-[#C8102E]/20 dark:text-[#ff6b6b]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#C8102E] text-[10px] font-semibold text-white">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute right-1.5 top-1 size-2 rounded-full bg-[#C8102E]" />
                  )}
                </Link>
              )

              return (
                <li key={item.href} className="relative">
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger render={linkContent} />
                      <TooltipContent side="right">
                        {item.label}
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-[#C8102E] text-[9px] font-semibold text-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    linkContent
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Settings + Sign out */}
        <div className="mt-auto border-t px-2 py-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/settings"
                    className={cn(
                      'flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      pathname === '/settings'
                        ? 'bg-[#C8102E]/10 text-[#C8102E] dark:bg-[#C8102E]/20 dark:text-[#ff6b6b]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                    )}
                  >
                    <Settings className="size-4" />
                  </Link>
                }
              />
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/settings"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === '/settings'
                  ? 'bg-[#C8102E]/10 text-[#C8102E] dark:bg-[#C8102E]/20 dark:text-[#ff6b6b]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              )}
            >
              <Settings className="size-4" />
              <span>Settings</span>
            </Link>
          )}

          <Separator className="my-2" />

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="size-4" />
                  </Button>
                }
              />
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </Button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 z-10 flex size-6 items-center justify-center rounded-full border bg-white text-slate-500 shadow-sm hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
        >
          {collapsed ? (
            <PanelLeft className="size-3.5" />
          ) : (
            <PanelLeftClose className="size-3.5" />
          )}
        </button>
      </aside>
    </TooltipProvider>
  )
}
