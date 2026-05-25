import { Card, CardContent } from '@/components/ui/card'
import { cn }                from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  title:  string
  value:  string
  icon:   string
  trend?: 'up' | 'down' | 'neutral'
}

const trendConfig = {
  up:      { icon: TrendingUp,   color: 'text-green-600',   bg: 'bg-green-50'   },
  down:    { icon: TrendingDown, color: 'text-red-600',     bg: 'bg-red-50'     },
  neutral: { icon: Minus,        color: 'text-muted-foreground', bg: 'bg-muted' },
}

export function KPICard({ title, value, icon, trend }: Props) {
  const cfg = trend ? trendConfig[trend] : null
  const TrendIcon = cfg?.icon

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-2xl" role="img" aria-hidden>{icon}</span>
            {TrendIcon && (
              <div className={cn('flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium', cfg.bg, cfg.color)}>
                <TrendIcon className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}