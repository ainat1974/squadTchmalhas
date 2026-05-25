import Link from 'next/link'
import {
  LayoutDashboard,
  Kanban,
  Users,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Eye,
  Code,
  Github,
  ExternalLink,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* ─── Header ────────────────────────────────────────── */}
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
              T
            </div>
            <div>
              <h1 className="font-bold text-lg text-emerald-900">CRM Techmalhas</h1>
              <p className="text-xs text-emerald-700">Preview Local · v0.1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Modo Preview · Sem Supabase
            </span>
          </div>
        </div>
      </header>

      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-4">
            Vitrine do <span className="text-orange-600">CRM Techmalhas</span>
          </h2>
          <p className="text-lg text-emerald-800/70 max-w-2xl mx-auto">
            Este é um preview visual das telas geradas pelo squad de IA.
            Para o CRM funcionar de verdade, configure o Supabase (próximo passo).
          </p>
          <p className="mt-3 text-sm italic text-emerald-600">
            "Casual que dura. Conforto que você sente. Vista Techmalhas."
          </p>
        </div>

        {/* ─── Status Cards ───────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <StatusCard
            label="Arquivos gerados"
            value="65"
            color="emerald"
            sub="código + configs"
          />
          <StatusCard
            label="Telas implementadas"
            value="6"
            color="orange"
            sub="login, pipeline, leads, dashboard…"
          />
          <StatusCard
            label="Setup faltando"
            value="Supabase"
            color="amber"
            sub="próxima etapa do deploy"
          />
        </div>

        {/* ─── Telas Disponíveis ───────────────────────────── */}
        <h3 className="text-2xl font-bold text-emerald-900 mb-2">Telas do CRM</h3>
        <p className="text-emerald-800/60 mb-6">
          Clique para visualizar. Algumas redirecionam para /login porque exigem autenticação real.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <ScreenCard
            href="/preview/login"
            icon={Eye}
            title="Tela de Login"
            description="Visualização estática do formulário de login Techmalhas (sem auth real)"
            tag="Preview Estático"
            tagColor="emerald"
          />
          <ScreenCard
            href="/login"
            icon={Eye}
            title="Login Real"
            description="Tela de login real (vai tentar conectar com Supabase placeholder e mostrar erro)"
            tag="Requer Supabase"
            tagColor="amber"
          />
          <ScreenCard
            href="/preview/kanban"
            icon={Kanban}
            title="Pipeline Kanban"
            description="Funil dual Atacado/Varejo com cards arrastáveis e tarefas obrigatórias"
            tag="Preview Mockado"
            tagColor="emerald"
          />
          <ScreenCard
            href="/preview/dashboard"
            icon={BarChart3}
            title="Dashboard de KPIs"
            description="Indicadores: receita, conversão, novos leads, atividades atrasadas"
            tag="Preview Mockado"
            tagColor="emerald"
          />
          <ScreenCard
            href="/preview/leads"
            icon={Users}
            title="Lista de Leads"
            description="Contatos com filtro Atacado/Varejo, busca e ações rápidas"
            tag="Preview Mockado"
            tagColor="emerald"
          />
          <ScreenCard
            href="/preview/chat"
            icon={MessageSquare}
            title="Chat Multicanal"
            description="WhatsApp + Instagram + Webchat unificados em uma só interface"
            tag="Preview Mockado"
            tagColor="emerald"
          />
        </div>

        {/* ─── Estrutura Gerada ────────────────────────────── */}
        <h3 className="text-2xl font-bold text-emerald-900 mb-6">O que foi entregue</h3>

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <InfoCard
            icon={Code}
            title="Backend"
            items={[
              '14 models Prisma (users, contacts, deals, pipelines, stages, activities…)',
              '15 endpoints REST (contacts, deals, activities, dashboard, webhooks)',
              'Webhook WhatsApp Cloud API + idempotência',
              'Webhook Instagram Messaging API',
              '3 cron jobs (LGPD purge, WhatsApp retry, webchat expire)',
              'RLS policies para LGPD',
            ]}
          />
          <InfoCard
            icon={LayoutDashboard}
            title="Frontend"
            items={[
              'Next.js 16 + App Router + Server Components',
              'TailwindCSS + shadcn/ui (10 componentes)',
              'Kanban com @dnd-kit (drag & drop)',
              'Realtime chat (Supabase Realtime)',
              'React Query para data fetching',
              'Mobile-first responsivo',
            ]}
          />
        </div>

        {/* ─── Próximos Passos ─────────────────────────────── */}
        <div className="bg-emerald-700 text-white rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold mb-2">Próximo Passo: Configurar Supabase</h3>
          <p className="text-emerald-100 mb-6">
            Para o CRM funcionar de verdade (login real, salvar leads, kanban com dados),
            você precisa criar um projeto Supabase e preencher o <code className="bg-emerald-900/50 px-2 py-0.5 rounded">.env.local</code>.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-emerald-800/50 p-4 rounded-lg">
              <div className="font-bold mb-1">1️⃣ Criar Projeto</div>
              <div className="text-emerald-100">Em supabase.com — região São Paulo</div>
            </div>
            <div className="bg-emerald-800/50 p-4 rounded-lg">
              <div className="font-bold mb-1">2️⃣ Copiar Chaves</div>
              <div className="text-emerald-100">URL, anon key, service_role, DB URL</div>
            </div>
            <div className="bg-emerald-800/50 p-4 rounded-lg">
              <div className="font-bold mb-1">3️⃣ Aplicar Schema</div>
              <div className="text-emerald-100">pnpm prisma:deploy && pnpm prisma:seed</div>
            </div>
          </div>
        </div>

        {/* ─── Footer ──────────────────────────────────────── */}
        <footer className="text-center text-sm text-emerald-700/60 py-8 border-t border-emerald-100">
          <p>Gerado pelo Squad <code className="bg-emerald-100 px-1.5 py-0.5 rounded">crm-techmalhas</code> · Opensquad</p>
          <p className="mt-1">5 agentes: Patrícia Produto · Davi Designer · Arnaldo Arquiteto · Fábio Fullstack · Quésia Qualidade</p>
        </footer>
      </section>
    </div>
  )
}

function StatusCard({
  label,
  value,
  color,
  sub,
}: {
  label: string
  value: string
  color: 'emerald' | 'orange' | 'amber'
  sub: string
}) {
  const colors = {
    emerald: 'from-emerald-500 to-emerald-700 text-emerald-50',
    orange: 'from-orange-500 to-orange-700 text-orange-50',
    amber: 'from-amber-500 to-amber-700 text-amber-50',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-5 shadow-sm`}>
      <div className="text-xs uppercase tracking-wide opacity-80 mb-1">{label}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs opacity-80">{sub}</div>
    </div>
  )
}

function ScreenCard({
  href,
  icon: Icon,
  title,
  description,
  tag,
  tagColor,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  tag: string
  tagColor: 'emerald' | 'amber'
}) {
  const tagColors = {
    emerald: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
  }
  return (
    <Link
      href={href}
      className="group bg-white border border-emerald-100 rounded-xl p-5 hover:border-emerald-400 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-emerald-900">{title}</h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide ${tagColors[tagColor]}`}>
              {tag}
            </span>
          </div>
          <p className="text-sm text-emerald-800/70">{description}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
    </Link>
  )
}

function InfoCard({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  items: string[]
}) {
  return (
    <div className="bg-white border border-emerald-100 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-emerald-900">{title}</h4>
      </div>
      <ul className="space-y-2 text-sm text-emerald-800/80">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
