import type { User } from '@prisma/client'
import { SidebarContent } from './SidebarContent'

export function Sidebar({ user }: { user: User }) {
  return (
    <aside className="hidden h-full md:flex">
      <SidebarContent user={user} />
    </aside>
  )
}
