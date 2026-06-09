"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password. Please try again.")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription>
          Enter your credentials to access the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@campuswell.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t pt-4">
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-[#C8102E] hover:underline dark:text-[#ff6b6b]"
          >
            Create one
          </Link>
        </p>

        <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            Demo Credentials
          </p>
          <div className="mt-1.5 space-y-1 text-xs text-amber-700 dark:text-amber-400">
            <p>
              Admin:{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900/40">
                admin@campuswell.edu
              </code>{" "}
              /{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900/40">
                admin123
              </code>
            </p>
            <p>
              Student:{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900/40">
                student@campuswell.edu
              </code>{" "}
              /{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900/40">
                student123
              </code>
            </p>
            <p>
              Staff:{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900/40">
                staff@campuswell.edu
              </code>{" "}
              /{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 font-mono dark:bg-amber-900/40">
                staff123
              </code>
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
