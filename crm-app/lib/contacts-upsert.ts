/**
 * Upsert de contatos por canais sem @unique no schema (Instagram)
 * ou com find-or-create explícito.
 */
import { prisma } from '@/lib/db'
import type { Contact, Prisma } from '@prisma/client'

export async function findOrCreateContactByInstagram(
  instagramId: string,
  data: {
    fullName:          string
    instagramUsername?: string | null
    tags:              string[]
  },
): Promise<Contact> {
  const existing = await prisma.contact.findFirst({
    where: { instagramId, deletedAt: null },
  })
  if (existing) {
    if (data.instagramUsername && data.instagramUsername !== existing.instagramUsername) {
      return prisma.contact.update({
        where: { id: existing.id },
        data:  { instagramUsername: data.instagramUsername },
      })
    }
    return existing
  }
  return prisma.contact.create({
    data: {
      fullName:          data.fullName,
      instagramId,
      instagramUsername: data.instagramUsername,
      isB2b:             false,
      lgpdConsent:       false,
      tags:              data.tags,
    },
  })
}

export async function findOrCreateContactByPhone(
  phoneNormalized: string,
  create: Prisma.ContactCreateInput,
): Promise<Contact> {
  const existing = await prisma.contact.findFirst({
    where: { phone: phoneNormalized, deletedAt: null },
  })
  if (existing) {
    return prisma.contact.update({
      where: { id: existing.id },
      data:  {
        whatsappPhone: phoneNormalized,
      },
    })
  }
  return prisma.contact.create({ data: create })
}
