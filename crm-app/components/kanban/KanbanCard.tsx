'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { cn, formatCurrency, getInitials } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

interface Deal {
  id:         string
  title:      string
  value?:     number | null
  stageId:    string
  contact:    { id: string; fullName: string; companyName?: string | null; avatarUrl?: string | null }
  owner?:     { id: string; fullName: string } | null
  activities: Array<{ id: string; title: string; dueDate?: string | null }>
}

interface Props {
  deal:          Deal
  currentUserId: string
  isDragging?:   boolean
}

export function KanbanCard({ deal, isDragging = false }: Props) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: isBeingDragged,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:   isBeingDragged ? 0.35 : 1,
  }

  const hasMandatoryPending = deal.activities.length > 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'card-interactive group cursor-grab p-3 active:cursor-grabbing',
        isDragging && 'shadow-gold rotate-1 ring-1 ring-brand-gold/50',
        hasMandatoryPending && 'border-metric-negative/40',
      )}
    >
      {hasMandatoryPending && (
        <div className="mb-2 flex items-center gap-1.5 text-metric-negative">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {deal.activities.length} obrigatória{deal.activities.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      <Link
        href={`/deals/${deal.id}`}
        onClick={(e) => e.stopPropagation()}
        className="line-clamp-2 text-sm font-medium text-fg-primary hover:text-brand-gold"
      >
        {deal.title}
      </Link>

      {deal.contact.companyName && (
        <p className="mt-0.5 truncate text-xs text-fg-muted">{deal.contact.companyName}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        {deal.value != null ? (
          <span className="font-kpi text-sm font-semibold text-brand-gold">
            {formatCurrency(deal.value)}
          </span>
        ) : (
          <span className="text-xs text-fg-muted">Sem valor</span>
        )}

        {deal.owner && (
          <span
            className="brand-tm-avatar"
            style={{ width: 24, height: 24, fontSize: 10 }}
            title={deal.owner.fullName}
          >
            {getInitials(deal.owner.fullName)}
          </span>
        )}
      </div>
    </div>
  )
}
