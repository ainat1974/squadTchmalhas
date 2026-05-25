import Link from 'next/link'
import { ArrowLeft, Eye } from 'lucide-react'

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-sm text-amber-900 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span><strong>Modo Preview:</strong> dados mockados, sem persistência</span>
        </div>
        <Link href="/" className="inline-flex items-center gap-1 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar à vitrine
        </Link>
      </div>
      {children}
    </div>
  )
}
