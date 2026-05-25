# Plano de Migração v4 → v5 — Para Fábio Fullstack

> **Autor:** Davi Designer · **Data:** 2026-05-25
> **Companion:** `design-system-v5.md` · `globals-css-v5.patch.md` · `wireframes-v5.md` · `adr-010-design-system-v5-dark.md`
> **Premissa:** branch separada `feat/design-system-v5` com PR único; Quésia valida ao final; deploy só após aprovação da Tania.
> **Decisões da Tania incorporadas:**
> - ✅ Pivot v4 light-first → v5 dark-first inspirado em painel analítico
> - ✅ Roxo da ref → **gold Techmalhas** (FAB, primary)
> - ✅ Teal da ref → **teal-sage `#5BA89A`** (derivado da marca)
> - ❌ Glassmorphism continua REJEITADO (mantido da v4)
> - ✅ Light mode disponível como **opt-in** (não removido)

---

## Estratégia de retrocompatibilidade

Princípio: **fazer o app inteiro virar dark com 2 arquivos (globals.css + tailwind.config)**, depois polir componente-a-componente sem rush. Tokens HSL via `hsl(var(--xxx))` propagam mudança sem refactor.

| Camada | Estratégia |
|---|---|
| **Tokens HSL** (`globals.css`) | Substituir 100% pelo arquivo do patch v5. App inteiro vira dark imediatamente |
| **Tokens diretos** (`tailwind.config.ts`) | Merge dos deltas v5; alias `brand.500 → gold` durante migração |
| **Classes literais** (`bg-brand-500`, `text-brand-500`) | Continuam funcionando, agora renderizam **gold** em vez de **ink/verde**. **É o efeito desejado** |
| **Fontes** | v4 T2 (Hind + Mono) deve ser feito antes ou junto com v5 T1 |
| **Componentes shadcn customizados** | Mantém variants antigas; novas variants (`feature`, `interactive`) são opt-in |
| **Theme provider** | `defaultTheme="dark"` (era "light" no v4 — switch crítico) |
| **Dependência nova** | `pnpm add recharts` (~50KB gzipped, dynamic import só em `/dashboard`) |

**Resultado:** após T1+T2+T3, o app já está dark e funcionando, sem nada quebrar. T4 em diante são refinos visuais e componentes novos.

---

## Tarefas (estimativa total: 18-24h, target 20h)

> Cada Tn tem: o que fazer · arquivos · horas estimadas · critério de "feito".
> Tasks T1-T3 são bloqueantes; T4-T16 podem rodar em paralelo se houver tempo de outro dev.

---

### T1 — Tokens CSS v5 + Tailwind config

**O que:** aplicar o patch do `globals-css-v5.patch.md` (arquivo inteiro) + atualizar `tailwind.config.ts` com os deltas.

**Arquivos:**
- `crm-app/app/globals.css` (substituir 100%)
- `crm-app/tailwind.config.ts` (merge dos deltas v5)

**Como:**
1. Copiar arquivo completo do patch para `globals.css`.
2. Em `tailwind.config.ts`, fazer merge das chaves `colors.bg`, `colors.fg`, `colors.metric`, `colors.chart`, `colors.brand` (atualizado), `colors.channel`, `colors.stage`, `colors.action`, `borderColor`, `borderRadius` (DEFAULT 0.75rem), `boxShadow` (v5 novos), `keyframes`, `animation`.
3. Rodar `pnpm typecheck` + `pnpm build` localmente.
4. Abrir o app local e confirmar visualmente: tudo virou dark; CTAs agora são gold; cards são `#141414`.

**Critério de feito:** `pnpm build` verde + screenshot do `/pipeline` mostrando canvas dark + sidebar dark + cards dark.

**Horas:** **2.5h** (maior que v4 T1 porque mais tokens + chart palette + stage colors dark)

---

### T2 — Configurar fontes Hind + JetBrains Mono (se não feito no v4)

**O que:** se v4 T2 ainda não foi aplicado, fazer agora.

**Arquivos:** `crm-app/app/layout.tsx`

**Como:** ver `migration-plan-v4.md` §T2 (idêntico). Importar Hind + JetBrains Mono via `next/font/google`, expor variáveis `--font-hind`, `--font-mono`.

**Critério de feito:** DevTools → Computed → `font-family` mostra "Hind" no body.

**Horas:** **0.5h** (skip se já feito)

---

### T3 — ThemeProvider default dark + toggle light

**O que:** configurar `next-themes` com default dark; adicionar item no `UserMenu` para alternar para light.

**Arquivos:**
- `crm-app/components/providers/ThemeProvider.tsx` (criar se não existe — já listado v4 T13)
- `crm-app/app/layout.tsx` (wrap com `<ThemeProvider>`)
- `crm-app/components/layout/UserMenu.tsx` (adicionar item toggle)

**Como:**

```tsx
// ThemeProvider.tsx
'use client'
import { ThemeProvider as NextThemes } from 'next-themes'
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={['dark', 'light']}
    >
      {children}
    </NextThemes>
  )
}

// layout.tsx — wrap
<html lang="pt-BR" suppressHydrationWarning>
  <body>
    <ThemeProvider>{children}</ThemeProvider>
  </body>
</html>

// UserMenu.tsx — adicionar item
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

const { theme, setTheme } = useTheme()

<DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
  Tema: {theme === 'dark' ? 'Claro' : 'Escuro'}
</DropdownMenuItem>
```

**Crítico:** `suppressHydrationWarning` no `<html>` evita warning de mismatch SSR/CSR.

**Critério de feito:**
- App carrega em dark direto (sem flash light → dark).
- Toggle persiste em localStorage.
- Default é **dark** (decisão Tania 2026-05-25, pivot v5).
- `next-themes` adiciona/remove a classe `light` no `<html>`.

**Horas:** **1h**

---

### T4 — Adicionar Recharts + setup base de chart wrappers

**O que:** instalar Recharts e criar 1 wrapper genérico para reaproveitar em AreaChart, BarChart e Sparkline.

**Arquivos:**
- `package.json` (add `recharts: ^2.13.0`)
- Criar `crm-app/components/charts/RechartsContainer.tsx` (Suspense + ResponsiveContainer wrapper)
- Criar `crm-app/components/charts/index.ts` (re-exports)

**Como:**

```bash
pnpm add recharts
```

```tsx
// RechartsContainer.tsx
'use client'
import { Suspense, lazy, ReactNode } from 'react'

const ResponsiveContainer = lazy(() =>
  import('recharts').then(m => ({ default: m.ResponsiveContainer }))
)

export function RechartsContainer({ height = 280, children }: { height?: number, children: ReactNode }) {
  return (
    <Suspense fallback={<div className="skeleton-shimmer-dark" style={{ height }} />}>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </Suspense>
  )
}
```

**Critério de feito:** `pnpm build` mantém bundle do `/pipeline` e `/leads` sem aumento (Recharts entra só onde for importado).

**Horas:** **1.5h**

---

### T5 — `KPIStatCard` componente

**O que:** criar componente reusável KPIStatCard com 3 variants (default, donut, feature) + sparkline animada + number counter.

**Arquivos:**
- Criar `crm-app/components/dashboard/KPIStatCard.tsx`
- Criar `crm-app/components/dashboard/Sparkline.tsx`
- Criar `crm-app/components/dashboard/DonutRing.tsx`
- Criar `crm-app/hooks/useCountUp.ts`

**Como:** ver §5.1 do `design-system-v5.md` para props + JSX completo.

Sparkline (SVG path puro, sem Recharts para reduzir bundle):

```tsx
// Sparkline.tsx
export function Sparkline({ points, width = 80, height = 32 }: { points: number[]; width?: number; height?: number }) {
  if (points.length < 2) return null
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1
  const step = width / (points.length - 1)
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step},${height - ((p - min) / range) * height}`).join(' ')
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke="hsl(var(--chart-primary))"
        strokeWidth={1.5}
        strokeLinecap="round"
        className="sparkline-path"
        style={{ filter: 'drop-shadow(0 0 4px rgba(91,168,154,0.4))' }}
      />
    </svg>
  )
}
```

**Critério de feito:** página de teste renderiza 4 KPIStatCards com valores animando (count-up) + sparkline desenhando ao mount.

**Horas:** **2.5h**

---

### T6 — `FilterBar` componente

**O que:** criar FilterBar com date range picker + 3 dropdowns (pipeline/vendedor/canal) sticky.

**Arquivos:**
- Criar `crm-app/components/dashboard/FilterBar.tsx`
- Considerar adicionar `react-day-picker` para date range (peso ~10KB; ou usar 2 selects "Inicial" / "Final" para evitar dep)

**Critério de feito:** filtros sticky no topo do `/dashboard`; mudar filtro dispara refetch (mock por enquanto, integração com TanStack Query depois).

**Horas:** **1.5h**

---

### T7 — `RecommendationCard` (3 colunas adaptadas)

**O que:** criar componente com 3 cards horizontais (desktop) / swipe horizontal (mobile).

**Arquivos:**
- Criar `crm-app/components/dashboard/RecommendationCard.tsx`
- Criar `crm-app/components/dashboard/RecommendationGrid.tsx` (wrapper 3-cols / swipe-mobile)

**Mockup de conteúdo (com dados reais do backend):**

```tsx
const recommendations = [
  {
    icon: <Inbox />,
    title: '3 leads sem resposta',
    body: 'Você arrisca perder esses leads. Responda agora.',
    cta: 'Ver leads',
    href: '/leads?filter=sem-resposta-24h',
  },
  {
    icon: <Clock />,
    title: '5 tarefas vencidas',
    body: 'Reagendar ou concluir antes que o cliente reclame.',
    cta: 'Reagendar',
    href: '/tarefas?filter=vencidas',
  },
  {
    icon: <Target />,
    title: 'Meta do mês: 62% concluída',
    body: 'R$ 67.5k de R$ 110k. Faltam 8 dias.',
    cta: 'Ver pipeline',
    href: '/pipeline',
  },
]
```

**Critério de feito:** 3 cards renderizam com ícone gold + título + body + CTA gold; mobile vira swipe horizontal (scroll-snap-type CSS).

**Horas:** **1.5h**

---

### T8 — `AreaChartGlow` componente (Recharts)

**O que:** componente de line chart com gradient fill + glow, conforme §5.4 do `design-system-v5.md`.

**Arquivos:**
- Criar `crm-app/components/charts/AreaChartGlow.tsx`

**Critério de feito:** renderizar `<AreaChartGlow data={...} dataKey="receita" />` mostra linha teal-sage com gradient fill + drop-shadow glow.

**Horas:** **2h**

---

### T9 — `PatternBar` componente

**O que:** barras horizontais proporcionais (CSS puro, sem Recharts).

**Arquivos:**
- Criar `crm-app/components/dashboard/PatternBar.tsx`

**Critério de feito:** componente recebe `[{ label, value, color }]` e renderiza barras com `scaleX 0 → 1` animation no mount.

**Horas:** **1h**

---

### T10 — `GroupedBarChart` componente (Recharts)

**O que:** barras agrupadas 12 meses (ganhos verde + perdidos vermelho).

**Arquivos:**
- Criar `crm-app/components/charts/GroupedBarChart.tsx`

**Critério de feito:** renderizar `<GroupedBarChart data={...} />` mostra 12 grupos de 2 barras com cores positive/negative.

**Horas:** **1.5h**

---

### T11 — `DataTableDark` refactor (tabela leads recentes)

**O que:** componente de tabela com header text-muted uppercase, row hover bg-elevated/50, tag pills coloridas, ícone edit.

**Arquivos:**
- Criar `crm-app/components/leads/DataTableDark.tsx`
- Refatorar `LeadsTable.tsx` existente (se houver) para usar `DataTableDark`

**Critério de feito:** tabela renderiza com hover suave, tags coloridas, ícone edit aparece no hover; mobile vira stack de cards.

**Horas:** **1.5h**

---

### T12 — `FABGold` componente

**O que:** botão flutuante gold canto inferior direito.

**Arquivos:**
- Criar `crm-app/components/ui/fab.tsx`
- Adicionar em `/dashboard`, `/pipeline`, `/leads`, `/chat`, `/tarefas` (contexto-aware: ícone+ação muda por página)

**Critério de feito:** FAB visível em todas as 5 telas; clica → abre dialog "Novo lead/conversa/tarefa" conforme contexto; atalho **N** funciona.

**Horas:** **1h**

---

### T13 — Refactor Dashboard (compor todos componentes v5)

**O que:** refatorar `dashboard/page.tsx` para usar a nova estrutura (FilterBar → KPIs → AreaChart+PatternBar → Recommendations → GroupedBar → DataTable).

**Arquivos:**
- `crm-app/app/(dashboard)/dashboard/page.tsx` (reescrever layout)
- Criar/atualizar queries TanStack Query para fornecer os dados de KPI/sparkline/AreaChart/PatternBar/GroupedBar/recent leads

**Critério de feito:** dashboard renderiza com a estrutura da referência adaptada; stagger de entrada visível (80ms entre seções); FAB no canto.

**Horas:** **3h**

---

### T14 — Refactor Login (dark hero) + criar `BrandMark` (decisão Tania 2026-05-25)

**O que:**
1. Trocar `bg-hero-mesh` para versão dark (já no `globals.css` v5 — opacidades menores); card vira `bg-elevated` com inner-highlight gold 4%; CTA "Entrar" agora é gold.
2. **Criar componente `BrandMark`** (decisão Tania pós-mockups: monograma "TM" em Hind 700 gold destacado, NÃO "T" genérico em quadrado). Spec completa em `design-system-v5.md` §5.9.
3. **Criar `app/icon.svg`** (Next 16 file convention) com TM em Hind 700 gold sobre fundo dark — gera favicon automático.
4. Substituir o atual "T" em quadrado por `<BrandMark variant="hero" />` no Login, e por `<BrandMark variant="sidebar" />` na Sidebar (afeta também T15/T16/T17 onde a sidebar aparece — mas o componente é o mesmo, sem refactor extra).

**Arquivos:**
- `crm-app/app/(auth)/login/page.tsx`
- Criar `crm-app/components/brand/BrandMark.tsx` (snippet pronto em `design-system-v5.md` §5.9.5)
- Criar `crm-app/app/icon.svg` (snippet pronto em `design-system-v5.md` §5.9.7)
- `crm-app/components/layout/Sidebar.tsx` (substituir logo placeholder por `<BrandMark variant="sidebar" />` ou `"sidebar-collapsed"`)

**Mudança principal:** o card era branco; agora é `bg-elevated`. Inputs eram bg branco; agora `bg-sunken`. CTA era ink; agora gold. **Monograma deixa de ser "T" em quadrado e vira "TM" tipográfico Hind 700 gold com glow sutil.**

**Critério de feito:**
- Login carrega em dark; mesh sutil visível; card destacado por elevação + border-gold-soft.
- `<BrandMark variant="hero" />` renderiza no centro do card: "TM" 40px gold com glow + "CRM" 12px muted abaixo.
- Sidebar (todas as rotas internas) mostra `<BrandMark variant="sidebar" />` no topo: "TMechmalhas" inline com TM 28px gold+glow e "echmalhas" 14px muted.
- Favicon do browser tab mostra TM gold sobre quadrado dark rounded.
- Glow respeita `prefers-reduced-motion` (estático, sem transição de hover).

**Horas:** **2h** (era 1h sem BrandMark; +1h para componente + favicon SVG + integrar em login/sidebar/avatar fallback)

---

### T15 — Refactor Pipeline Kanban dark

**O que:** ajustar cards Kanban + drawer para dark; **preservar stage colors** mas usar versão dark (chip bg 16% + texto cor pura).

**Arquivos:**
- `crm-app/components/pipeline/KanbanCard.tsx`
- `crm-app/components/pipeline/KanbanColumn.tsx` (header com stage-chip)
- `crm-app/components/pipeline/LeadDetailDrawer.tsx`

**Mudança principal:** cards eram bg branco com sombra leve; agora `bg-card` + `border-sutil`. Hover ganha `border-gold-soft` em vez de sombra sage. Drawer vira `bg-elevated`.

**Critério de feito:** todas as 6 colunas com header colorido por stage (dark chip); cards opacos com hover dourado sutil; drawer abre sólido.

**Horas:** **1.5h**

---

### T16 — Refactor Leads list dark

**O que:** aplicar `DataTableDark` (T11) na rota `/leads`. Mobile vira stack de cards `bg-card` + `border-sutil`.

**Arquivos:**
- `crm-app/app/(dashboard)/leads/page.tsx`
- `crm-app/components/leads/LeadCardMobile.tsx`

**Critério de feito:** lista responsiva dark; FAB gold visível; hover row suave; bulk select funciona.

**Horas:** **1h**

---

### T17 — Refactor Chat dark + QA WCAG + print stylesheet

**O que:**
- Bolhas: recebida `bg-elevated` + `text-primary`; enviada `bg-gold` + `text-ink` (mantém afirmação da marca).
- Presence dot: `pulse-live` `--metric-positive`.
- Input sticky: `bg-sunken` + `input-focus-glow` (v4 mantido).
- Sidebar de conversas: `bg-card` + item ativo `bg-elevated`.
- **QA WCAG AA dark** com axe DevTools (24+ pares).
- **Print stylesheet** já está no patch v5 — validar print preview no `/dashboard` força light.

**Arquivos:**
- `crm-app/components/chat/MessageBubble.tsx`
- `crm-app/components/chat/ChatInput.tsx`
- `crm-app/components/chat/ConversationHeader.tsx`
- `crm-app/components/chat/ConversationListItem.tsx`

**Critério de feito:**
- Bolhas visualmente diferenciadas (recebida elevated / enviada gold).
- Presence pulsa green.
- Input com ring-pulse gold no focus.
- axe DevTools = 0 violações de contraste no dark.
- Print preview do `/dashboard` mostra layout branco.

**Horas:** **1.5h**

---

## Ordem de execução recomendada

```
T1 → T2 → T3      (bloqueantes — fundação)
   ↓
T4 (Recharts)     (bloqueante para T5/T8/T10)
   ↓
┌─ T5 KPIStatCard ─┐
├─ T6 FilterBar    ┤
├─ T7 Recommend.   ┤ ← podem rodar em paralelo se houver bandwidth
├─ T8 AreaChart    ┤
├─ T9 PatternBar   ┤
├─ T10 GroupedBar  ┤
├─ T11 DataTable   ┤
├─ T12 FABGold     ┘
   ↓
T13 Dashboard (compõe tudo)
   ↓
┌─ T14 Login      ─┐
├─ T15 Kanban      ┤ ← podem rodar em paralelo
├─ T16 Leads       ┤
└─ T17 Chat + QA  ─┘
```

### Pontos de commit sugeridos

| Commit | Tasks | Mensagem |
|---|---|---|
| 1 | T1+T2 | `feat(theme): v5 dark-first tokens + Hind font` |
| 2 | T3 | `feat(theme): ThemeProvider default dark + light toggle` |
| 3 | T4 | `feat(charts): add Recharts dependency + lazy container` |
| 4 | T5 | `feat(dashboard): KPIStatCard with sparkline + count-up` |
| 5 | T6 | `feat(dashboard): FilterBar sticky horizontal` |
| 6 | T7 | `feat(dashboard): RecommendationCard 3-cols + mobile swipe` |
| 7 | T8 | `feat(charts): AreaChartGlow with gradient + drop-shadow` |
| 8 | T9 | `feat(dashboard): PatternBar horizontal proportional` |
| 9 | T10 | `feat(charts): GroupedBarChart 12 months gain vs loss` |
| 10 | T11+T12 | `feat(ui): DataTableDark + FABGold global` |
| 11 | T13 | `feat(dashboard): compose v5 layout from reference` |
| 12 | T14 | `feat(login): dark hero + elevated card + gold CTA` |
| 13 | T15 | `feat(pipeline): Kanban dark cards + drawer elevated` |
| 14 | T16 | `feat(leads): apply DataTableDark + mobile cards dark` |
| 15 | T17 | `feat(chat): dark bubbles + presence pulse + WCAG dark audit` |

Cada commit deve passar `pnpm typecheck && pnpm build` antes de ser empurrado.

---

## Checklist de QA (para Quésia validar ao final)

### Visual (dark default)
- [ ] App carrega em dark sem flash (FOUC)
- [ ] Toggle no UserMenu alterna para light e persiste após reload
- [ ] Login: canvas dark + card elevated + CTA gold; mesh visível mas discreto
- [ ] Dashboard: FilterBar sticky; 4 KPIs com sparkline animando; AreaChart com glow teal-sage; PatternBar com tints dos canais; 3 Recommendations com CTA gold; GroupedBar 12 meses; DataTable de leads recentes; FAB gold canto inferior direito
- [ ] Pipeline Kanban: 6 colunas com stage chips dark; cards opacos com hover gold sutil; drawer abre `bg-elevated`
- [ ] Leads: DataTable dark com hover row + chevron edit aparece no hover; FAB gold
- [ ] Chat: bolhas recebida elevated / enviada gold; presence pulse green; input focus ring gold
- [ ] FAB gold visível em Dashboard, Pipeline, Leads, Chat, Tarefas (contexto-aware)
- [ ] Print preview do Dashboard renderiza branco (papel)

### Tipografia
- [ ] Body usa Hind (DevTools: Computed → font-family)
- [ ] KPI values com `font-kpi` (JetBrains Mono, tabular-nums)
- [ ] Heading h1/h2/h3 com Hind 700 tracking-tight

### Acessibilidade (dark)
- [ ] Contraste texto principal (`#F5F6F7` sobre `#0A0B0D`): **17.8:1 ✅ AAA**
- [ ] Contraste CTA gold (ink sobre gold): **7.7:1 ✅ AAA**
- [ ] Contraste delta positivo (`#3DD58C` sobre canvas): **7.2:1 ✅ AAA**
- [ ] Contraste delta negativo (`#E5614A` sobre canvas): **5.4:1 ✅ AA**
- [ ] Contraste chart-primary teal-sage (`#5BA89A` sobre canvas): **5.2:1 ✅ AA**
- [ ] Focus ring gold visível em todos os botões/inputs ao Tab
- [ ] `prefers-reduced-motion`: sparkline draw, pulse-live, ring-pulse, fab transitions desligam
- [ ] Touch targets ≥ 44px (FAB 56px ✓, bottom nav items 75px ✓, KanbanCard hit area ≥ 44px)
- [ ] Screen reader anuncia "online" (não só visual via pulse dot)
- [ ] **axe DevTools no Dashboard dark: 0 violações de contraste**
- [ ] **axe DevTools alternando para light: 0 violações de contraste**

### Performance
- [ ] Lighthouse Performance > 80 (mobile) — recharts adiciona ~50KB mas dynamic import contém impacto na `/dashboard`
- [ ] Lighthouse Accessibility = 100
- [ ] First Contentful Paint < 2s
- [ ] Cumulative Layout Shift < 0.05 (Hind `display: swap` + chart skeleton placeholder mesma altura)
- [ ] Bundle do `/dashboard` aumenta ≤ 60KB gzipped (Recharts lazy)
- [ ] Bundle do `/pipeline`, `/leads`, `/chat` não aumenta (Recharts não importado nessas rotas)

### Funcional (não-regressão)
- [ ] Login com email/password funciona
- [ ] Login com Google funciona
- [ ] Pipeline drag-drop preserva ordem
- [ ] Drawer de detalhe abre/fecha
- [ ] Chat envia mensagem (botão ➤)
- [ ] Theme toggle persiste após reload
- [ ] FilterBar `dateRange` muda filtro do dashboard
- [ ] FAB "Novo lead" abre dialog corretamente
- [ ] Atalho **N** abre dialog do FAB
- [ ] Recommendations CTAs navegam para a rota correta

### Browsers
- [ ] Chrome 122+ (desktop + mobile)
- [ ] Safari 17+ (iPhone Vitor)
- [ ] Firefox 124+ (validar `border-gradient-feature` no Firefox — `background-clip` é suportado)
- [ ] Edge 122+
- [ ] WebView in-app (testar em WhatsApp Business / Instagram in-app browser do iOS antigo — não deve haver `backdrop-filter` em nenhum lugar)

---

## Riscos técnicos a observar

1. **FOUC light → dark no first paint.** `next-themes` com `defaultTheme="dark"` + `<script>` inline no `<head>` resolve. `suppressHydrationWarning` no `<html>` evita warning React. Testar em conexão 3G simulada (Network throttling DevTools).

2. **Bundle size da rota /dashboard.** Recharts é dynamic imported, mas se o cliente abrir o dashboard primeiro, são +50KB. Mitigação: prefetch via `next/link` no header. Aceitável dado o ganho visual.

3. **Contraste de stage colors no dark.** Stages amarelo/laranja podem ficar < 4.5:1 sobre canvas se usados como texto puro. Mitigação: sempre usar como `chip bg 16% + texto cor`, nunca como texto sobre canvas. Já modelado no `globals.css` v5 via `--stage-*-bg`.

4. **Sparkline animation conflito com `prefers-reduced-motion`.** Já mitigado no patch v5: `@media (prefers-reduced-motion: reduce)` desativa `.sparkline-path` animation.

5. **Tailwind purging classes dinâmicas de stage.** Se usar `bg-stage-${stage}-bg` interpolado em runtime, Tailwind purga. Mitigação: usar `cn()` com classes literais OU adicionar safelist no `tailwind.config.ts`:
   ```ts
   safelist: [
     'bg-stage-new-bg', 'bg-stage-contact-bg', 'bg-stage-proposal-bg',
     'bg-stage-negotiation-bg', 'bg-stage-won-bg', 'bg-stage-lost-bg',
     'text-stage-new', 'text-stage-contact', 'text-stage-proposal',
     'text-stage-negotiation', 'text-stage-won', 'text-stage-lost',
   ]
   ```

6. **`border-radius: 0.75rem` aumentou** — alguns cards densos do Kanban podem parecer "muito arredondados". Se Quésia reclamar, criar `--radius-card-dense: 0.5rem` para Kanban cards apenas.

7. **Print stylesheet força light.** Se Tania imprimir dashboard para reunião, o print sai branco/papel. Validar com `Cmd+P` no Chrome no `/dashboard`. Já no patch.

8. **`color-scheme` meta** — `html { color-scheme: dark }` faz scrollbar nativa virar dark no Chrome/Firefox. Inputs `<input type="date">` também ganham tema dark nativo. Validar em Safari (color-scheme suportado desde Safari 13).

---

## Estimativa total

| Faixa | Cenário |
|---|---|
| **18h** | Tudo correr bem, Recharts integra de primeira, dark mode sem FOUC, sem regressões funcionais |
| **20h** | **Estimativa target** (inclui buffer para 1-2 quirks de chart styling e ajuste fino de contraste) |
| **24h** | Pior caso (Recharts precisa de patches de styling, sparkline animation precisa polish, axe DevTools encontra 2-3 violações de contraste em chips de stage que precisam recalibrar) |

**Recomendação:** alocar **20h** (~2,5 dias úteis do Fábio). Se Tania quer mockups visuais antes (resposta da pergunta 1 da `analise-referencia-tania.md`), adicionar +15min para Davi gerar mockups via GenerateImage e +1h para Tania revisar antes de Fábio começar.

### Soma analítica das horas

| T | Tarefa | Horas |
|---|---|---|
| T1 | Tokens CSS v5 + Tailwind config | 2.5 |
| T2 | Configurar fontes Hind + Mono (se não feito v4) | 0.5 |
| T3 | ThemeProvider default dark + toggle | 1.0 |
| T4 | Recharts dep + container wrapper | 1.5 |
| T5 | KPIStatCard + Sparkline + DonutRing + useCountUp | 2.5 |
| T6 | FilterBar | 1.5 |
| T7 | RecommendationCard + RecommendationGrid | 1.5 |
| T8 | AreaChartGlow | 2.0 |
| T9 | PatternBar | 1.0 |
| T10 | GroupedBarChart | 1.5 |
| T11 | DataTableDark | 1.5 |
| T12 | FABGold | 1.0 |
| T13 | Dashboard page restructure (compose v5) | 3.0 |
| T14 | Login dark + `BrandMark` (TM Hind) + favicon SVG | 2.0 |
| T15 | Pipeline Kanban dark | 1.5 |
| T16 | Leads list dark | 1.0 |
| T17 | Chat dark + QA WCAG + print validation | 1.5 |
| **Soma bruta** | | **26.0h** |
| **Concorrência/reuso** | (~20% das tarefas se sobrepõem em componentes shadcn já refatorados) | **−5.0h** |
| **Estimativa target** | | **~21h** (era 20h antes da inclusão do `BrandMark`; +1h cabe na faixa 18-24h) |

> O cálculo `25h − 20%` é conservador. Se Tania aceitar o pivot rapidamente e Fábio puder dedicar 2 dias inteiros (sem interrupções), 18h é alcançável.

---

## Critério de "Pronto para Tania aprovar"

Após T17 + QA Quésia:

1. Branch `feat/design-system-v5` com PR único contendo todos os 15 commits.
2. Vercel preview deployment funcionando (link colado no PR).
3. Tania abre link, faz tour rápido (login → dashboard → pipeline → leads → chat).
4. Tania aprova → merge → deploy produção.

Se Tania quer dark mode **forçado** (sem opção de light), Fábio remove o `DropdownMenuItem` do ThemeToggle (manter `ThemeProvider` para o caso de querer voltar). Custo: 5min.

---

*Plano de migração v5 — Davi Designer | CRM Techmalhas | 2026-05-25*
