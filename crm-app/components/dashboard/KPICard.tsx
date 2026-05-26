import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  title:  string
  value:  string
  icon:   string
  trend?: 'up' | 'down' | 'neutral'
  accent?: 'gold' | 'sage' | 'positive' | 'negative'
}

const trendConfig = {
  up:      { icon: TrendingUp,   color: 'text-metric-positive' },
  down:    { icon: TrendingDown, color: 'text-metric-negative' },
  neutral: { icon: Minus,        color: 'text-fg-muted' },
}

const accentIconBg: Record<NonNullable<Props['accent']>, string> = {
  gold:     'bg-brand-gold/15 text-brand-gold',
  sage:     'bg-chart-primary/15 text-chart-primary',
  positive: 'bg-metric-positive-soft text-metric-positive',
  negative: 'bg-metric-negative-soft text-metric-negative',
}

export function KPICard({ title, value, icon, trend, accent = 'gold' }: Props) {
  const cfg = trend ? trendConfig[trend] : null
  const TrendIcon = cfg?.icon

  return (
    <div className="card-interactive group p-5">
      <div className="mb-3 flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg text-lg',
            accentIconBg[accent],
          )}
          role="img"
          aria-hidden
        >
          {icon}
        </div>
        {TrendIcon && cfg && (
          <div className={cn('font-kpi flex items-center gap-0.5 text-xs font-medium', cfg.color)}>
            <TrendIcon className="h-3 w-3" />
          </div>
        )}
      </div>
      <p className="font-kpi font-kpi-glow text-2xl font-semibold text-fg-primary">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-fg-muted">{title}</p>
    </div>
  )
}
