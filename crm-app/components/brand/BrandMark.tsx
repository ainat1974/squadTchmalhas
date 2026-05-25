import { cn } from '@/lib/utils'

type BrandMarkProps = {
  /** Variante de layout — controla tamanhos e se renderiza wordmark */
  variant?: 'mark' | 'sidebar' | 'sidebar-collapsed' | 'hero' | 'avatar'
  /** Aplica glow gold no TM (default: true exceto em avatar/mark/favicon) */
  glow?: boolean
  /** Wordmark "CRM Techmalhas" visível (default: depende do variant) */
  showWordmark?: boolean
  className?: string
}

const sizeMap = {
  'mark':              { tm: 32, wordmark: 0,  tracking: '0em',    gap: 0, showWordmark: false },
  'sidebar':           { tm: 28, wordmark: 10, tracking: '0.08em', gap: 2, showWordmark: true  },
  'sidebar-collapsed': { tm: 32, wordmark: 0,  tracking: '0em',    gap: 0, showWordmark: false },
  'hero':              { tm: 40, wordmark: 14, tracking: '0.14em', gap: 6, showWordmark: true  },
  'avatar':            { tm: 20, wordmark: 0,  tracking: '0em',    gap: 0, showWordmark: false },
} as const

/**
 * BrandMark — TM Hind 700 gold (stacked) sobre "CRM Techmalhas" Hind 500 off-white.
 * Spec completa em squads/crm-techmalhas/output/2026-05-25/design-system-v5.md §5.9
 * Decisão Tania 2026-05-25: TM gold + wordmark stacked (não "T" genérico em quadrado).
 */
export function BrandMark({
  variant = 'sidebar',
  glow,
  showWordmark,
  className,
}: BrandMarkProps) {
  const sizes = sizeMap[variant]
  const renderGlow = glow ?? (variant !== 'avatar' && variant !== 'mark')
  const renderWordmark = showWordmark ?? sizes.showWordmark

  return (
    <span
      className={cn('inline-flex flex-col items-center', className)}
      style={{ gap: sizes.gap }}
      role="img"
      aria-label="CRM Techmalhas"
    >
      <span
        className={cn('brand-tm', renderGlow && 'brand-tm-glow')}
        style={{ fontSize: sizes.tm, lineHeight: 1 }}
        aria-hidden="true"
      >
        TM
      </span>
      {renderWordmark && (
        <span
          className="brand-wordmark-stack"
          style={{
            fontSize: sizes.wordmark,
            letterSpacing: sizes.tracking,
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          CRM Techmalhas
        </span>
      )}
    </span>
  )
}
