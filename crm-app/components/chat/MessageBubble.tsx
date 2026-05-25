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
          <p className="px-1 text-xs text-muted-foreground">{senderName}</p>
        )}
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2 text-sm',
            isOwn
              ? 'rounded-br-sm bg-brand-500 text-white'
              : 'rounded-bl-sm bg-secondary text-foreground',
          )}
        >
          {content}
        </div>
        <p className={cn('px-1 text-[10px] text-muted-foreground', isOwn && 'text-right')}>
          {formatRelative(createdAt)}
        </p>
      </div>
    </div>
  )
}