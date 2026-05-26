import Link from 'next/link'
import { Settings, ArrowLeft } from 'lucide-react'

interface Props {
  title:       string
  description: string
  features:    string[]
  backHref?:   string
}

export function SettingsComingSoon({
  title,
  description,
  features,
  backHref = '/dashboard',
}: Props) {
  return (
    <div className="overflow-y-auto p-6">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-brand-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="card-feature mx-auto max-w-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-soft bg-brand-gold/15">
          <Settings className="h-7 w-7 text-brand-gold" />
        </div>
        <h2 className="text-xl font-semibold text-fg-primary">{title}</h2>
        <p className="mt-2 text-sm text-fg-muted">{description}</p>
        <span className="tag-pill-warm mt-4 inline-block font-kpi">Em desenvolvimento · v5.1</span>

        <ul className="mt-8 space-y-2 text-left text-sm text-fg-secondary">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" />
              {f}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-fg-muted">
          Enquanto isso, pipelines e usuários são gerenciados via Supabase Studio ou seed do banco.
        </p>
      </div>
    </div>
  )
}
