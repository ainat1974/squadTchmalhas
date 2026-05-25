import { z } from 'zod'

const phoneRegex = /^\+?[1-9]\d{8,14}$/

export const CreateContactSchema = z.object({
  fullName:          z.string().min(1).max(200),
  email:             z.string().email().optional().or(z.literal('')),
  phone:             z.string().regex(phoneRegex, 'Telefone inválido (formato E.164)').optional(),
  whatsappPhone:     z.string().regex(phoneRegex, 'WhatsApp inválido').optional(),
  documentCpf:       z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
  documentCnpj:      z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).optional(),
  companyName:       z.string().max(200).optional(),
  isB2b:             z.boolean().default(false),
  pipelineType:      z.enum(['atacado', 'varejo']).optional(),
  leadSourceId:      z.string().uuid().optional(),
  instagramId:       z.string().optional(),
  instagramUsername: z.string().optional(),
  lgpdConsent:       z.boolean(),
  tags:              z.array(z.string()).default([]),
  notes:             z.string().max(5000).optional(),
}).refine(
  (d) => d.email || d.phone || d.whatsappPhone,
  { message: 'Informe ao menos email, telefone ou WhatsApp' },
).refine(
  (d) => d.lgpdConsent === true,
  { message: 'Consentimento LGPD obrigatório', path: ['lgpdConsent'] },
)

export const UpdateContactSchema = CreateContactSchema.partial().omit({ lgpdConsent: true })

export const ListContactsSchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
  search:   z.string().optional(),
  isB2b:    z.coerce.boolean().optional(),
  pipeline: z.enum(['atacado', 'varejo']).optional(),
  source:   z.string().optional(),
})

export type CreateContactInput = z.infer<typeof CreateContactSchema>
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>
export type ListContactsInput  = z.infer<typeof ListContactsSchema>