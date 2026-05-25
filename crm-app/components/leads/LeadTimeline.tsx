import { formatRelative } from '@/lib/utils'
import { MessageSquare, Phone, Mail, StickyNote, Globe, Instagram } from 'lucide-react'

type InteractionItem = {
  id: string
  channel: string
  direction: string
  content: string | null
  createdAt: Date
  user?: { fullName: string } | null
}

const CHANNEL_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  whatsapp:  { label: 'WhatsApp', icon: MessageSquare },
  instagram: { label: 'Instagram', icon: Instagram },
  webchat:   { label: 'Webchat', icon: Globe },
  email:     { label: 'E-mail', icon: Mail },
  call:      { label: 'Ligação', icon: Phone },
  note:      { label: 'Nota', icon: StickyNote },
  manual:    { label: 'Manual', icon: StickyNote },
}

export function LeadTimeline({ interactions }: { interactions: InteractionItem[] }) {
  if (interactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma interação registrada ainda.
      </p>
    )
  }

  return (
    <ul className="space-y-4">
      {interactions.map((item) => {
        const config = CHANNEL_CONFIG[item.channel] ?? CHANNEL_CONFIG.manual!
        const Icon = config.icon
        const isInbound = item.direction === 'inbound'

        return (
          <li key={item.id} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 rounded-lg border bg-card px-3 py-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{config.label}</span>
                <span>·</span>
                <span>{isInbound ? 'Recebido' : 'Enviado'}</span>
                <span>·</span>
                <span>{formatRelative(item.createdAt)}</span>
                {item.user && (
                  <>
                    <span>·</span>
                    <span>{item.user.fullName}</span>
                  </>
                )}
              </div>
              {item.content && (
                <p className="mt-1 text-sm text-foreground">{item.content}</p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
