'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreateContactSchema } from '@/lib/validators/contact'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'

export function NewContactForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    fullName:    '',
    email:       '',
    phone:       '',
    companyName: '',
    isB2b:       false,
    lgpdConsent: false,
    notes:       '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = CreateContactSchema.safeParse({
      fullName:    form.fullName.trim(),
      email:       form.email.trim() || undefined,
      phone:       form.phone.trim() || undefined,
      companyName: form.companyName.trim() || undefined,
      isB2b:       form.isB2b,
      lgpdConsent: form.lgpdConsent,
      notes:       form.notes.trim() || undefined,
      pipelineType: form.isB2b ? 'atacado' : 'varejo',
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/contacts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(parsed.data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
        throw new Error(body.error?.message ?? 'Falha ao criar contato')
      }
      const body = await res.json() as { data: { id: string } }
      router.push(`/leads/${body.data.id}`)
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
        href="/leads"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-brand-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Leads
      </Link>

      <h1 className="text-xl font-semibold text-fg-primary">Novo Contato</h1>
      <p className="mt-1 text-sm text-fg-muted">Cadastre um lead manualmente no CRM.</p>

      <form onSubmit={handleSubmit} className="card-default mt-6 space-y-4 p-6">
        <Field label="Nome completo *">
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
            className="bg-sunken input-focus-glow h-10 w-full rounded-md border border-sutil px-3 text-sm text-fg-primary"
          />
        </Field>
        <Field label="E-mail">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            className="bg-sunken input-focus-glow h-10 w-full rounded-md border border-sutil px-3 text-sm text-fg-primary"
          />
        </Field>
        <Field label="Telefone (E.164, ex: +5511999999999)">
          <input
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            className="bg-sunken input-focus-glow h-10 w-full rounded-md border border-sutil px-3 text-sm text-fg-primary"
            placeholder="+5511..."
          />
        </Field>
        <Field label="Empresa">
          <input
            value={form.companyName}
            onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))}
            className="bg-sunken input-focus-glow h-10 w-full rounded-md border border-sutil px-3 text-sm text-fg-primary"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isB2b}
            onChange={(e) => setForm((s) => ({ ...s, isB2b: e.target.checked }))}
          />
          Cliente B2B (Atacado)
        </label>
        <label className="flex items-start gap-2 text-sm text-fg-secondary">
          <input
            type="checkbox"
            checked={form.lgpdConsent}
            onChange={(e) => setForm((s) => ({ ...s, lgpdConsent: e.target.checked }))}
            className="mt-1"
          />
          Confirmo consentimento LGPD do contato para comunicações comerciais.
        </label>

        {error && <p className="text-sm text-metric-negative">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary-premium inline-flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Criar contato
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
