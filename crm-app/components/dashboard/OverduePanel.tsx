import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock } from 'lucide-react'
import { formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Activity {
  id:          string
  title:       string
  type:        string
  dueDate:     string
  isMandatory: boolean
  dealTitle?:  string | null
  contactName?: string | null
}

interface Props {
  activities: Activity[]
  total:      number
}

export function OverduePanel({ activities, total }: Props) {
  if (total === 0) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-base font-semibold">Atividades Atrasadas</h2>
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <span className="text-3xl">✅</span>
          <p className="text-sm">Nenhuma atividade atrasada!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Atividades Atrasadas</h2>
        <Badge variant="destructive" className="tabular-nums">{total}</Badge>
      </div>

      <div className="space-y-2">
        {activities.map(activity => (
          <Link
            key={activity.id}
            href="/tasks"
            className="flex items-start gap-3 rounded-lg border bg-red-50 p-3 transition-colors hover:bg-red-100"
          >
            <AlertCircle className={cn('mt-0.5 h-4 w-4 shrink-0', activity.isMandatory ? 'text-red-600' : 'text-amber-500')} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {activity.dealTitle ?? activity.contactName}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs text-red-600">
              <Clock className="h-3 w-3" />
              {formatRelative(activity.dueDate)}
            </div>
          </Link>
        ))}
      </div>

      {total > activities.length && (
        <Link href="/tasks" className="mt-3 block text-center text-xs text-brand-500 hover:underline">
          Ver todas ({total - activities.length} a mais)
        </Link>
      )}
    </div>
  )
}