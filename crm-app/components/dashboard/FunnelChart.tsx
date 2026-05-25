interface Stage { name: string; color: string; count: number }

export function FunnelChart({ stages }: { stages: Stage[] }) {
  const maxCount = Math.max(...stages.map(s => s.count), 1)

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-4 text-base font-semibold">Funil de Vendas</h2>
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const width = (stage.count / maxCount) * 100
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="w-28 truncate text-sm text-muted-foreground text-right pr-2">
                {stage.name}
              </span>
              <div className="flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-6 rounded-full transition-all duration-500"
                  style={{ width: `${width}%`, backgroundColor: stage.color }}
                />
              </div>
              <span className="w-8 text-sm font-semibold tabular-nums text-right">
                {stage.count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}