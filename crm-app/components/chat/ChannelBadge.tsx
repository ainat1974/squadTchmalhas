import { cn } from '@/lib/utils'

const CONFIG = {
  whatsapp:  { label: 'WhatsApp', dot: 'channel-dot-whatsapp',  text: 'text-channel-whatsapp' },
  instagram: { label: 'Instagram', dot: 'channel-dot-instagram', text: 'text-channel-instagram' },
  webchat:   { label: 'Webchat',   dot: 'channel-dot-webchat',   text: 'text-channel-webchat' },
} as const

type Channel = keyof typeof CONFIG

export function ChannelBadge({ channel }: { channel: Channel }) {
  const c = CONFIG[channel]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-elevated px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        c.text,
      )}
    >
      <span className={['channel-dot', c.dot].join(' ')} />
      {c.label}
    </span>
  )
}
