import Link from 'next/link'
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
      <div className="card-default p-5">
        <h2 className="mb-4 text-base font-semibold text-fg-primary">Atividades Atrasadas</h2>
        <div className="flex flex-col items-center gap-2 py-8 text-fg-muted">
          <span className="text-3xl" role="img" aria-hidden>✓</span>
          <p className="text-sm">Nenhuma atividade atrasada!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-feature p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-brand-gold" />
          <h2 className="text-base font-semibold text-fg-primary">Atividades Atrasadas</h2>
        </div>
        <span className="tag-pill-warm font-kpi">{total}</span>
      </div>

      <div className="space-y-2">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            href="/tasks"
            className="bg-sunken flex items-start gap-3 rounded-lg border border-sutil p-3 transition-colors hover:border-gold-soft hover:bg-elevated"
          >
            <AlertCircle
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0',
                activity.isMandatory ? 'text-metric-negative' : 'text-brand-gold',
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium text-fg-primary">{activity.title}</p>
              <p className="truncate text-xs text-fg-muted">
                {activity.dealTitle ?? activity.contactName}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs text-metric-negative">
              <Clock className="h-3 w-3" />
              <span className="font-kpi">{formatRelative(activity.dueDate)}</span>
            </div>
          </Link>
        ))}
      </div>

      {total > activities.length && (
        <Link
          href="/tasks"
          className="mt-3 block text-center text-xs font-medium text-brand-gold hover:underline"
        >
          Ver todas ({total - activities.length} a mais)
        </Link>
      )}
    </div>
  )
}
