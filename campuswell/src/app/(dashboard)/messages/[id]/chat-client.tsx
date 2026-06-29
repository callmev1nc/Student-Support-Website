"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Message = {
  id: string
  content: string
  createdAt: string
  readAt: string | null
  senderId: string
  sender: { id: string; name: string; role: string }
}

type ConversationData = {
  id: string
  otherUser: { id: string; name: string; role: string }
  messages: Message[]
}

export function ChatClient(props: {
  initialConversation: ConversationData
  conversationId: string
  userId: string
}) {
  const router = useRouter()
  const { initialConversation, conversationId, userId } = props

  const [conversation, setConversation] = useState<ConversationData>(initialConversation)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isSendingRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const fetchConversation = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${conversationId}`)
      if (res.ok) {
        setConversation((await res.json()) as ConversationData)
      }
    } catch {
      // silent
    }
  }, [conversationId])

  // Refresh + mark as read on mount
  useEffect(() => {
    fetchConversation()
    fetch("/api/messages/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    }).catch(() => {})
  }, [conversationId, fetchConversation])

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchConversation, 5000)
    return () => clearInterval(interval)
  }, [fetchConversation])

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages?.length, scrollToBottom])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || isSendingRef.current) return
    isSendingRef.current = true

    const formData = new FormData()
    formData.append("conversationId", conversationId)
    formData.append("content", newMessage)

    setNewMessage("")

    try {
      await fetch("/api/messages/send", {
        method: "POST",
        body: formData,
      })
      await fetchConversation()
    } catch {
      // silent
    } finally {
      isSendingRef.current = false
    }
  }

  const { otherUser, messages } = conversation
  const initials = otherUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/messages")}>
          <ArrowLeft className="size-4" />
        </Button>
        <Avatar className="size-8">
          <AvatarFallback className="bg-wsu-red/10 text-wsu-red text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{otherUser.name}</p>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {otherUser.role}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === userId
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? "bg-wsu-red text-white rounded-br-md"
                    : "bg-slate-100 dark:bg-slate-800 rounded-bl-md"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <div
                  className={`mt-1 flex items-center gap-1 text-[10px] ${
                    isMine ? "text-white/70 justify-end" : "text-muted-foreground"
                  }`}
                >
                  <span>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                  {isMine && (
                    msg.readAt ? (
                      <CheckCheck className="size-3" />
                    ) : (
                      <Check className="size-3" />
                    )
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 border-t pt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-wsu-red"
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}
