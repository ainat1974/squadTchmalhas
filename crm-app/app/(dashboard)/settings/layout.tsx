import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { SettingsNav } from '@/components/settings/SettingsNav'

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!['admin', 'gestor'].includes(user.role)) redirect('/dashboard')

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-sutil bg-card px-6 py-3">
        <SettingsNav />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
