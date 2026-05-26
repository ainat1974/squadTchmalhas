'use client'
import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { BrandMark } from '@/components/brand/BrandMark'

export default function PreviewLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('admin@techmalhas.com.br')
  const [password, setPassword] = useState('Admin123!')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert('Preview: este é um mockup visual. Configure o Supabase para login real.')
  }

  return (
    <div className="bg-hero-mesh flex min-h-[calc(100vh-40px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card-feature p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center gap-6">
            <BrandMark variant="hero" />
            <p className="text-center text-sm text-fg-muted">
              Casual que dura. Conforto que você sente.
            </p>
          </div>

          <h2 className="mb-1 text-center text-lg font-semibold text-fg-primary">
            Bem-vinda(o) de volta
          </h2>
          <p className="mb-6 text-center text-xs uppercase tracking-wider text-fg-muted">
            Acesse seu CRM
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-fg-secondary">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-sunken input-focus-glow h-11 w-full rounded-md border border-sutil px-3 text-sm text-fg-primary placeholder:text-fg-muted"
                required
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider text-fg-secondary">
                  Senha
                </label>
                <a
                  href="#"
                  className="text-[11px] font-medium text-brand-gold hover:text-brand-gold-hover hover:underline"
                >
                  Esqueci a senha
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-sunken input-focus-glow h-11 w-full rounded-md border border-sutil px-3 pr-10 text-sm text-fg-primary placeholder:text-fg-muted"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted transition-colors hover:text-brand-gold"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-premium h-11 w-full rounded-md text-sm font-semibold"
            >
              Entrar
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sutil" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-elevated px-3 uppercase tracking-wider text-fg-muted">
                  ou continue com
                </span>
              </div>
            </div>

            <button
              type="button"
              className="bg-sunken flex h-11 w-full items-center justify-center gap-2 rounded-md border border-sutil text-sm font-medium text-fg-primary transition-all hover:border-gold-soft hover:bg-elevated"
              onClick={() => alert('Preview: configure Supabase + Google OAuth para login real.')}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </form>

          <div className="mt-6 flex gap-2 rounded-lg border border-gold-soft bg-brand-gold/10 p-3 text-xs text-fg-secondary">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
            <p>
              <strong className="text-brand-gold">Modo Preview:</strong> este formulário não autentica de verdade. Configure o Supabase para ativar o login.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] uppercase tracking-widest text-fg-muted">
          © 2026 Techmalhas · RM Indústria e Comércio de Vestuário e Malhas LTDA
        </p>
      </div>
    </div>
  )
}
