'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
  Menu,
  GraduationCap,
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
    { label: 'Resources', href: '/resources', icon: BookOpen },
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

interface MobileNavProps {
  unreadCount?: number
}

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function MobileNav({ unreadCount = 0 }: MobileNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const role = (session?.user as any)?.role as UserRole | undefined
  const items = navItemsByRole[role ?? 'STUDENT']

  const navItems = items.map((item) =>
    item.label === 'Messages'
      ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined }
      : item
  )

  const user = session?.user
  const avatarUrl = (user as any)?.avatarUrl as string | undefined

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        }
      />
      <SheetContent side="left" className="w-72 p-0">
        {/* Logo header */}
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#C8102E] text-white">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              CampusWell
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <li key={item.href}>
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
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#C8102E] text-[10px] font-semibold text-white">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Settings link */}
        <div className="border-t px-3 py-2">
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
        </div>

        {/* User footer */}
        <SheetFooter className="border-t p-4">
          <div className="flex w-full items-center gap-3">
            <Avatar size="default">
              <AvatarFallback>
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">
                {user?.name ?? 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email ?? ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="size-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
