export const dynamic = 'force-dynamic'

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-canvas flex h-screen w-screen flex-col overflow-hidden text-fg-primary">
      {children}
    </div>
  )
}
