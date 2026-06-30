'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Bot, Send, AlertTriangle, AlertCircle } from 'lucide-react'
import { CRISIS_RESOURCES, type CrisisResource } from '@/lib/crisis'

type Message = {
  role: 'user' | 'assistant'
  content: string
  crisis?: boolean
  resources?: CrisisResource[]
}

export function AssistantPageClient({
  assistantOptIn,
  userName,
}: {
  assistantOptIn: boolean
  userName: string
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: assistantOptIn
        ? `Hi ${userName}! I'm CampusWell AI, your campus support assistant. Ask me about resources, study tips, wellbeing support, or navigating university services.`
        : 'AI assistant is not enabled. Go to Settings to enable it.',
    },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alertPending, startAlertTransition] = useTransition()
  const [alertSent, setAlertSent] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || streaming || !assistantOptIn) return

    setInput('')
    setError(null)

    const userMsg: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])

    setStreaming(true)
    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, assistantMsg])

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      // Crisis responses (200 JSON) and errors (4xx JSON) come back as JSON;
      // a normal answer is a text stream. Distinguish by Content-Type.
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json().catch(() => ({}))
        if (data.crisis) {
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: data.message || '',
              crisis: true,
              resources: data.resources || [],
            }
            return updated
          })
          return
        }
        throw new Error(data.error || `Error ${res.status}`)
      }

      if (!res.ok) {
        throw new Error(`Error ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: fullText }
          return updated
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      // Remove the empty assistant message on error.
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  async function alertStaff() {
    startAlertTransition(async () => {
      try {
        const res = await fetch('/api/assistant/alert', { method: 'POST' })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setAlertSent(true)
      } catch {
        setError('Could not alert staff. Please try again.')
      }
    })
  }

  if (!assistantOptIn) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="size-6 text-[#C8102E]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Get instant help with campus resources and support.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              AI assistant is not enabled. Go to{' '}
              <a href="/settings" className="text-[#C8102E] underline underline-offset-2">
                Settings
              </a>{' '}
              to enable it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="size-6 text-[#C8102E]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Ask me anything about campus life.
            </p>
          </div>
        </div>
        {!alertSent ? (
          <Button
            size="sm"
            variant="outline"
            onClick={alertStaff}
            disabled={alertPending}
            className="text-amber-600 border-amber-300 hover:bg-amber-50"
          >
            <AlertCircle className="size-4" />
            Alert staff
          </Button>
        ) : (
          <span className="text-xs font-medium text-green-600">
            Staff has been alerted
          </span>
        )}
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
        <strong>Important:</strong> I&apos;m an AI assistant and not a crisis service,
        therapist, or doctor. If you&apos;re in immediate danger, call{' '}
        <strong>000</strong>. For 24/7 support, call{' '}
        <strong>Lifeline 13 11 14</strong> or{' '}
        <strong>Beyond Blue 1300 22 4636</strong>.
      </div>

      {/* Messages */}
      <Card className="flex min-h-[400px] flex-col">
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#C8102E] text-white'
                    : msg.crisis
                      ? 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {msg.crisis && (
                  <div className="mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-4" />
                    <span className="text-xs font-semibold">Support available</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.crisis && msg.resources && (
                  <div className="mt-3 space-y-2 border-t border-amber-200 pt-3 dark:border-amber-800">
                    {msg.resources.map((r) => (
                      <a
                        key={r.name}
                        href={r.href}
                        className="flex items-center gap-2 text-xs font-medium text-amber-800 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                      >
                        <AlertCircle className="size-3.5" />
                        <span>
                          {r.name} — {r.phone}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {streaming && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm dark:bg-slate-800">
                <Loader2 className="size-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          rows={2}
          disabled={streaming}
          className="flex-1"
        />
        <Button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="self-end"
        >
          {streaming ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
