'use client'
import { useSortable }  from '@dnd-kit/sortable'
import { CSS }          from '@dnd-kit/utilities'
import Link             from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge }        from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials }  from '@/lib/utils'
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
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isBeingDragged ? 0.3 : 1,
  }

  const hasMandatoryPending = deal.activities.length > 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group cursor-grab rounded-lg border bg-card p-3 shadow-sm',
        'active:cursor-grabbing hover:shadow-md transition-shadow',
        isDragging && 'shadow-xl ring-2 ring-brand-500 rotate-2',
        hasMandatoryPending && 'border-amber-400',
      )}
    >
      {/* Alerta tarefas obrigatórias */}
      {hasMandatoryPending && (
        <div className="mb-2 flex items-center gap-1.5 text-amber-600">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {deal.activities.length} tarefa{deal.activities.length > 1 ? 's' : ''} obrigatória{deal.activities.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Título do deal */}
      <Link
        href={`/leads/${deal.contact.id}`}
        className="line-clamp-2 text-sm font-medium hover:text-brand-500"
        onClick={e => e.stopPropagation()}
      >
        {deal.title}
      </Link>

      {/* Empresa */}
      {deal.contact.companyName && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{deal.contact.companyName}</p>
      )}

      {/* Footer: valor + avatar */}
      <div className="mt-3 flex items-center justify-between">
        {deal.value != null ? (
          <span className="text-sm font-semibold text-brand-500">
            {formatCurrency(deal.value)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Sem valor</span>
        )}

        {deal.owner && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={undefined} />
            <AvatarFallback className="bg-brand-100 text-brand-700 text-[10px]">
              {getInitials(deal.owner.fullName)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}