'use client'
import { useDroppable }  from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn }            from '@/lib/utils'
import { KanbanCard }    from './KanbanCard'
import { Badge }         from '@/components/ui/badge'

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
  const dealIds = stage.deals.map(d => d.id)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors',
        isOver && 'bg-secondary border-brand-300',
      )}
    >
      {/* Header da coluna */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: stage.color }}
            aria-hidden
          />
          <span className="text-sm font-medium">{stage.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{stage.probability}%</span>
          <Badge variant="secondary" className="text-xs tabular-nums">
            {stage.deals.length}
          </Badge>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {stage.deals.map(deal => (
            <KanbanCard
              key={deal.id}
              deal={deal}
              currentUserId={currentUserId}
            />
          ))}
          {stage.deals.length === 0 && (
            <div className="flex h-16 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
              Arraste um card aqui
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}