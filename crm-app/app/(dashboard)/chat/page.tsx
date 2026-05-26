import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ChatInbox } from '@/components/chat/ChatInbox'
import type { ChatSessionItem } from '@/components/chat/ChatList'

interface Props {
  searchParams: Promise<{ session?: string }>
}

export default async function ChatPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { session: sessionId } = await searchParams

  const sessionsRaw = await prisma.webchatSession.findMany({
    where: {
      status: { in: ['waiting', 'active'] },
      ...(user.role === 'atendente_varejo' ? { assignedTo: user.id } : {}),
    },
    include: {
      contact: { select: { fullName: true, companyName: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { lastActivityAt: 'desc' },
    take: 50,
  })

  const sessions: ChatSessionItem[] = await Promise.all(
    sessionsRaw.map(async (s) => {
      const unreadCount = await prisma.webchatMessage.count({
        where: {
          sessionId: s.id,
          isFromVisitor: true,
          readAt: null,
        },
      })

      const displayName =
        s.contact?.fullName ??
        s.visitorName ??
        s.visitorEmail ??
        'Visitante do site'

      return {
        id: s.id,
        status: s.status,
        displayName,
        lastMessage: s.messages[0]?.content ?? null,
        lastActivityAt: s.lastActivityAt.toISOString(),
        unreadCount,
        channel: 'webchat' as const,
      }
    }),
  )

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <ChatInbox sessions={sessions} initialSessionId={sessionId ?? null} />
    </div>
  )
}
