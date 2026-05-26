'use client'

import { WhatsAppConversationList, type WhatsAppConversationItem } from './WhatsAppConversationList'
import { WhatsAppThread } from './WhatsAppThread'
import { MessageCircle } from 'lucide-react'

interface Props {
  conversations: WhatsAppConversationItem[]
  activeContactId?: string | null
  activeContactName?: string | null
}

export function WhatsAppInbox({
  conversations,
  activeContactId,
  activeContactName,
}: Props) {
  const showThread = activeContactId && activeContactName

  return (
    <div className="card-default flex h-full min-h-[480px] overflow-hidden">
      <aside
        className={`flex w-full flex-col border-r border-sutil md:w-80 lg:w-96 ${
          showThread ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="border-b border-sutil px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-fg-primary">
            <MessageCircle className="h-4 w-4 text-channel-whatsapp" />
            WhatsApp
          </h2>
          <p className="text-xs text-fg-muted">{conversations.length} conversa(s)</p>
        </div>
        <WhatsAppConversationList
          conversations={conversations}
          activeContactId={activeContactId}
        />
      </aside>

      <div className={`bg-canvas flex flex-1 flex-col ${showThread ? 'flex' : 'hidden md:flex'}`}>
        {showThread ? (
          <WhatsAppThread contactId={activeContactId} contactName={activeContactName} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-soft bg-brand-gold/15">
              <MessageCircle className="h-8 w-8 text-brand-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-fg-primary">Inbox WhatsApp</h3>
              <p className="mt-1 max-w-sm text-sm text-fg-muted">
                Selecione uma conversa para responder pelo CRM.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
