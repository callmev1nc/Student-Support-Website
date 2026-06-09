import { GraduationCap } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#C8102E] via-[#DC2626] to-[#991B1B] px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Branding */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <GraduationCap className="size-8 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CampusWell
          </h1>
          <p className="mt-1 text-sm text-white/80">
            Student Support Platform
          </p>
        </div>
      </div>

      {/* Auth card container */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-white/60">
        Western Sydney University
      </p>
    </div>
  )
}
