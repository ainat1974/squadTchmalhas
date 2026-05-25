import { z } from 'zod'

export const CreateDealSchema = z.object({
  title:             z.string().min(1).max(300),
  contactId:         z.string().uuid(),
  pipelineId:        z.string().uuid(),
  stageId:           z.string().uuid(),
  value:             z.number().positive().optional(),
  currency:          z.string().length(3).default('BRL'),
  expectedCloseDate: z.string().date().optional(),
  notes:             z.string().max(5000).optional(),
  tags:              z.array(z.string()).default([]),
})

export const UpdateDealSchema = z.object({
  title:             z.string().min(1).max(300).optional(),
  value:             z.number().positive().optional(),
  expectedCloseDate: z.string().date().optional(),
  notes:             z.string().max(5000).optional(),
  tags:              z.array(z.string()).optional(),
  assignedTo:        z.string().uuid().optional(),
})

export const MoveDealStageSchema = z.object({
  stageId:    z.string().uuid(),
  lostReason: z.string().max(500).optional(),
})

export const CloseDealSchema = z.object({
  status:     z.enum(['won', 'lost']),
  lostReason: z.string().max(500).optional(),
})

export const ListDealsSchema = z.object({
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
  pipelineId: z.string().uuid().optional(),
  stageId:    z.string().uuid().optional(),
  status:     z.enum(['open', 'won', 'lost', 'archived']).optional(),
  assignedTo: z.string().uuid().optional(),
  search:     z.string().optional(),
})

export type CreateDealInput   = z.infer<typeof CreateDealSchema>
export type UpdateDealInput   = z.infer<typeof UpdateDealSchema>
export type MoveDealStageInput = z.infer<typeof MoveDealStageSchema>
export type ListDealsInput    = z.infer<typeof ListDealsSchema>