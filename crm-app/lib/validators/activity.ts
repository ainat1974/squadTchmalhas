import { z } from 'zod'

export const CreateActivitySchema = z.object({
  dealId:      z.string().uuid().optional(),
  contactId:   z.string().uuid().optional(),
  type:        z.enum(['task', 'call', 'meeting', 'email', 'note', 'whatsapp', 'instagram']),
  title:       z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  dueDate:     z.string().datetime().optional(),
  assignedTo:  z.string().uuid().optional(),
}).refine(
  (d) => d.dealId || d.contactId,
  { message: 'Informe dealId ou contactId' },
)

export const UpdateActivitySchema = CreateActivitySchema.partial()

export const ListActivitiesSchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  dealId:    z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  isDone:    z.coerce.boolean().optional(),
  type:      z.enum(['task','call','meeting','email','note','whatsapp','instagram']).optional(),
})

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>
export type ListActivitiesInput = z.infer<typeof ListActivitiesSchema>