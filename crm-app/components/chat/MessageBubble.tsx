import { cn, formatRelative } from '@/lib/utils'

interface Props {
  content:     string
  isOwn:       boolean
  senderName?: string
  createdAt:   string
}

export function MessageBubble({ content, isOwn, senderName, createdAt }: Props) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[75%] space-y-0.5', isOwn ? 'items-end' : 'items-start')}>
        {senderName && !isOwn && (
          <p className="px-1 text-xs text-fg-muted">{senderName}</p>
        )}
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
            isOwn
              ? 'rounded-br-sm bg-brand-gold text-brand-ink shadow-gold'
              : 'bg-card rounded-bl-sm border border-sutil text-fg-primary',
          )}
        >
          {content}
        </div>
        <p className={cn('font-kpi px-1 text-[10px] text-fg-muted', isOwn && 'text-right')}>
          {formatRelative(createdAt)}
        </p>
      </div>
    </div>
  )
}
