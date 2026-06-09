"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { SeedDataBanner } from "@/components/seed-data-banner"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { NotificationBell } from "@/components/notification-bell"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [notificationCount, setNotificationCount] = useState(0)

  const fetchNotificationCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/count")
      if (res.ok) {
        const data = await res.json()
        setNotificationCount(data.count ?? 0)
      }
    } catch {
      // Silently fail -- notification count is non-critical
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchNotificationCount()
    }
  }, [session, fetchNotificationCount])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar unreadCount={notificationCount} />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Seed data banner */}
        <SeedDataBanner />

        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-white px-4 dark:bg-slate-900">
          {/* Mobile menu */}
          <MobileNav unreadCount={notificationCount} />

          {/* Breadcrumb / page title area */}
          <div className="flex-1" />

          {/* Right side actions */}
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
            <UserNav />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
