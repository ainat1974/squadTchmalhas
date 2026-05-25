'use client'
import { useState, useCallback } from 'react'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast }         from 'sonner'
import { api, queryKeys } from '@/lib/api-client'
import { KanbanColumn }  from './KanbanColumn'
import { KanbanCard }    from './KanbanCard'
import { ObligatoryTaskBlocker } from './ObligatoryTaskBlocker'

// Tipos mínimos (Prisma types podem ser importados do @prisma/client)
interface ContactMin { id: string; fullName: string; companyName?: string | null; avatarUrl?: string | null }
interface ActivityMin { id: string; title: string; dueDate?: string | null }
interface DealWithRelations {
  id:         string
  title:      string
  value?:     number | null
  stageId:    string
  contact:    ContactMin
  owner?:     { id: string; fullName: string } | null
  activities: ActivityMin[]  // mandatory + not done
}
interface StageWithDeals {
  id:          string
  name:        string
  color:       string
  probability: number
  isWonStage:  boolean
  isLostStage: boolean
  deals:       DealWithRelations[]
}
interface PipelineData {
  id:     string
  name:   string
  type:   string
  stages: StageWithDeals[]
}

interface BlockerState {
  dealId:   string
  stageId:  string
  tasks:    Array<{ id: string; title: string; dueDate?: string | null }>
}

interface Props {
  pipeline:    PipelineData
  currentUser: { id: string; role: string }
}

export function KanbanBoard({ pipeline, currentUser }: Props) {
  const [stages,  setStages]  = useState<StageWithDeals[]>(pipeline.stages)
  const [dragging, setDragging] = useState<DealWithRelations | null>(null)
  const [blocker,  setBlocker]  = useState<BlockerState | null>(null)

  const queryClient = useQueryClient()
  const sensors     = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const moveMutation = useMutation({
    mutationFn: ({ dealId, stageId }: { dealId: string; stageId: string }) =>
      api.patch(`/api/v1/deals/${dealId}/stage`, { stageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline(pipeline.type) })
      toast.success('Deal movido com sucesso')
    },
    onError: (err: { code?: string; status?: number; details?: { pendingMandatoryTasks?: Array<{ id: string; title: string; dueDate?: string | null }> } }, vars) => {
      if (err.status === 409 && err.details?.pendingMandatoryTasks) {
        // Hard block: mostrar dialog de tarefas obrigatórias
        setBlocker({
          dealId:  vars.dealId,
          stageId: vars.stageId,
          tasks:   err.details.pendingMandatoryTasks,
        })
      } else {
        toast.error('Erro ao mover deal')
      }
      // Reverter otimismo
      setStages(pipeline.stages)
    },
  })

  const applyOptimisticMove = useCallback((dealId: string, toStageId: string) => {
    setStages(prev => {
      const deal = prev.flatMap(s => s.deals).find(d => d.id === dealId)
      if (!deal) return prev
      return prev.map(s => {
        if (s.id === deal.stageId) return { ...s, deals: s.deals.filter(d => d.id !== dealId) }
        if (s.id === toStageId)   return { ...s, deals: [...s.deals, { ...deal, stageId: toStageId }] }
        return s
      })
    })
  }, [])

  function handleDragStart(event: DragStartEvent) {
    const deal = stages.flatMap(s => s.deals).find(d => d.id === event.active.id)
    if (deal) setDragging(deal)
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const dealId   = String(active.id)
    const toStageId = String(over.id)
    const currentStageId = stages.flatMap(s => s.deals).find(d => d.id === dealId)?.stageId
    if (currentStageId === toStageId) return

    applyOptimisticMove(dealId, toStageId)
    moveMutation.mutate({ dealId, stageId: toStageId })
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban-scroll flex h-full gap-4 overflow-x-auto pb-4">
          {stages.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              currentUserId={currentUser.id}
            />
          ))}
        </div>

        <DragOverlay>
          {dragging && (
            <KanbanCard
              deal={dragging}
              isDragging
              currentUserId={currentUser.id}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Hard Block Dialog */}
      {blocker && (
        <ObligatoryTaskBlocker
          tasks={blocker.tasks}
          onClose={() => setBlocker(null)}
        />
      )}
    </>
  )
}