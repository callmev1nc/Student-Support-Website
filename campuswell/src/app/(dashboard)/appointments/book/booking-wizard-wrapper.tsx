"use client"

import dynamic from "next/dynamic"

const BookingWizard = dynamic(
  () => import("./booking-wizard").then((m) => m.BookingWizard),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center py-12"><div className="size-8 animate-spin rounded-full border-2 border-wsu-red border-t-transparent" /></div>,
  }
)

export { BookingWizard }
