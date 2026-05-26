import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { WhatsAppInbox } from '@/components/whatsapp/WhatsAppInbox'
import type { WhatsAppConversationItem } from '@/components/whatsapp/WhatsAppConversationList'

interface Props {
  params: Promise<{ contactId: string }>
}

export default async function WhatsAppContactPage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { contactId } = await params

  const activeContact = await prisma.contact.findFirst({
    where: { id: contactId, deletedAt: null },
    select: { id: true, fullName: true },
  })
  if (!activeContact) notFound()

  const contacts = await prisma.contact.findMany({
    where: {
      deletedAt: null,
      whatsappMessages: { some: {} },
    },
    select: {
      id: true,
      fullName: true,
      companyName: true,
      whatsappPhone: true,
      lgpdConsent: true,
      whatsappMessages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { contentText: true, direction: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  })

  const conversations: WhatsAppConversationItem[] = await Promise.all(
    contacts.map(async (c) => {
      const last = c.whatsappMessages[0]
      const unreadCount = await prisma.whatsappMessage.count({
        where: {
          contactId: c.id,
          direction: 'inbound',
          status: { in: ['pending', 'delivered'] },
        },
      })
      return {
        contactId:     c.id,
        displayName:   c.fullName,
        companyName:   c.companyName,
        whatsappPhone: c.whatsappPhone,
        lgpdConsent:   c.lgpdConsent,
        lastMessage:   last?.contentText ?? null,
        lastMessageAt: last?.createdAt.toISOString() ?? null,
        unreadCount,
      }
    }),
  )

  conversations.sort((a, b) => {
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return tb - ta
  })

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <WhatsAppInbox
        conversations={conversations}
        activeContactId={activeContact.id}
        activeContactName={activeContact.fullName}
      />
    </div>
  )
}
