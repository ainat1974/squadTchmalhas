import { z } from 'zod'

export const StartWebchatSchema = z.object({
  visitorName:   z.string().min(1).max(200).optional(),
  visitorEmail:  z.string().email().optional(),
  visitorPhone:  z.string().optional(),
  pageUrl:       z.string().url().optional(),
  lgpdConsent:   z.boolean().refine((v) => v === true, 'Consentimento LGPD obrigatório'),
  utmSource:     z.string().optional(),
  utmMedium:     z.string().optional(),
  utmCampaign:   z.string().optional(),
})

export const SendWebchatMessageSchema = z.object({
  sessionId:    z.string().uuid(),
  content:      z.string().min(1).max(4000),
  contentType:  z.enum(['text', 'image']).default('text'),
  isFromVisitor: z.boolean(),
})

export type StartWebchatInput       = z.infer<typeof StartWebchatSchema>
export type SendWebchatMessageInput = z.infer<typeof SendWebchatMessageSchema>