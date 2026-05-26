'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreateDealSchema } from '@/lib/validators/deal'
import { ArrowLeft, Loader2, Kanban } from 'lucide-react'

interface ContactOption {
  id:       string
  fullName: string
  companyName?: string | null
}

interface PipelineOption {
  id:     string
  name:   string
  type:   string
  stages: { id: string; name: string; position: number }[]
}

interface Props {
  contacts:  ContactOption[]
  pipelines: PipelineOption[]
}

export function NewDealForm({ contacts, pipelines }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pipelineId, setPipelineId] = useState(pipelines[0]?.id ?? '')
  const [form, setForm] = useState({
    title:     '',
    contactId: contacts[0]?.id ?? '',
    stageId:   '',
    value:     '',
  })

  const pipeline = pipelines.find((p) => p.id === pipelineId)
  const stages = pipeline?.stages ?? []
  const stageId = form.stageId || stages[0]?.id || ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = CreateDealSchema.safeParse({
      title:      form.title.trim(),
      contactId:  form.contactId,
      pipelineId,
      stageId,
      value:      form.value ? Number(form.value) : undefined,
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/deals', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(parsed.data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
        throw new Error(body.error?.message ?? 'Falha ao criar deal')
      }
      const body = await res.json() as { data: { id: string } }
      router.push(`/deals/${body.data.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/pipeline"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-brand-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Pipeline
      </Link>

      <h1 className="text-xl font-semibold text-fg-primary">Novo Deal</h1>
      <p className="mt-1 text-sm text-fg-muted">Abra uma oportunidade no funil.</p>

      <form onSubmit={handleSubmit} className="card-default mt-6 space-y-4 p-6">
        <Field label="Título *">
          <input
            required
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            className="bg-sunken input-focus-glow h-10 w-full rounded-md border border-sutil px-3 text-sm"
          />
        </Field>

        <Field label="Contato *">
          <select
            required
            value={form.contactId}
            onChange={(e) => setForm((s) => ({ ...s, contactId: e.target.value }))}
            className="bg-sunken h-10 w-full rounded-md border border-sutil px-3 text-sm"
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
                {c.companyName ? ` — ${c.companyName}` : ''}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Pipeline *">
          <select
            value={pipelineId}
            onChange={(e) => {
              setPipelineId(e.target.value)
              setForm((s) => ({ ...s, stageId: '' }))
            }}
            className="bg-sunken h-10 w-full rounded-md border border-sutil px-3 text-sm"
          >
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Etapa inicial *">
          <select
            required
            value={stageId}
            onChange={(e) => setForm((s) => ({ ...s, stageId: e.target.value }))}
            className="bg-sunken h-10 w-full rounded-md border border-sutil px-3 text-sm"
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Valor (R$)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={(e) => setForm((s) => ({ ...s, value: e.target.value }))}
            className="bg-sunken h-10 w-full rounded-md border border-sutil px-3 text-sm"
          />
        </Field>

        {error && <p className="text-sm text-metric-negative">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !form.contactId}
          className="btn-primary-premium inline-flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Kanban className="h-4 w-4" />}
          Criar deal
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wider text-fg-secondary">{label}</label>
      {children}
    </div>
  )
}
