import Link from "next/link"
import { GraduationCap, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#C8102E] via-[#DC2626] to-[#991B1B] px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <GraduationCap className="size-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          CampusWell
        </h1>
      </div>

      {/* 404 Card */}
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-xl dark:bg-slate-900 ring-1 ring-foreground/10">
        <div className="mb-4 text-7xl font-bold text-[#C8102E] dark:text-[#ff6b6b]">
          404
        </div>
        <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Page Not Found
        </h2>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8102E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#a50d25] dark:bg-[#ff6b6b] dark:text-slate-900 dark:hover:bg-[#ff5252]"
          >
            <Home className="size-4" />
            Go Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Sign In
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-white/60">
        Western Sydney University
      </p>
    </div>
  )
}
