import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge de classes Tailwind (elimina conflitos) */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Formatar moeda BRL */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style:    'currency',
    currency: 'BRL',
  }).format(value)
}

/** Formatar data relativa (ex: "há 2 dias") — tolerante a null/undefined */
export function formatRelative(date: Date | string | null | undefined): string {
  if (date == null) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return ''

  const diff  = Date.now() - d.getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins  < 1)  return 'agora mesmo'
  if (mins  < 60) return `há ${mins} min`
  if (hours < 24) return `há ${hours}h`
  if (days  < 7)  return `há ${days} dias`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d)
}

/** Formatar data pt-BR — tolerante a null/undefined */
export function formatDate(
  date: Date | string | null | undefined,
  opts?: Intl.DateTimeFormatOptions,
): string {
  if (date == null) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', opts ?? { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

/** Iniciais do nome (para Avatar) */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** Truncar texto */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '…'
}