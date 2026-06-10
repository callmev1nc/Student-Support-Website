"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send } from "lucide-react"

type UserOption = {
  id: string
  name: string
  email: string
  role: string
}

export default function NewConversationPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserOption[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users/available")
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users ?? [])
        }
      } catch {
        // silent
      }
    }
    fetchUsers()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUserId || !message.trim() || sending) return
    setSending(true)

    const formData = new FormData()
    formData.append("recipientId", selectedUserId)
    formData.append("content", message)

    try {
      const res = await fetch("/api/messages/start", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/messages/${data.conversationId}`)
      } else {
        setSending(false)
      }
    } catch {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/messages")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Conversation</h1>
          <p className="text-sm text-muted-foreground">
            Start a conversation with a staff member or student
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Start Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient</Label>
              <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border p-2">
                {users.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Loading users...
                  </p>
                ) : (
                  users.map((user) => {
                    const initials = user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setSelectedUserId(user.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                          selectedUserId === user.id
                            ? "bg-wsu-red/10 text-wsu-red"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.role} &middot; {user.email}</p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={!selectedUserId || !message.trim() || sending}>
                <Send className="mr-2 size-4" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/messages")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
