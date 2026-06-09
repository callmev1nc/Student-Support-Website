'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface Notification {
  id: string
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string | Date
}

interface NotificationBellProps {
  fetchUrl?: string
}

export function NotificationBell({ fetchUrl = '/api/notifications' }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(fetchUrl)
      if (res.ok) {
        const data = await res.json()
        setNotifications(Array.isArray(data) ? data : data.notifications ?? [])
      }
    } catch {
      // Silently fail -- notifications are non-critical
    } finally {
      setLoading(false)
    }
  }, [fetchUrl])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await fetch(`${fetchUrl}/read-all`, { method: 'POST' })
    } catch {
      // Silently fail
    }
  }, [fetchUrl])

  const formatTime = (date: string | Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return ''
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="size-4 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#C8102E] text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="sr-only">
          Notifications {unreadCount > 0 ? `(${unreadCount} unread)` : ''}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              className="text-xs text-[#C8102E] hover:text-[#C8102E]"
              onClick={markAllAsRead}
            >
              <Check className="size-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          )}
          {!loading && notifications.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          )}
          {notifications.map((notification) => {
            const content = (
              <div className="flex flex-col gap-0.5">
                <p
                  className={cn(
                    'text-sm leading-tight',
                    notification.read
                      ? 'text-muted-foreground font-normal'
                      : 'text-foreground font-medium'
                  )}
                >
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-[10px] text-muted-foreground/70">
                  {formatTime(notification.createdAt)}
                </p>
              </div>
            )

            return (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'px-3 py-2',
                  !notification.read && 'bg-slate-50 dark:bg-slate-800/50'
                )}
              >
                {notification.link ? (
                  <Link href={notification.link} className="w-full">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-[#C8102E]">
              <Link href="/notifications">View all notifications</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
