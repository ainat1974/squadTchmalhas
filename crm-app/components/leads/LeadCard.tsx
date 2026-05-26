import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatRelative } from '@/lib/utils'
import { Building2, Phone, Mail } from 'lucide-react'

interface Contact {
  id:           string
  fullName:     string
  email?:       string | null
  phone?:       string | null
  companyName?: string | null
  isB2b:        boolean
  pipelineType?: string | null
  createdAt:    Date
  leadSource?:  { name: string } | null
  owner?:       { fullName: string } | null
  deals:        Array<{ id: string }>
}

export function LeadCard({ contact }: { contact: Contact }) {
  return (
    <Link
      href={`/leads/${contact.id}`}
      className="card-interactive flex items-center gap-4 p-4"
    >
      <span className="brand-tm-avatar shrink-0" style={{ width: 40, height: 40, fontSize: 13 }}>
        {getInitials(contact.fullName)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium text-fg-primary">{contact.fullName}</span>
          <span className={contact.isB2b ? 'tag-pill-warm' : 'tag-pill'}>
            {contact.isB2b ? 'B2B' : 'B2C'}
          </span>
          {contact.deals.length > 0 && (
            <Badge
              variant="outline"
              className="shrink-0 border-gold-soft bg-brand-gold/10 text-[10px] text-brand-gold"
            >
              {contact.deals.length} deal{contact.deals.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
          {contact.companyName && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {contact.companyName}
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1 font-kpi">
              <Phone className="h-3 w-3" />
              {contact.phone}
            </span>
          )}
          {contact.email && (
            <span className="flex max-w-[200px] items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              {contact.email}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-kpi text-xs text-fg-muted">{formatRelative(contact.createdAt)}</p>
        {contact.leadSource && (
          <p className="mt-0.5 text-xs text-fg-secondary">{contact.leadSource.name}</p>
        )}
        {contact.owner && (
          <p className="mt-0.5 text-[10px] text-fg-muted">{contact.owner.fullName}</p>
        )}
      </div>
    </Link>
  )
}
