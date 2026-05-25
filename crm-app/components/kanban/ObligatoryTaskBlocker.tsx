'use client'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog' // shadcn add alert-dialog
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatRelative } from '@/lib/utils'

interface Task {
  id:      string
  title:   string
  dueDate?: string | null
}

interface Props {
  tasks:   Task[]
  onClose: () => void
}

export function ObligatoryTaskBlocker({ tasks, onClose }: Props) {
  return (
    <AlertDialog defaultOpen onOpenChange={(open) => { if (!open) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Tarefas Obrigatórias Pendentes</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Conclua as tarefas abaixo antes de mover este deal para a próxima etapa.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="my-2 space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-start gap-2 rounded-lg border bg-amber-50 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium">{task.title}</p>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    Vence {formatRelative(task.dueDate)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Entendido</AlertDialogCancel>
          <AlertDialogAction
            className="bg-brand-500 hover:bg-brand-600"
            onClick={onClose}
          >
            Ver Tarefas
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}