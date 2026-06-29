import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ChatClient } from "./chat-client"

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await requireUser()
  const { id } = await params

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participantA: { select: { id: true, name: true, role: true } },
      participantB: { select: { id: true, name: true, role: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  })

  if (!conversation) notFound()
  if (conversation.participantAId !== userId && conversation.participantBId !== userId) {
    notFound()
  }

  const otherUser =
    conversation.participantAId === userId
      ? conversation.participantB
      : conversation.participantA

  const initialConversation = {
    id: conversation.id,
    otherUser,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      createdAt: m.createdAt.toISOString(),
      readAt: m.readAt ? m.readAt.toISOString() : null,
      sender: m.sender,
    })),
  }

  return (
    <ChatClient
      initialConversation={initialConversation}
      conversationId={id}
      userId={userId}
    />
  )
}
