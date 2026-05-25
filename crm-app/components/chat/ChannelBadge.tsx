import { Badge } from '@/components/ui/badge'
import { cn }    from '@/lib/utils'

const CONFIG = {
  whatsapp:  { label: 'WhatsApp', bg: 'bg-[#25D366]', text: 'text-white' },
  instagram: { label: 'Instagram', bg: 'bg-[#E1306C]', text: 'text-white' },
  webchat:   { label: 'Chat Site', bg: 'bg-blue-500',  text: 'text-white' },
} as const

type Channel = keyof typeof CONFIG

export function ChannelBadge({ channel }: { channel: Channel }) {
  const c = CONFIG[channel]
  return (
    <Badge className={cn('text-[10px] font-semibold uppercase tracking-wide', c.bg, c.text, 'hover:opacity-90')}>
      {c.label}
    </Badge>
  )
}