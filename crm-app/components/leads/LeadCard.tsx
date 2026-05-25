import Link  from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
      className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/50"
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-brand-100 text-brand-700 text-sm font-semibold">
          {getInitials(contact.fullName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{contact.fullName}</span>
          <Badge variant={contact.isB2b ? 'default' : 'secondary'} className="shrink-0 text-[10px]">
            {contact.isB2b ? 'B2B' : 'B2C'}
          </Badge>
          {contact.deals.length > 0 && (
            <Badge variant="outline" className="shrink-0 text-[10px] text-brand-600 border-brand-300">
              {contact.deals.length} deal{contact.deals.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {contact.companyName && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />{contact.companyName}
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />{contact.phone}
            </span>
          )}
          {contact.email && (
            <span className="flex items-center gap-1 truncate max-w-[180px]">
              <Mail className="h-3 w-3" />{contact.email}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs text-muted-foreground">{formatRelative(contact.createdAt)}</p>
        {contact.leadSource && (
          <p className="mt-0.5 text-xs text-muted-foreground">{contact.leadSource.name}</p>
        )}
      </div>
    </Link>
  )
}