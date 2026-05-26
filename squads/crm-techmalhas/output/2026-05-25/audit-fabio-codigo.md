# Auditoria de Código — CRM Techmalhas
**Por:** Fábio Fullstack · 2026-05-25 · v1.0
**Escopo:** `crm-app/` (Next.js 16.1.6 + React 19.2.4 + Prisma 6.x + Supabase)

---

## TL;DR

- **Arquitetura está boa**, **execução está mediana.** O esqueleto (Prisma + RLS + Zod + RBAC + RSC-first) é sólido; quem implementou sabia o que estava fazendo. O problema mora nos detalhes que ficaram pelo caminho.
- **23 erros de TypeScript ativos** em 7 arquivos, todos escondidos atrás de `typescript.ignoreBuildErrors: true` no `next.config.ts`. Build verde mentindo.
- **5 bugs reais de runtime** já identificados (não hipotéticos): `upsert` em coluna sem `@unique`, `throw { object literal }` que vira 500 genérico, `logAudit` fire-and-forget sem `await` (LGPD em risco), cookies SSR no-op (sessão Supabase nunca refresca), N+1 no inbox de chat.
- **Padrões violados frequentemente:** componente client de 415 linhas (`ChatEmbed.tsx`), schemas Zod duplicados em rota e em `lib/validators/`, `throw { status, code, message }` ignorando a classe `ApiError`.
- **Zero testes.** `vitest`, `playwright` e `msw` instalados em `devDependencies`, mas nenhum `*.test.ts` ou `*.spec.ts` no projeto. Para um sistema com pagamento, webhook Meta e LGPD, é leviano.

---

## 1. Estado do TypeScript

### Erros TS ativos (`pnpm exec tsc --noEmit`)

23 erros distribuídos em 7 arquivos. Saída resumida abaixo (lista completa rodando o comando do `package.json:11`: `pnpm typecheck`):

| Arquivo | Linha | Categoria | Erro resumido |
|---|---:|---|---|
| `app/(dashboard)/leads/[id]/page.tsx` | 32 | TS1360 / TS7053 | `DEAL_STATUS` declarado com `satisfies Record<DealStatus, …>` mas omite `archived` — o enum tem 4 valores, o objeto só 3 |
| `app/api/v1/contacts/route.ts` | 32, 38 | TS2322 | `leadSource: { type: params.source }` — `params.source` é `string`, mas `LeadSourceWhereInput.type` exige enum `LeadSourceType` |
| `app/api/v1/webhooks/instagram/route.ts` | 49, 104 | TS2322 | `where: { instagramId: … }` em `Contact.upsert` — coluna não tem `@unique`, então não é `WhereUniqueInput`. Mascarado com `as { instagramId: string }` (👎) |
| `app/api/v1/webhooks/whatsapp/route.ts` | 55 | TS2322 | Mesmo problema com `phone` em `Contact.upsert` — coluna `phone` no schema tem `@@index([phone])` mas **não** tem `@unique` |
| `app/auth/callback/route.ts` | 17–19 | TS7006 | Callbacks `get/set/remove` dos cookies com `(name) =>` implicit `any` (TS strict on) |
| `app/preview/dashboard/page.tsx` | 59, 140 | TS2532 / TS2322 | Acesso indexado sem checagem (`noUncheckedIndexedAccess: true` ativo) + `accent: string` incompatível com union literal |
| `lib/auth.ts` | 19 | TS7006 | Mesmo problema do callback do Supabase SSR — `(name)` sem tipo |
| `prisma/seed.ts` | 301, 302, 311, 312, … (12 ocorrências) | TS2532 | `b2bContacts[0].companyName` sem optional chaining em ambiente `noUncheckedIndexedAccess` |

### Diagnóstico

```19:19:crm-app/next.config.ts
const dirname = path.dirname(fileURLToPath(import.meta.url));
```

```7:11:crm-app/next.config.ts
const nextConfig: NextConfig = {
  typescript: {
    // TODO: remover após corrigir tipos restantes (webhooks, seed, validators)
    ignoreBuildErrors: true,
  },
```

O `// TODO` está ali há quanto tempo? `ignoreBuildErrors: true` é uma **dívida técnica explícita**. Build verde no Vercel não significa código correto.

### `tsconfig.json` — config está boa

```11:14:crm-app/tsconfig.json
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
```

Os flags são os corretos. O problema é desrespeitá-los com `ignoreBuildErrors`. Se vai ter strict, **respeita o strict.**

### `any` / `as unknown as`

Boa notícia: zero `: any` explícito no `lib/`. Apenas dois `as unknown as` em todo o projeto:

```20:22:crm-app/lib/db.ts
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}
```

Este é **legítimo** — é o padrão oficial de singleton do Prisma.

```68:68:crm-app/lib/instagram.ts
          text:      (msg.message as unknown as { text?: string }).text,
```

Este aqui é gambiarra. A interface `InstagramDM` deveria ter `text?: string` no payload original; em vez disso, força.

### Tipos manuais que deveriam vir do Prisma

`components/kanban/KanbanBoard.tsx:14-40` redeclara `ContactMin`, `ActivityMin`, `DealWithRelations`, `StageWithDeals`, `PipelineData`. O Prisma já gera esses tipos via `Prisma.DealGetPayload<{ include: { … } }>`. O comentário da linha 14 inclusive admite:

```14:14:crm-app/components/kanban/KanbanBoard.tsx
// Tipos mínimos (Prisma types podem ser importados do @prisma/client)
```

Sabia, não fez. KanbanCard.tsx (linha 8-16) duplica de novo. Três cópias do mesmo shape.

---

## 2. Padrões Next.js 16

### O que está correto

- **Server Components por padrão.** Ratio inspecionado: 36 arquivos com `'use client'` contra ~30 arquivos de página/route puramente server. Boa.
- **`params` e `searchParams` são `Promise<…>` e awaited** — alinhado com Next 15+ (oficialmente obrigatório desde Next 15 e mantido em 16). Ex:

  ```7:11:crm-app/app/embed/chat/page.tsx
  interface Props {
    searchParams: Promise<{ session?: string; pageUrl?: string }>
  }

  export default async function EmbedChatPage({ searchParams }: Props) {
    const { session, pageUrl } = await searchParams
  ```

- **`outputFileTracingRoot` + `turbopack.root` configurados** — correto para evitar warnings de monorepo.

### O que está errado ou inconsistente

- **`lib/auth.ts:18-21` — cookies write é no-op.** Bug latente sério:

  ```17:23:crm-app/lib/auth.ts
        cookies: {
          get:    (name) => cookieStore.get(name)?.value,
          set:    () => {}, // App Router: cookies são read-only em Route Handlers
          remove: () => {},
        },
      },
  ```

  O comentário está **errado**. Em App Router cookies podem ser escritos em Route Handlers e Server Actions. Como `set` é no-op, **quando o Supabase tenta renovar o refresh token, ele falha silenciosamente**. Resultado: usuário é deslogado depois de ~1h de uso sem aviso, e a sessão expira no meio de uma ação importante. Em contraste, o callback OAuth (`app/auth/callback/route.ts:17-19`) faz set/remove corretamente — está acertado lá e errado no helper geral.

  **Fix correto** (referência: [docs Supabase SSR + Next.js App Router](https://supabase.com/docs/guides/auth/server-side/nextjs)):

  ```typescript
  cookies: {
    getAll() { return cookieStore.getAll() },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        )
      } catch {
        // Server Component (sem set permitido) — ok
      }
    },
  }
  ```

- **Suspense ausente em rotas com data fetching pesado.** `dashboard/page.tsx` faz 5 queries em paralelo (linhas 20-43), seguido por mais 1 sequencial (linha 48). Renderiza tudo como blocking. Deveria ter `<Suspense>` em torno de `<FunnelChart>` e `<OverduePanel>` para streaming.

- **Inconsistência Server Action vs Route Handler.** Move-stage do deal é Route Handler PATCH (`app/api/v1/deals/[id]/stage/route.ts`). Em ambiente interno, sem cliente externo, deveria ser **Server Action**. Não está errado, mas o agent.md prega "Server Action para mutação interna disparada do UI; API Route para integração externa". A regra existe mas não é seguida.

- **`force-dynamic` só está no embed layout.** As rotas do dashboard usam `cookies()` (via `getCurrentUser`) e são dinâmicas por consequência, mas não estão **declarando** isso. Funciona, mas é frágil — qualquer mudança que tire o `cookies()` faz a rota virar estática silenciosamente.

- **Server-side rendering do inbox de chat (`app/(dashboard)/chat/page.tsx`) busca sessões mas não as mensagens.** Operador abre o chat → vê sessões na lista → clica em uma → fica esperando o WebSocket Realtime carregar o histórico no client. Deveria carregar as últimas N mensagens SSR e hidratar o hook.

---

## 3. Convenções de Código

### Naming

- **PT-BR em enum DB (`vendedor_atacado`, `atendente_varejo`) + EN em fields (`fullName`, `isB2b`).** Mistura por design. Funciona, mas confunde devs novos: por que `assignedTo` (EN) referencia um `vendedor_atacado` (PT)?
- **Mensagens Zod em PT-BR.** Bom — direto para o usuário final.
- **Imports absolutos com `@/`** consistentes — bem.

### Tamanho de arquivos (top 10 maiores `.tsx/.ts`)

| Linhas | Arquivo | Veredicto |
|---:|---|---|
| 415 | `app/embed/chat/ChatEmbed.tsx` | **Acima do limite de 200.** Componente client gigante com 4 sub-componentes internos. Precisa quebrar. |
| 310 | `app/preview/dashboard/page.tsx` | Mock data dumpada inline. OK porque é página de showcase, mas mistura mock + UI. |
| 301 | `app/preview/chat/page.tsx` | Mesmo padrão. |
| 291 | `app/page.tsx` | Landing page com mock — aceitável. |
| 276 | `app/(dashboard)/leads/[id]/page.tsx` | No limite. Aceitável. |
| 258 | `app/preview/leads/page.tsx` | Preview. |
| 200 | `components/ui/dropdown-menu.tsx` | Componente shadcn — não auditar. |
| 153 | `app/(dashboard)/tasks/page.tsx` | OK. |
| 150 | `components/kanban/KanbanBoard.tsx` | OK. |
| 148 | `app/api/v1/webhooks/instagram/route.ts` | OK em tamanho, problemático em qualidade (ver §6 e §7). |

### Duplicação (DRY violado)

- **Cláusula `OR` de busca duplicada** entre `app/(dashboard)/leads/page.tsx:25-32` e `app/api/v1/contacts/route.ts:20-27`. Mesmo shape, dois lugares — quando mudar um, esqueceram o outro.
- **Schema `SendMessageSchema` redeclarado inline** em `app/api/v1/webchat/messages/route.ts:10-14`, **enquanto existe** `SendWebchatMessageSchema` em `lib/validators/webchat.ts:14-19`. Por que dois? O da rota tem `isFromVisitor: z.boolean().default(false)`, o do validator tem `.boolean()` sem default. Sutilmente diferentes. Bug à espera.
- **Filtro `['admin','gestor'].includes(user.role)`** repetido em 6 arquivos (`dashboard/page.tsx:16`, `chat/page.tsx:20`, `pipeline/page.tsx:83`, `tasks/page.tsx:12`, `activities/[id]/complete/route.ts:22`, `dashboard/kpis/route.ts:37`). Já existe `isAdminOrGestor(user)` em `lib/permissions.ts:15` — ninguém usou.

### Comentários

Em geral bom — explicam *porquê* (ex: `lib/db.ts:5-15`, `lib/ratelimit.ts:1-5`). Mas:

- `app/preview/layout.tsx` e os `app/preview/**` têm comentários de "decisão Tania 2026-05-25" inline — esse tipo de meta-comentário não pertence ao código, pertence ao ADR.

---

## 4. Validação e Erros

### Zod

- Validators existem em `lib/validators/{contact, deal, webchat, activity}.ts` e são usados pelas rotas. Bom.
- `lib/validators/webchat.ts:14` define `SendWebchatMessageSchema` mas a rota `app/api/v1/webchat/messages/route.ts:10` define **outro** schema chamado `SendMessageSchema`. Duplicação. Fix: importar do validator e deletar o inline.
- `lib/validators/contact.ts:23-29` tem dupla validação via `.refine()` — bom uso de Zod.

### `handleApiError` — uso consistente?

Quase. Todas as 12 rotas v1 chamam `handleApiError` no `catch`. **Mas três delas violam o contrato:**

```65:65:crm-app/app/api/v1/deals/route.ts
    if (!pipeline) throw { status: 422, code: 'INVALID_PIPELINE', message: 'Pipeline não encontrado' }
```

```31:36:crm-app/app/api/v1/whatsapp/send/route.ts
    if (!contact?.whatsappPhone) {
      throw { status: 422, code: 'NO_WHATSAPP', message: 'Contato sem número WhatsApp cadastrado' }
    }
    if (!contact.lgpdConsent) {
      throw { status: 422, code: 'NO_LGPD_CONSENT', message: 'Contato sem consentimento LGPD para comunicações' }
    }
```

`handleApiError` testa `err instanceof ApiError` (`lib/errors.ts:48`). Um plain object **não** é instância de `ApiError`. Resultado: cai no fallback `console.error('[unhandled error]', err)` e responde **500 INTERNAL_ERROR** com a mensagem genérica `"Erro interno do servidor"` — o frontend nunca vê `INVALID_PIPELINE` nem `NO_LGPD_CONSENT`. **Bug real.**

**Fix:**

```diff
- throw { status: 422, code: 'INVALID_PIPELINE', message: 'Pipeline não encontrado' }
+ throw Errors.UNPROCESSABLE('Pipeline não encontrado')
```

Já existe `Errors.UNPROCESSABLE` em `lib/errors.ts:26`. Use.

### Inconsistência de envelope

`app/api/v1/webchat/sessions/route.ts:15` e `app/api/v1/webchat/messages/route.ts:22,29,32` retornam:

```typescript
NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
```

Enquanto `handleApiError` (`lib/errors.ts:31-58`) retorna:

```typescript
{ error: { code: '…', message: '…', details?: … } }
```

`error: string` versus `error: { code, message }`. O `lib/api-client.ts:27` faz `json.error?.message ?? 'Erro desconhecido'` — quando `error` é uma string, `error?.message` é `undefined`, então cai no fallback `'Erro desconhecido'`. **A mensagem "Sessão não encontrada" nunca aparece para o usuário.**

### Error boundaries

**Inexistem.** Nenhum `error.tsx` em `app/(dashboard)/`, `app/embed/`, `app/(auth)/`. Qualquer throw inesperado em Server Component **quebra a app inteira** com o error overlay padrão do Next. Em produção: usuário vê `Application error: a server-side exception has occurred`.

Mínimo necessário: um `app/(dashboard)/error.tsx`, `app/embed/error.tsx`, e um `app/global-error.tsx`.

---

## 5. Hooks e Estado Cliente

### `useEffect` suspeitas

```291:295:crm-app/app/embed/chat/ChatEmbed.tsx
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    const unread = messages.filter((m) => !m.isFromVisitor && !m.readAt).length
    postToParent({ type: 'unread_count', count: unread })
  }, [messages])
```

`postToParent` dispara `window.postMessage` a cada mudança no array `messages`. Se 5 mensagens chegarem no mesmo segundo (cenário normal de inbound em rajada), são 5 postMessages para o parent. Pequeno, mas deveria ser **debounced** (ex. 300ms) — ou separado em dois useEffects: um para scroll, outro com debounce para unread count.

### `useRealtimeChat.ts` — bug crítico recente

Olhei o arquivo. A versão atual tem cleanup correto:

```83:86:crm-app/lib/hooks/useRealtimeChat.ts
    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])
```

Cleanup OK. Map de row→camelCase consistente. Inserção idempotente via `prev.some(m => m.id === row.id)` — bom.

**O que ainda incomoda:**

1. Linhas 51-58: o `.then(({ data }) => …)` é a "carga inicial" — promise não-cancelada. Se `sessionId` mudar antes da promise resolver, a primeira sessão pode "vazar" um `setMessages` na segunda. Pequeno, mas é um leak de race condition.
2. Linha 78: `setConnected(status === 'SUBSCRIBED')` mas não trata `CHANNEL_ERROR`, `TIMED_OUT`, `CLOSED`. O componente diz "Reconectando…" mesmo quando o WebSocket morreu permanentemente. Sem retry handler.
3. `sendMessage` (linha 88-103) chama `setMessages` para inserir otimisticamente, mas **não** insere antes do fetch — depois. Resultado: a mensagem só aparece quando o servidor responde. Otimista de verdade seria inserir antes com `pending: true` e reconciliar.

### `useState` que deveria ser `useReducer`

`ChatEmbed.tsx:95-101` — `useState<FormState>` com 4 campos + dois `useState<boolean>` + um `useState<string | null>`. São **7 pieces of state** no componente `ChatRegistration`. Candidate clássico para `useReducer` ou um `react-hook-form`.

### React Query — uso correto?

- `QueryProvider` montado em `app/layout.tsx:42`.
- **Apenas 1 hook usa:** `KanbanBoard.tsx:63-84` faz `useMutation` para mover deal.
- Nenhum `useQuery` em todo o projeto. As listagens (leads, deals, tasks, chat) são Server Components — não precisam de RQ. Mas se é só isso, **o React Query é overkill** para apenas o `useMutation` do Kanban. Poderia ser uma chamada direta com `useState` + `useTransition`.

### Memory leak em `KanbanBoard`

```81:83:crm-app/components/kanban/KanbanBoard.tsx
      // Reverter otimismo
      setStages(pipeline.stages)
    },
```

`pipeline.stages` é o estado **inicial** do SSR — não o anterior à mutation. Depois da 3ª movimentação com erro, o board reverte ao estado do load — não ao estado de antes da última ação. UX inconsistente. Deveria guardar `previousStages` antes do `mutate` e reverter para ele.

### Prop não usada

```24:24:crm-app/components/kanban/KanbanCard.tsx
export function KanbanCard({ deal, isDragging = false }: Props) {
```

Recebe `currentUserId` na interface (`Props.currentUserId`), mas o destructuring **ignora** a prop. Lint poderia pegar — não pega porque `Props` declara mas o destructuring é parcial. `KanbanColumn.tsx:55` passa fielmente. Dead prop ou esquecimento de feature.

---

## 6. Banco de Dados (Prisma)

### O que está bem

- Schema é **muito bem indexado** (`@@index` em todas as colunas FK + colunas de filtro frequente: `phone`, `whatsappPhone`, `instagramId`, `status+lastActivityAt`).
- **Soft delete consistente** via `deletedAt: DateTime?` em todas as tabelas críticas (User, Contact, Deal, Activity).
- **`@map` para snake_case** no DB — converte para camelCase no TS. Padrão profissional.
- **Decimal(12,2) para valor de deal** — correto, evita float drift.
- **`@db.Inet` para IPs** (LGPD audit) — semântica certa.

### Problemas reais

#### 6.1 — `upsert` em colunas sem `@unique` (BUG DE RUNTIME)

```190:241:crm-app/prisma/schema.prisma
model Contact {
  id              String        @id @default(uuid()) @db.Uuid
  fullName        String        @map("full_name") @db.Text
  email           String?       @db.Text
  phone           String?       @db.Text
  …
  instagramId     String?       @map("instagram_id") @db.Text
  …
  @@index([phone])
  @@index([whatsappPhone], map: "idx_contacts_whatsapp")
  @@index([instagramId], map: "idx_contacts_instagram")
```

Nem `phone`, nem `email`, nem `whatsappPhone`, nem `instagramId` têm `@unique`. **Mas**:

```52:66:crm-app/app/api/v1/webhooks/whatsapp/route.ts
    const contact = await prisma.contact.upsert({
      where:  { phone: phoneNormalized },
      …
```

```48:58:crm-app/app/api/v1/webhooks/instagram/route.ts
    const contact = await prisma.contact.upsert({
      where:  { instagramId: dm.from.id } as { instagramId: string },
      …
```

O `as` força o compiler a engolir, mas em **runtime** o Prisma lança:
```
PrismaClientValidationError: Argument `where` is missing.
The unique constraint `Contact_phone_key` does not exist on `Contact`.
```

Cada mensagem WhatsApp recebida → webhook lança erro → Meta retransmite → cria spam de erros no log. Resultado prático: **integração WhatsApp não funciona** ou funciona com side effects estranhos.

**Fix:** adicionar `@unique` em `phone` e `instagramId` (migration). Ou refatorar para `findFirst` + condicional + `create`.

#### 6.2 — `getOrCreateLeadSourceId` retorna `''` (BUG)

```134:137:crm-app/app/api/v1/webhooks/whatsapp/route.ts
async function getOrCreateLeadSourceId(type: string): Promise<string> {
  const source = await prisma.leadSource.findFirst({ where: { type: type as 'whatsapp' } })
  return source?.id ?? ''
}
```

Nome promete "GetOrCreate" — só faz "Get". Se a tabela `lead_sources` não tiver o seed `whatsapp`, retorna `''`. O upsert acima então tenta `connect: { id: '' }` → **FK violation** ou tipo Uuid inválido.

#### 6.3 — Queries N+1

`app/(dashboard)/chat/page.tsx:33-58`:

```33:42:crm-app/app/(dashboard)/chat/page.tsx
  const sessions: ChatSessionItem[] = await Promise.all(
    sessionsRaw.map(async (s) => {
      const unreadCount = await prisma.webchatMessage.count({
        where: {
          sessionId: s.id,
          isFromVisitor: true,
          readAt: null,
        },
      })
```

50 sessões = **51 queries** (1 listar + 50 counts). Prisma suporta `_count` filtrado dentro de `include`:

```typescript
include: {
  contact: { select: { fullName: true, companyName: true } },
  messages: { orderBy: { createdAt: 'desc' }, take: 1 },
  _count: { select: { messages: { where: { isFromVisitor: true, readAt: null } } } },
},
```

Reduz para 1 query. Em produção, com 50 sessões abertas, é a diferença entre 50ms e 2s.

#### 6.4 — Transações ausentes onde necessárias

| Local | Operações não-atômicas | Risco |
|---|---|---|
| `webhooks/whatsapp/route.ts:54-99` | `contact.upsert` + `whatsappMessage.create` + `interaction.create` | Se a 3ª falhar, fica msg WhatsApp sem `interaction`. Inbox desatualizado. |
| `webchat/messages/route.ts:37-53` | `webchatMessage.create` + `webchatSession.update` | Se update da sessão falhar, a mensagem existe mas `lastActivityAt` ficou velho — chat parece "morto". |
| `deals/[id]/stage/route.ts:48-63` | Apenas `deal.update`. **Mas o spec do Arnaldo prevê geração de `StageRequiredTask` ao mover** — está faltando. Subimplementado. |

**Fix:** envolver em `prisma.$transaction([…])` ou `$transaction(async (tx) => …)`.

#### 6.5 — `logAudit` fire-and-forget (CRÍTICO LGPD)

```28:42:crm-app/lib/audit.ts
  // Fire-and-forget com catch para não quebrar o fluxo principal
  prisma.auditLog.create({
    data: { … },
  }).catch((err) => console.error('[audit log error]', err))
}
```

A função declara `Promise<void>` mas **não retorna a promise** nem `await` ela. Em ambiente serverless (Vercel functions), assim que o handler responde, o runtime **pode** matar o processo antes do INSERT chegar no Postgres.

Resultado: audit log **inconsistente**. Para LGPD/Art. 37 da LGPD que exige rastreabilidade de tratamento de dados pessoais, isso é **não-conformidade**.

**Fix:** `await` a promise. Custo: ~20ms extra por request. Benefício: conformidade.

```diff
- prisma.auditLog.create({ data: { … } }).catch(…)
+ await prisma.auditLog.create({ data: { … } }).catch(…)
```

#### 6.6 — Conexões pool

`lib/db.ts:24-33` está correto. Singleton com `globalForPrisma`. Sem `connection_limit` explícito — assumindo que vem na URL via Supabase Pooler (porta 6543), está OK. Documentado nos comentários do arquivo. Bom.

#### 6.7 — Soft delete: consistência

`Contact`, `Deal`, `Activity`, `User` têm `deletedAt`. `Interaction`, `WhatsappMessage`, `WebchatSession` **não** têm. Decisão consciente (são imutáveis), mas não está documentado em ADR. Próximo dev vai duvidar.

---

## 7. Bugs Reais Identificados

Numerada em ordem de severidade.

### 7.1 `lib/auth.ts:18-21` — Cookies SSR no-op (P0)
**Bug:** Supabase refresh token nunca persistido. Sessão expira sem aviso.
**Snippet ruim:**
```typescript
set:    () => {},
remove: () => {},
```
**Fix:** Implementar setAll/getAll conforme guia oficial Supabase SSR.

### 7.2 `app/api/v1/webhooks/whatsapp/route.ts:54` — `upsert` sem `@unique` (P0)
**Bug:** `where: { phone }` em coluna não-única → erro Prisma em runtime.
**Snippet ruim:**
```typescript
const contact = await prisma.contact.upsert({
  where: { phone: phoneNormalized },
  …
})
```
**Fix:** Migration para `phone String @unique` + `npx prisma migrate dev`. Idem para `instagramId`.

### 7.3 `lib/audit.ts:28` — Audit log sem `await` (P0 — LGPD)
**Bug:** `prisma.auditLog.create()` fire-and-forget pode ser cortado pelo serverless runtime.
**Snippet ruim:**
```typescript
prisma.auditLog.create({ data: {…} }).catch(…)
```
**Snippet bom:**
```typescript
await prisma.auditLog.create({ data: {…} }).catch((err) =>
  console.error('[audit log error]', err)
)
```

### 7.4 `app/api/v1/deals/route.ts:65` + `whatsapp/send/route.ts:32,35` — `throw { object }` (P0)
**Bug:** Plain object não é `ApiError`, cai em fallback 500.
**Snippet ruim:**
```typescript
throw { status: 422, code: 'NO_LGPD_CONSENT', message: '…' }
```
**Snippet bom:**
```typescript
throw new ApiError(422, 'NO_LGPD_CONSENT', 'Contato sem consentimento LGPD')
// ou
throw Errors.UNPROCESSABLE('Contato sem consentimento LGPD')
```

### 7.5 `app/(dashboard)/chat/page.tsx:33-42` — N+1 (P1)
**Bug:** 51 queries para listar 50 sessões.
**Fix:** Usar `_count: { select: { messages: { where: {…} } } }` no `include`.

### 7.6 `app/api/v1/webhooks/whatsapp/route.ts:135-137` — LeadSource pode retornar '' (P1)
**Bug:** Função chamada `getOrCreate` só faz `get`. Pode causar FK violation.
**Fix:**
```typescript
async function getOrCreateLeadSourceId(type: LeadSourceType): Promise<string> {
  const existing = await prisma.leadSource.findFirst({ where: { type } })
  if (existing) return existing.id
  const created = await prisma.leadSource.create({
    data: { type, name: type, isActive: true },
  })
  return created.id
}
```

### 7.7 `app/(dashboard)/leads/[id]/page.tsx:28-32` — Enum incompleto (P1)
**Bug:** `DEAL_STATUS` declarado com `satisfies Record<DealStatus, …>` mas falta `archived`. TS erro ativo (mascarado por `ignoreBuildErrors`).
**Fix:** adicionar `archived: { label: 'Arquivado', variant: 'outline' }`.

### 7.8 `app/api/v1/webchat/messages/route.ts:15-32` — Envelope inconsistente (P1)
**Bug:** Retorna `{ error: 'string' }` em vez de `{ error: { code, message } }`. Mensagem nunca chega no `lib/api-client.ts` que espera `error.message`.
**Fix:** Usar `Errors.NOT_FOUND('Sessão')` + `Errors.UNPROCESSABLE('Sessão encerrada')` e deixar `handleApiError` formatar.

### 7.9 `components/kanban/KanbanBoard.tsx:82` — Revert otimista incorreto (P2)
**Bug:** `setStages(pipeline.stages)` reverte para o snapshot SSR inicial, não para o estado anterior à mutation.
**Fix:**
```typescript
const previousRef = useRef(stages)
const moveMutation = useMutation({
  mutationFn: …,
  onMutate: () => { previousRef.current = stages },
  onError: () => setStages(previousRef.current),
})
```

### 7.10 `components/kanban/KanbanCard.tsx:24` — Prop não usada (P2)
**Bug:** `currentUserId` declarado em `Props` mas ignorado no destructuring. Lint não pega.
**Fix:** Remover da interface OU implementar (provável intenção: destacar deals do user atual).

### 7.11 `app/embed/chat/ChatEmbed.tsx:294` — postMessage sem debounce (P2)
**Bug:** Spam para `window.parent` a cada nova mensagem.
**Fix:** Debounce de 300ms ou usar `useDeferredValue`.

### 7.12 `lib/ratelimit.ts:9` — Map em memória sem TTL cleanup (P2)
**Bug:** `Map<string, …>` cresce indefinidamente se o serverless instance ficar quente por horas. Não tem job de cleanup.
**Fix:** A cada N writes, varrer entradas com `resetAt < now` e deletar. Ou migrar para Vercel KV (Upstash) como o próprio comentário sugere.

### 7.13 `lib/hooks/useRealtimeChat.ts:51-58` — Race condition na carga inicial (P2)
**Bug:** Promise não-cancelada do `.then(({data}) => setMessages(...))`. Se `sessionId` muda antes do `then`, dados da sessão anterior vazam.
**Fix:**
```typescript
let cancelled = false
supabase.from(…).then(({data}) => {
  if (cancelled || !data) return
  setMessages(…)
})
return () => { cancelled = true; supabase.removeChannel(channel) }
```

### 7.14 `app/api/v1/webhooks/whatsapp/route.ts:74-99` — Múltiplos creates fora de transação (P2)
**Bug:** upsert + create + create. Se a 3ª quebrar, banco fica inconsistente.
**Fix:** `prisma.$transaction([...])`.

---

## 8. Dependências

### Versões arriscadas

- **`next: 16.1.6`** — Next 16 é muito novo (release oficial Out/Nov 2025). Em produção com WhatsApp + Stripe + LGPD, eu **não usaria** sem testes E2E robustos. A equipe pulou direto da 15 para a 16. Considerar voltar para 15.x se estabilidade for prioridade.
- **`react: 19.2.4`** — alinhado com Next 16, OK.
- **`@prisma/client: ^6.1.0`** — atual e estável. Bom.

### Mal classificadas

- **`@swc/helpers: 0.5.15`** em `dependencies`. Errado — é uma dep transitiva do SWC/Turbopack, não deveria estar listada aqui (`crm-app/package.json:48`). Remover.

### Possivelmente unused

- **`date-fns: ^4.1.0`** — busquei imports: zero. Tudo formatação de data usa `Intl.DateTimeFormat` em `lib/utils.ts`. **Remover.**
- **`decimal.js: ^10.4.3`** — usei grep: zero imports. `Deal.value` é `Decimal` do Prisma, mas é convertido com `Number(...)` em todo lugar. **Remover ou usar de verdade** (perde precisão senão).
- **`@radix-ui/react-toast: ^1.2.2`** — Toast usado é o `sonner`. Radix toast nunca importado. **Remover.**

### `tanstack/react-query` subutilizado

5.59.20 instalado, `QueryProvider` montado, **1 único `useMutation`** em todo o app. Para isso, 25KB+ no bundle do cliente. Considerar remover e usar `useTransition` + fetch direto.

### Bundle size estimado

Sem `next-bundle-analyzer` configurado, não dá pra dar número. Mas o dashboard tem: React Query + Radix (7 packages) + dnd-kit (3 packages) + lucide-react inteiro (importado por nome → tree-shaking funciona). Recomendado: rodar `@next/bundle-analyzer` uma vez e ver o que está no first-load.

---

## 9. Testes (estado)

**Inexistentes.** Confirmado com `Glob` em `**/*.test.*`, `**/*.spec.*`, `**/__tests__/**`: zero resultados.

Devs instalaram `vitest`, `@vitejs/plugin-react`, `happy-dom`, `msw`, `@playwright/test`, `vitest.config` configurado no `package.json:12-14`. **Mas nunca escreveram um teste.**

### O risco

| Sistema | Risco sem testes |
|---|---|
| Webhook WhatsApp (idempotência) | Mensagem duplicada cobra cliente 2x |
| Mover deal (hard block obrigatórias) | Deal pula etapa, salesman fura processo |
| RBAC (vendedor_atacado vê só B2B) | Vazamento de dados entre vendedores → LGPD |
| LGPD purge (cron mensal) | Anonimização errada apaga dados de clientes ativos |
| Auth refresh (lib/auth.ts) | Sessão expira sem aviso no meio de venda |

### Mínimo viável de testes

10 unit tests cobrindo:
1. `handleApiError` com `ZodError`, `ApiError`, `Error` genérico
2. Cada Zod schema (`CreateContactSchema`, `CreateDealSchema`, `MoveDealStageSchema`, `StartWebchatSchema`)
3. `requireDealOwnership` para cada role (4 roles)
4. `dealsWhereClause` para cada role

= 1 dia de trabalho. Não testar = irresponsável.

---

## 10. Recomendações Priorizadas

### P0 — Faz hoje/amanhã (total ~14h)

| # | Ação | Arquivos | Estimativa |
|---:|---|---|---:|
| 1 | Corrigir cookies SSR no `lib/auth.ts` (implementar `getAll/setAll`) | `lib/auth.ts` | 1h |
| 2 | Adicionar `@unique` em `contacts.phone` e `contacts.instagramId` + migration | `prisma/schema.prisma` + nova migration | 1h |
| 3 | `await` em `lib/audit.ts:28` (LGPD compliance) | `lib/audit.ts` | 15min |
| 4 | Substituir 3 `throw { object }` por `ApiError` / `Errors.*` | `app/api/v1/deals/route.ts`, `whatsapp/send/route.ts` | 30min |
| 5 | Remover `ignoreBuildErrors: true` e corrigir os 23 erros TS um a um | `next.config.ts` + 7 arquivos | 8h |
| 6 | `getOrCreateLeadSourceId` realmente criar source se faltar | `app/api/v1/webhooks/whatsapp/route.ts` | 30min |
| 7 | Padronizar envelope de erro em `webchat/{sessions,messages}/route.ts` | 2 arquivos | 30min |

### P1 — Próximos 5 dias (total ~12h)

| # | Ação | Estimativa |
|---:|---|---:|
| 8 | Fix N+1 em `chat/page.tsx` via `_count` | 30min |
| 9 | `error.tsx` em cada route group: `(dashboard)`, `embed`, `(auth)` + `global-error.tsx` | 2h |
| 10 | Quebrar `ChatEmbed.tsx` em `ChatRegistration.tsx`, `ChatConversation.tsx`, `EmbedHeader.tsx`, `FormField.tsx` | 2h |
| 11 | Envolver webhook WhatsApp em `prisma.$transaction` | 1h |
| 12 | Corrigir `DEAL_STATUS` para incluir `archived` | 5min |
| 13 | Escrever 10 unit tests mínimos (Zod + handleApiError + RBAC) | 6h |

### P2 — Próximas 2 semanas (total ~6h)

| # | Ação | Estimativa |
|---:|---|---:|
| 14 | Trocar tipos manuais por `Prisma.DealGetPayload<…>` no `KanbanBoard` | 1h |
| 15 | Migrar rate limit para Vercel KV ou Upstash Redis | 2h |
| 16 | Remover deps mortas (`date-fns`, `decimal.js`, `@radix-ui/react-toast`, `@swc/helpers`) | 30min |
| 17 | Mover `SendMessageSchema` duplicado para `lib/validators/webchat.ts` | 15min |
| 18 | Fix revert otimista em `KanbanBoard.tsx` | 30min |
| 19 | `isAdminOrGestor(user)` em vez de `['admin','gestor'].includes(user.role)` (6 lugares) | 30min |
| 20 | `useReducer` ou `react-hook-form` em `ChatRegistration` | 1h |

---

## 11. Veredicto Final

**Esse código é manutenível?** Por mim, sim — mas eu já conheço a stack. Para um dev novo entrando agora, **não.** Tem armadilhas demais: bugs mascarados pelo `ignoreBuildErrors`, padrões inconsistentes (`throw` plain object aqui, `ApiError` ali), schema sem `@unique` onde o código pressupõe que tem, audit log que pode ou não persistir. Vai cair em todas elas em ordem.

**Pode crescer?** Sim, com refatoração. O schema Prisma é a fundação mais sólida do projeto — bem indexado, normalizado, com soft delete. As rotas API têm o esqueleto certo (Zod + RBAC + handleApiError). Mas precisa **endurecer o que já existe** antes de adicionar features. Cada nova rota que copiar o padrão atual herda os mesmos bugs.

**Outros devs entendem?** Os arquivos pequenos (50-150 linhas) sim — `lib/db.ts`, `lib/errors.ts`, `lib/permissions.ts` são limpos. Os arquivos grandes (`ChatEmbed.tsx` 415 linhas, `instagram/route.ts` 148 linhas com `as` mascarando erro) precisam de quem escreveu para explicar. **Não passou no teste do "ler 10x mais do que escrever".**

**Resumo executivo:** Arquitetura B+. Implementação C+. Esses 7 P0s fechados (~14h de trabalho) elevam para B/B+ na implementação. Sem isso, vai dar dor de cabeça no primeiro mês de produção.

---

*Auditoria realizada com `pnpm exec tsc --noEmit`, leitura completa de `prisma/schema.prisma`, `lib/`, `app/api/v1/`, `app/(dashboard)/`, `app/embed/chat/`, components principais. Total: 41 arquivos lidos.*
