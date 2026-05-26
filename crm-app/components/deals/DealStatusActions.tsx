'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, XCircle, Loader2 } from 'lucide-react'

interface Props {
  dealId:     string
  dealStatus: 'open' | 'won' | 'lost' | 'archived'
}

export function DealStatusActions({ dealId, dealStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'won' | 'lost' | null>(null)
  const [showLostForm, setShowLostForm] = useState(false)
  const [lostReason, setLostReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (dealStatus !== 'open') {
    return (
      <p className="text-sm text-fg-muted">
        Deal encerrado como{' '}
        <strong className="text-fg-primary">
          {dealStatus === 'won' ? 'Ganho' : dealStatus === 'lost' ? 'Perdido' : dealStatus}
        </strong>
      </p>
    )
  }

  async function updateStatus(status: 'won' | 'lost', reason?: string) {
    setLoading(status)
    setError(null)
    try {
      const res = await fetch(`/api/v1/deals/${dealId}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          status,
          ...(status === 'lost' ? { lostReason: reason } : {}),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
        throw new Error(body.error?.message ?? 'Falha ao atualizar status')
      }
      router.refresh()
      setShowLostForm(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void updateStatus('won')}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 rounded-md border border-metric-positive/40 bg-metric-positive-soft px-4 py-2 text-sm font-semibold text-metric-positive transition-colors hover:bg-metric-positive/20 disabled:opacity-50"
        >
          {loading === 'won' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trophy className="h-4 w-4" />
          )}
          Marcar como Ganho
        </button>
        <button
          type="button"
          onClick={() => setShowLostForm((v) => !v)}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 rounded-md border border-metric-negative/40 bg-metric-negative-soft px-4 py-2 text-sm font-semibold text-metric-negative transition-colors hover:bg-metric-negative/20 disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" />
          Marcar como Perdido
        </button>
      </div>

      {showLostForm && (
        <div className="card-default space-y-2 p-4">
          <label htmlFor="lostReason" className="text-xs uppercase tracking-wider text-fg-secondary">
            Motivo da perda *
          </label>
          <textarea
            id="lostReason"
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            rows={2}
            className="bg-sunken input-focus-glow w-full rounded-md border border-sutil px-3 py-2 text-sm"
            placeholder="Ex.: Preço, prazo, concorrente…"
          />
          <button
            type="button"
            onClick={() => void updateStatus('lost', lostReason.trim())}
            disabled={loading !== null || lostReason.trim().length < 3}
            className="btn-primary-premium rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {loading === 'lost' ? 'Salvando…' : 'Confirmar perda'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-metric-negative">{error}</p>
      )}
    </div>
  )
}
