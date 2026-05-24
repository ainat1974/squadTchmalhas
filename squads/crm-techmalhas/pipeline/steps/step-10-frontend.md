---
execution: subagent
agent: fullstack-developer
inputFile: squads/crm-techmalhas/output/code/backend.md
outputFile: squads/crm-techmalhas/output/code/frontend.md
model_tier: powerful
---

# Step 10: Interface Next.js (Kanban, Leads, Dashboard, Chat)

## Context Loading

Load these files before executing:
- `squads/crm-techmalhas/output/code/backend.md` — API endpoints disponíveis
- `squads/crm-techmalhas/output/wireframes.md` — telas e componentes
- `squads/crm-techmalhas/output/design-system.md` — tokens, tailwind config
- `squads/crm-techmalhas/output/requirements.md` — user stories
- `squads/crm-techmalhas/output/architecture.md` — RBAC, fluxos

## Instructions

### Process

1. **Configurar projeto Next.js 15** — `package.json` com deps (next, react, typescript, tailwindcss, @tanstack/react-query, @dnd-kit/core, lucide-react, shadcn/ui deps), `tsconfig.json` estrito, `tailwind.config.ts` do Step 05, `app/globals.css`.
2. **Inicializar shadcn/ui** — `components.json` e componentes base em `components/ui/` (Button, Card, Form, Input, Sheet, Dialog, etc.).
3. **Layout principal** — `app/layout.tsx` (RootLayout com fonts e providers), `app/(dashboard)/layout.tsx` (com sidebar + header + auth guard).
4. **Páginas (Server Components quando possível):**
   - `app/(auth)/login/page.tsx`
   - `app/(dashboard)/pipeline/page.tsx` (KanbanBoard como Client Component)
   - `app/(dashboard)/leads/page.tsx` (lista)
   - `app/(dashboard)/leads/[id]/page.tsx` (server-side fetch, drawer client)
   - `app/(dashboard)/chat/page.tsx`
   - `app/(dashboard)/chat/[contactId]/page.tsx`
   - `app/(dashboard)/tasks/page.tsx`
   - `app/(dashboard)/dashboard/page.tsx`
   - `app/(dashboard)/settings/pipelines/[id]/page.tsx`
   - `app/(dashboard)/settings/users/page.tsx`
5. **Componentes de domínio:**
   - `components/kanban/` — KanbanBoard, KanbanColumn, KanbanCard (com dnd-kit)
   - `components/leads/` — LeadCard, LeadForm, LeadTimeline, LeadDrawer
   - `components/chat/` — ChatList, ChatThread, MessageBubble (com Supabase Realtime)
   - `components/tasks/` — TaskCard, TaskList, MandatoryBadge
   - `components/dashboard/` — KPICard, FunnelChart, OverduePanel
   - `components/layout/` — Sidebar, Header, NavItem, UserMenu
6. **Auth client** — `lib/auth-client.ts` (Supabase browser client), `middleware.ts` (proteção de rotas).
7. **API client** — usar React Query com fetcher tipado em `lib/api-client.ts`.
8. **Produzir documento** seguindo Output Format, salvar em `squads/crm-techmalhas/output/code/frontend.md`.

## Output Format

```markdown
# Frontend Implementation — CRM Techmalhas

> **TL;DR:** [N] páginas, [N] componentes de domínio, [N] Server vs Client Components.

## Estrutura de Arquivos
\`\`\`
[árvore completa]
\`\`\`

## Configuração

### `package.json` (extras)
### `tsconfig.json`
### `tailwind.config.ts`
### `app/globals.css`
### `components.json` (shadcn)
### `middleware.ts`

## Páginas
[Cada página com código completo, indicando Server/Client]

## Componentes
[Cada componente com código completo]

## Lib Helpers
### `lib/auth-client.ts`
### `lib/api-client.ts`

## Comandos
[Como rodar o app local, login, navegar]
```

## Output Example

```markdown
# Frontend Implementation — CRM Techmalhas

> **TL;DR:** 10 páginas, 20+ componentes de domínio, dnd-kit para Kanban,
> Supabase Realtime para Chat, React Query para data fetching.

## Estrutura de Arquivos

\`\`\`
app/
├── (auth)/login/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── pipeline/page.tsx
│   ├── leads/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── chat/
│   │   ├── page.tsx
│   │   └── [contactId]/page.tsx
│   ├── tasks/page.tsx
│   ├── dashboard/page.tsx
│   └── settings/
│       ├── pipelines/[id]/page.tsx
│       └── users/page.tsx
├── layout.tsx
└── globals.css
components/
├── ui/  (shadcn primitives)
├── kanban/
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   └── KanbanCard.tsx
├── leads/
│   ├── LeadForm.tsx
│   ├── LeadDrawer.tsx
│   └── LeadTimeline.tsx
├── chat/
│   ├── ChatList.tsx
│   ├── ChatThread.tsx
│   └── MessageBubble.tsx
├── tasks/
│   ├── TaskCard.tsx
│   └── MandatoryBadge.tsx
├── dashboard/
│   ├── KPICard.tsx
│   ├── FunnelChart.tsx
│   └── OverduePanel.tsx
└── layout/
    ├── Sidebar.tsx
    ├── Header.tsx
    └── UserMenu.tsx
lib/
├── auth-client.ts
├── api-client.ts
└── utils.ts
middleware.ts
\`\`\`

## `middleware.ts`

\`\`\`typescript
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => req.cookies.get(n)?.value,
        set: (n, v, opts) => { res.cookies.set({ name: n, value: v, ...opts }); },
        remove: (n, opts) => { res.cookies.set({ name: n, value: '', ...opts }); },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  if (!user && !isAuthPage) return NextResponse.redirect(new URL('/login', req.url));
  if (user && isAuthPage) return NextResponse.redirect(new URL('/pipeline', req.url));

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
\`\`\`

## `app/(dashboard)/pipeline/page.tsx` (Server Component)

\`\`\`typescript
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

export default async function PipelinePage({
  searchParams,
}: { searchParams: Promise<{ type?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const params = await searchParams;
  const pipelineType = (params.type ?? 'atacado') as 'atacado' | 'varejo';

  const pipeline = await prisma.pipeline.findFirst({
    where: { type: pipelineType },
    include: {
      stages: {
        orderBy: { orderIndex: 'asc' },
        include: {
          deals: {
            where: user.role === 'vendedor' ? { ownerId: user.id } : {},
            include: {
              contact: true,
              activities: { where: { mandatory: true, completedAt: null } },
            },
          },
        },
      },
    },
  });

  if (!pipeline) return <div>Pipeline não encontrado</div>;

  return (
    <div className="h-full p-4">
      <h1 className="mb-4 text-2xl font-semibold">Pipeline {pipelineType}</h1>
      <KanbanBoard pipeline={pipeline} currentUserId={user.id} />
    </div>
  );
}
\`\`\`

## `components/kanban/KanbanBoard.tsx` (Client Component)

\`\`\`tsx
'use client';
import { useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KanbanColumn } from './KanbanColumn';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import type { Pipeline, Stage, Deal, Contact, Activity } from '@prisma/client';

type StageWithDeals = Stage & {
  deals: (Deal & { contact: Contact; activities: Activity[] })[];
};

interface Props {
  pipeline: Pipeline & { stages: StageWithDeals[] };
  currentUserId: string;
}

export function KanbanBoard({ pipeline, currentUserId }: Props) {
  const [optimisticDeals, setOptimisticDeals] = useState(pipeline.stages);
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const moveMutation = useMutation({
    mutationFn: (vars: { dealId: string; toStageId: string }) =>
      apiClient.post(`/api/v1/deals/${vars.dealId}/move`, { to_stage_id: vars.toStageId }),
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao mover deal');
      setOptimisticDeals(pipeline.stages);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline', pipeline.id] });
      toast.success('Deal movido');
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const dealId = active.id as string;
    const toStageId = over.id as string;

    setOptimisticDeals((prev) => moveDealOptimistic(prev, dealId, toStageId));
    moveMutation.mutate({ dealId, toStageId });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {optimisticDeals.map((stage) => (
          <KanbanColumn key={stage.id} stage={stage} currentUserId={currentUserId} />
        ))}
      </div>
    </DndContext>
  );
}

function moveDealOptimistic(stages: StageWithDeals[], dealId: string, toStageId: string) {
  const deal = stages.flatMap((s) => s.deals).find((d) => d.id === dealId);
  if (!deal) return stages;
  return stages.map((s) => {
    if (s.id === deal.stageId) return { ...s, deals: s.deals.filter((d) => d.id !== dealId) };
    if (s.id === toStageId) return { ...s, deals: [...s.deals, { ...deal, stageId: toStageId }] };
    return s;
  });
}
\`\`\`

## `lib/api-client.ts`

\`\`\`typescript
class ApiClient {
  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    const json = await res.json();
    if (!res.ok) {
      throw Object.assign(new Error(json.error?.message ?? 'Erro'), {
        code: json.error?.code,
        details: json.error?.details,
        status: res.status,
      });
    }
    return json.data;
  }
  get<T>(path: string) { return this.request<T>(path); }
  post<T>(path: string, body: unknown) { return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) }); }
  patch<T>(path: string, body: unknown) { return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }); }
  delete<T>(path: string) { return this.request<T>(path, { method: 'DELETE' }); }
}

export const apiClient = new ApiClient();
\`\`\`

[seguem outras páginas e componentes...]

## Comandos

\`\`\`bash
# Rodar local
pnpm dev

# Build de produção
pnpm build && pnpm start

# Lint + typecheck
pnpm lint && pnpm typecheck
\`\`\`
```

## Veto Conditions

Reject and redo if ANY are true:
1. Faltam páginas para alguma user story essencial
2. Pipeline Kanban sem dnd-kit (ou equivalente acessível)
3. Componente client gigante (>200 linhas) sem refatoração
4. `middleware.ts` ausente (rotas sem proteção)
5. `any` sem justificativa em comentário
6. Sem `tailwind.config.ts` aplicando tokens do design system

## Quality Criteria

- [ ] 10 páginas implementadas (login, pipeline, leads, lead-detail, chat, conversation, tasks, dashboard, settings/pipeline, settings/users)
- [ ] Server Components por padrão; Client Components apenas para interatividade
- [ ] Kanban com dnd-kit + optimistic update
- [ ] Chat com Supabase Realtime
- [ ] React Query para data fetching
- [ ] middleware.ts protegendo rotas autenticadas
- [ ] Componentes < 200 linhas
- [ ] Tokens shadcn customizados conforme design system
- [ ] TypeScript estrito sem `any`
