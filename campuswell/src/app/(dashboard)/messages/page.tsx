import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function MessagesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as Record<string, unknown>).id as string

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participantAId: userId }, { participantBId: userId }],
    },
    include: {
      participantA: { select: { id: true, name: true, role: true } },
      participantB: { select: { id: true, name: true, role: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  })

  // Get unread counts per conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          readAt: null,
        },
      })
      return { ...conv, unreadCount }
    })
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Your conversations with staff and students
          </p>
        </div>
        <Button render={<Link href="/messages/new" />}>
          <Plus className="mr-2 size-4" />
          New Message
        </Button>
      </div>

      {conversationsWithUnread.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="mb-4 size-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No conversations yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start a new conversation to connect with staff or students
            </p>
            <Button className="mt-4" render={<Link href="/messages/new" />}>
              Start a Conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversationsWithUnread.map((conv) => {
            const otherUser =
              conv.participantAId === userId
                ? conv.participantB
                : conv.participantA
            const lastMessage = conv.messages[0]
            const initials = otherUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()

            return (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <Card className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <CardContent className="flex items-center gap-4 py-4">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-wsu-red/10 text-wsu-red text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{otherUser.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {otherUser.role}
                        </Badge>
                      </div>
                      {lastMessage && (
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(lastMessage.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-wsu-red text-[10px] font-semibold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
