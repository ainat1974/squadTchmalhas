import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { NewContactForm } from '@/components/forms/NewContactForm'

export default async function NewLeadPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="overflow-y-auto p-6">
      <NewContactForm />
    </div>
  )
}
