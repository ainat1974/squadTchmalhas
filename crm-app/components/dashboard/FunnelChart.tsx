import { getStageChipClass } from '@/lib/stage-utils'

interface Stage { name: string; color: string; count: number }

export function FunnelChart({ stages }: { stages: Stage[] }) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1)

  return (
    <div className="card-default p-5">
      <h2 className="mb-4 text-base font-semibold text-fg-primary">Funil de Vendas</h2>
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const width = (stage.count / maxCount) * 100
          const chip = getStageChipClass(stage.name)
          return (
            <div key={i}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className={['rounded-full px-2 py-0.5 text-xs font-medium', chip].join(' ')}>
                  {stage.name}
                </span>
                <span className="font-kpi text-fg-muted">
                  <strong className="text-fg-primary">{stage.count}</strong>
                </span>
              </div>
              <div className="bg-sunken h-2 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-brand-gold/70 transition-all duration-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
