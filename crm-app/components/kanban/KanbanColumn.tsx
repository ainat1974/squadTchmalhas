'use client'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { KanbanCard } from './KanbanCard'
import { getStageChipClass } from '@/lib/stage-utils'

interface Deal {
  id:         string
  title:      string
  value?:     number | null
  stageId:    string
  contact:    { id: string; fullName: string; companyName?: string | null; avatarUrl?: string | null }
  owner?:     { id: string; fullName: string } | null
  activities: Array<{ id: string; title: string; dueDate?: string | null }>
}
interface Stage {
  id:          string
  name:        string
  color:       string
  probability: number
  isWonStage:  boolean
  isLostStage: boolean
  deals:       Deal[]
}

interface Props {
  stage:         Stage
  currentUserId: string
}

export function KanbanColumn({ stage, currentUserId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  const dealIds = stage.deals.map((d) => d.id)
  const chip = getStageChipClass(stage.name)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col',
        isOver && 'rounded-lg ring-1 ring-brand-gold/40',
      )}
    >
      <div className="bg-card mb-2 flex items-center justify-between rounded-lg border border-sutil px-3 py-2.5">
        <span className={['rounded-full px-2 py-0.5 text-xs font-medium', chip].join(' ')}>
          {stage.name}
        </span>
        <span className="font-kpi text-xs text-fg-muted">{stage.deals.length}</span>
      </div>

      <div className="bg-sunken kanban-scroll flex-1 space-y-2 overflow-y-auto rounded-lg border border-sutil p-2">
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {stage.deals.map((deal) => (
            <KanbanCard key={deal.id} deal={deal} currentUserId={currentUserId} />
          ))}
          {stage.deals.length === 0 && (
            <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-sutil text-xs text-fg-muted">
              Arraste um card aqui
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
