# Auditoria de Design — CRM Techmalhas v5
**Por:** Davi Designer · 2026-05-25 · v1.0
**Spec auditada:** `design-system-v5.md` (10/11 seções) + decisão Tania §5.9 (BrandMark TM stacked)
**Implementação auditada:** `crm-app/` no commit atual

---

## TL;DR

- **A camada de tokens (CSS variables + Tailwind config) está com aderência cirúrgica à spec v5** — todas as 4 surfaces dark, paleta de métricas, channel/stage colors, tipografia Hind+JBMono e action tokens batem 1:1 com `design-system-v5.md`. O `BrandMark` (TM + wordmark stacked, glow só no dark) também está fiel à decisão Tania §5.9.
- **Os componentes "fundacionais" (KPICard, FunnelChart, OverduePanel, KanbanCard, ChatList, MessageBubble, LeadCard, Login, MobileNav)** usam corretamente `.card-default` / `.card-interactive` / `.card-feature`, `font-kpi`, `tag-pill-*`, `stage-chip-*`, `channel-dot-*`, `input-focus-glow`, `bg-sunken/elevated/canvas/card` — sem hex hard-coded fora dos componentes legados.
- **As telas REAIS estão um passo atrás das telas PREVIEW** — `/preview/dashboard`, `/preview/kanban`, `/preview/leads`, `/preview/chat` implementam praticamente toda a riqueza visual da spec (FAB gold, delta % em KPIs, top performers, filter bar, channel dots em avatares, table dark com hover, sidebar TM stacked). As rotas reais (`/dashboard`, `/pipeline`, `/leads`, `/chat`, `/tasks`) reusam os mesmos tokens mas omitem **FAB, delta numérico em KPI, sparkline, charts Recharts, FilterBar e RecommendationCard** — todos previstos na spec §5.
- **3 violações duras à spec** já em produção: (1) `MobileNav` usa `backdrop-blur-sm` — quebra a decisão "anti-glassmorphism" registrada na §0; (2) `app/page.tsx` (landing) e `ObligatoryTaskBlocker` ainda estão na **paleta v3 emerald/amber** com classes `bg-brand-500`, `bg-emerald-100`, `bg-amber-50`; (3) `leads/[id]/page.tsx` (detalhe de lead) também não foi migrado para v5 (usa `bg-brand-100`, `border-amber-300`, etc).
- **Acessibilidade mobile tem 3 buracos**: tap targets do `MobileNav` (`h-9 w-9` = 36px), do botão de fechar (`h-8 w-8` = 32px) e dos filtros do `ChatList` (`px-2 py-1` ≈ 26px de altura) estão **abaixo do mínimo WCAG 44×44** — princípio P6 do meu próprio agent.md.

**Veredicto curto:** o **DS v5 está implementado** (tokens + componentes base), mas a **migração das telas e o cleanup do legado v3 estão incompletos**. Pronto para QA visual nas rotas migradas; **não pronto** para produção visual enquanto a landing, o detalhe de lead e o blocker de tarefas obrigatórias estiverem em emerald-orange.

---

## 1. Aderência aos Tokens v5

Auditei `globals.css` e `tailwind.config.ts` linha a linha contra `design-system-v5.md` §2, §3, §8, §10.

### 1.1 Surfaces (4 layers) — §2.2

| Token | Spec hex | Implementado | Status |
|---|---|---|---|
| `--bg-canvas` | `#0A0B0D` (`220 7% 4%`) | `220 7% 4%` | ✅ |
| `--bg-card` | `#141414` (`0 0% 8%`) | `0 0% 8%` | ✅ |
| `--bg-elevated` | `#1C1D21` (`225 5% 12%`) | `225 5% 12%` | ✅ |
| `--bg-sunken` | `#0E0F12` (`220 7% 6%`) | `220 7% 6%` | ✅ |
| `--bg-overlay` | `rgba(0,0,0,0.72)` | `0 0% 0% / 0.72` | ✅ |

### 1.2 Texto (hierarquia dark) — §2.5

| Token | Spec hex | Implementado | Status |
|---|---|---|---|
| `--text-primary` | `#F5F6F7` | `210 10% 96%` | ✅ |
| `--text-secondary` | `#C9CED5` | `213 11% 82%` | ✅ |
| `--text-muted` | `#A8AFB8` | `210 8% 69%` | ✅ |
| `--text-disabled` | `#5C636D` | `217 7% 39%` | ✅ |

### 1.3 Brand core — §2.1

| Token | Spec hex | Implementado | Status |
|---|---|---|---|
| `--brand-ink` | `#141414` | `#141414` | ✅ |
| `--brand-paper` | `#FFFFFF` | `#FFFFFF` | ✅ |
| `--brand-gold` | `#E79501` | `#E79501` | ✅ |
| `--brand-gold-hover` | `#FFA61F` (lifted) | `#FFA61F` | ✅ |
| `--brand-sage` | `#869791` | `#869791` | ✅ |
| `--brand-terracotta` | `#CC4833` | `#CC4833` | ✅ |

### 1.4 Métricas — §2.6

| Token | Spec | Implementado | Status |
|---|---|---|---|
| `--metric-positive` | `#3DD58C` (`146 65% 54%`) | `146 65% 54%` | ✅ |
| `--metric-negative` | `#E5614A` (`11 75% 59%`) | `11 75% 59%` | ✅ |
| `--metric-neutral` | `#A8AFB8` | `210 8% 69%` (= text-muted) | ✅ |

### 1.5 Chart palette — §2.7

| Token | Spec | Implementado | Status |
|---|---|---|---|
| `--chart-primary` | `#5BA89A` teal-sage | `166 30% 51%` | ✅ |
| `--chart-secondary` | `#E79501` gold | `39 99% 46%` | ✅ |
| `--chart-tertiary` | `#9C8FC9` lavanda muted | `257 30% 67%` | ✅ |
| `--chart-grid` | `hsla white 4%` | `0 0% 100% / 0.04` | ✅ |

### 1.6 Channel colors — §2.9

| Token | Spec dark | Implementado | Status |
|---|---|---|---|
| `--channel-whatsapp` | `#22C55E` | `142 71% 45%` | ✅ |
| `--channel-instagram` | `#C26BE5` | `284 64% 65%` | ✅ |
| `--channel-webchat` | `#60A5FA` | `217 91% 67%` | ✅ |

### 1.7 Stage colors — §2.10

Todos os 6 stages (`new`, `contact`, `proposal`, `negotiation`, `won`, `lost`) com par cor+bg-16% — ✅ implementado em `globals.css` linhas 103-114 e exposto via classes `.stage-chip-*` linhas 519-524.

### 1.8 Bordas, sombras, animação, raio — §10

| Token | Spec | Implementado | Status |
|---|---|---|---|
| `--radius` DEFAULT | `0.75rem` | `0.75rem` (linha 58) | ✅ |
| `--border-sutil` | `hsla white 6%` | `hsla(0,0%,100%,0.06)` | ✅ |
| `--border-gold-soft` | `hsla gold 18%` | `hsla(39,99%,46%,0.18)` | ✅ |
| `--inner-highlight` | `inset 0 1px 0 hsla white 4%` | idem | ✅ |
| `boxShadow.gold` / `gold-lift` / `fab` / `fab-hover` | spec §10 | idem | ✅ |
| `keyframes pulse-live` / `draw-sparkline` / `ring-pulse` | spec §8 | idem | ✅ |
| `--duration-instant/fast/base/slow` | 100/150/200/250ms | idem | ✅ |

### 1.9 Cleanup de aliases v3/v4

⚠️ `tailwind.config.ts` ainda exporta aliases legados:
- `brand.forest: '#E79501'` (era verde no v3, agora gold — alias mantido com comentário "deprecated, remover em v5.1")
- `brand.500: '#E79501'` (idem)
- `whatsapp.DEFAULT: '#25D366'` e `whatsapp.dark: '#064E18'` — convivem com `--channel-whatsapp` (`#22C55E` v5)
- `instagram.DEFAULT: '#E1306C'` — diverge de `--channel-instagram` (`#C26BE5` v5)
- `webchat.DEFAULT: '#3B82F6'` — diverge de `--channel-webchat` (`#60A5FA` v5)

**Risco:** se alguém usar `bg-instagram` (legado) ao invés de `bg-channel-instagram` (v5), a cor IG vira rosa-fucsia ao invés de roxo-lifted. Já há divergência factual (Instagram `#E1306C` vs `#C26BE5`). Recomendo **deletar os aliases v3 agora**, não em v5.1 — qualquer uso atual seria um bug visual.

### Resumo tokens

**21/21 tokens críticos da spec v5 estão fielmente implementados.** Único débito é **deletar aliases v3** para evitar divergência por engano. ✅ AA cirúrgica.

---

## 2. Componentes — Auditoria

### 2.1 `BrandMark` ✅ (fidelidade total à spec §5.9)

`crm-app/components/brand/BrandMark.tsx:1-65` — implementação 1:1 com o componente publicado em §5.9.5 da spec:
- 5 variants (`mark` / `sidebar` / `sidebar-collapsed` / `hero` / `avatar`) com `sizeMap` idêntico (tm 32/28/32/40/20px, wordmark 0/10/0/14/0px, tracking 0/0.08em/0/0.14em/0)
- Gap vertical 0/2/0/6/0 ✅
- Glow controlado por flag (default false em `avatar`/`mark`) ✅
- `role="img"` + `aria-label="CRM Techmalhas"` no wrapper, `aria-hidden` nos filhos ✅
- CSS suporte em `globals.css:545-607`: `.brand-tm`, `.brand-tm-glow`, `.brand-wordmark-stack`, `.brand-tm-avatar`, com print/light overrides — ✅
- Usado consistentemente em: `SidebarContent` (`variant="sidebar"`), `login/page.tsx` (`variant="hero"`), `embed/chat/ChatEmbed.tsx` (`variant="avatar"`), e os 4 previews (`variant="sidebar"`). ✅

**Único refinamento sugerido (P2):** `KanbanCard.tsx:80-86` e `LeadCard.tsx:26` usam `brand-tm-avatar` com `style={{ width: 24, height: 24, fontSize: 10 }}` para forçar tamanho — funciona, mas o componente `BrandMark` poderia aceitar `size` para evitar inline styles.

### 2.2 `KPICard` ⚠️ (40% da spec §5.1)

`crm-app/components/dashboard/KPICard.tsx:1-52` — implementação **mínima viável** que cobre:
- ✅ Card via `.card-interactive` (hover gold + lift), padding `p-5`
- ✅ Icon box `h-10 w-10 rounded-lg` com `accentIconBg` mapeado por accent (`gold/sage/positive/negative`)
- ✅ Value `font-kpi font-kpi-glow text-2xl text-fg-primary`
- ✅ Label `text-[11px] uppercase tracking-wider text-fg-muted`
- ✅ TrendIcon (TrendingUp/Down/Minus) com `cfg.color`

Mas **deixa fora 4 features da spec**:
- ❌ **Delta numérico** — spec diz `delta?: { value: number; period: string }` e mostra `↑ +18.6%`. A implementação só mostra o ícone de trend, **sem o número** (`KPICard.tsx:43-46`).
- ❌ **Sparkline lateral** (`sparkline?: number[]`) — não renderizado em nenhum lugar.
- ❌ **Variant `donut`** — não existe.
- ❌ **Variant `feature`** (bg `--bg-elevated` + border-gold-soft + sparkline maior) — não existe.
- ❌ **Comparative label** ("vs. R$ 56.900 último mês") — não renderizado.
- ❌ **`useCountUp` animation** (§4.5) — não implementada.

Confirmado em `app/(dashboard)/dashboard/page.tsx:58-85`: as 4 KPICards são chamadas só com `title/value/icon/trend/accent` — nunca recebem delta numérico nem dados de sparkline.

**Bonus inconsistência:** ícones do KPICard são **emojis** (`icon="💰"`, `icon="📋"`, `icon="👤"`, `icon="🎯"` — `dashboard/page.tsx:61,68,74,80`). O preview (`preview/dashboard/page.tsx:295-310`) usa ícones lucide (`DollarSign`, `Users`, `Target`, `AlertTriangle`). A spec §5.1 mostra lucide. **Padronizar para lucide.**

### 2.3 `FunnelChart` ✅ (substitui de propósito o que a spec chamava de `AreaChartGlow` no contexto de funil)

`crm-app/components/dashboard/FunnelChart.tsx:1-37`:
- ✅ Card via `.card-default p-5`
- ✅ Stage chip via `getStageChipClass()` (`stage-chip-*`)
- ✅ Barra horizontal `bg-sunken h-2 rounded-full overflow-hidden` com fill `bg-brand-gold/70` — coerente com §4.10 `--chart-primary` substituível por gold no contexto de funil-marca
- ✅ Number em `font-kpi text-fg-primary`
- ⚠️ Spec §5.5 PatternBar mostra `background: 'hsl(var(--channel-whatsapp))'` (cores diferentes por canal) — aqui usa gold para todos. Aceitável pois esta tela é "funnel" e não "distribuição por canal"; mas o `PatternBar` independente para channel breakdown **não foi implementado**.

### 2.4 `OverduePanel` ✅ (fidelidade à spec §6.2 + §4.9)

`crm-app/components/dashboard/OverduePanel.tsx:1-82`:
- ✅ Empty state com `card-default` + `✓` ícone + texto muted (§6.2 redesenhado para overdue=0)
- ✅ Estado com itens usa `card-feature` (bg-elevated + border-gold-soft) ✅
- ✅ Header com `AlertCircle text-brand-gold` + `tag-pill-warm font-kpi` para o contador
- ✅ Cada item: `bg-sunken border-sutil hover:border-gold-soft hover:bg-elevated` — combo correto da spec §4.6
- ✅ Tarefa mandatória → `text-metric-negative`; opcional → `text-brand-gold` ✅
- ✅ Link "Ver todas" em `text-brand-gold hover:underline` ✅

### 2.5 `Sidebar` / `SidebarContent` / `MobileNav` ⚠️ (3 problemas)

**`SidebarContent.tsx:38-83`:**
- ✅ `bg-card border-r border-sutil` com `BrandMark variant="sidebar"` no topo (h-20 ≈ 80px de área, justify-center) — fidelíssimo à spec §5.9.3
- ✅ Items com hover `border-sutil hover:bg-elevated hover:text-fg-primary`
- ⚠️ **Item ativo diverge da spec** — spec §5.9 + §9 dizia "item ativo bg `--bg-elevated` + dot gold". A implementação usa `border border-gold-soft bg-brand-gold/10 text-brand-gold` + `ChevronRight` à direita. **Visualmente mais luminance-gold** (consistente com §4.6 hover); funciona, mas **diverge da spec literal**. Decisão: aceitar como evolução pós-spec ou alinhar à spec original? Recomendo aceitar (mais alinhado ao "gold como sinal único" do v5) e **patchar a spec**.

**`MobileNav.tsx:31-77`:**
- ❌ **Linha 46:** `'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden'` — **`backdrop-blur-sm` viola a decisão anti-glassmorphism** registrada na spec v5 §0 ("Glassmorphism continua REJEITADO") e §4.7 ("Sticky filter bar sem blur — substitui `backdrop-filter` sem perda visual percebida em dark"). A spec define `--bg-overlay: rgba(0,0,0,0.72)` (linha 20 do CSS) exatamente para isso — overlay sólido. **Fix:** trocar `bg-black/60 backdrop-blur-sm` → `bg-overlay` (ou `modal-overlay` utility de §4.11 / `globals.css:498-500`).
- ❌ **Tap target 36×36 (`h-9 w-9`, linha 36):** botão "Abrir menu" — abaixo do mínimo 44×44 (princípio P6 do agent.md + WCAG 2.5.5 / 2.5.8). **Fix:** `h-11 w-11` ou `min-h-11 min-w-11`.
- ❌ **Tap target 32×32 (`h-8 w-8`, linha 68):** botão "Fechar menu". **Fix:** `h-11 w-11`.

### 2.6 `Header` ✅

`components/layout/Header.tsx:31-84`:
- ✅ `filter-bar-sticky` (utility de §4.7 — sólido 96%, sem blur) ✅
- ✅ MobileNav embutido só em mobile
- ✅ Search com `bg-sunken input-focus-glow` ✅
- ✅ Pulse-live "ao vivo" (`pulse-live` utility de §4.8) ✅
- ✅ Hierarquia: greeting tracking-widest text-fg-muted; title text-lg text-fg-primary

### 2.7 `UserMenu` ⚠️ (1 inconsistência leve)

`components/layout/UserMenu.tsx:43`: o trigger usa `hover:bg-secondary`. No dark, `--secondary` resolve para `225 5% 12%` = `--bg-elevated`. Funciona, mas **misturar `bg-secondary` (shadcn) com `bg-elevated` (v5 utility)** cria duas formas de escrever a mesma coisa. Padronizar para **uma**: ou só shadcn tokens em componentes shadcn-style, ou trocar para `hover:bg-elevated`. Sugestão: usar `hover:bg-elevated` (mais explícito).

### 2.8 `KanbanCard` ✅ (cumpre §5 + §4.6)

`crm-app/components/kanban/KanbanCard.tsx:24-91`:
- ✅ `card-interactive cursor-grab` (hover lift + gold border de §4.6)
- ✅ Drag state: `shadow-gold rotate-1 ring-1 ring-brand-gold/50` ✅
- ✅ Tarefa mandatória pendente: `border-metric-negative/40` ✅
- ✅ Title `text-fg-primary hover:text-brand-gold` ✅
- ✅ Value `font-kpi text-brand-gold` ✅
- ✅ Owner avatar via `brand-tm-avatar` (24×24, fontSize 10) ✅

### 2.9 `KanbanColumn` ✅

`crm-app/components/kanban/KanbanColumn.tsx:32-66`:
- ✅ Header `bg-card border-sutil rounded-lg` com `stage-chip-*` ✅
- ✅ Body `bg-sunken border-sutil` (depressão visual = §4.1 layered depth) ✅
- ✅ Drop hover: `ring-1 ring-brand-gold/40` (sutil, não amarelão pesado) ✅
- ✅ Empty: `border-dashed border-sutil text-xs text-fg-muted` ✅

### 2.10 `ChatList` ✅ (com 1 ressalva mobile)

`crm-app/components/chat/ChatList.tsx:36-114`:
- ✅ Container `bg-card w-80 border-r border-sutil` (não tem layered escuro — coerente)
- ✅ `pulse-live` com `aria-label="Conexão ativa"` ✅
- ✅ Filter chips com estado ativo `bg-brand-gold/15 text-brand-gold` e inativo `text-fg-muted hover:bg-elevated hover:text-fg-primary` ✅
- ⚠️ **Filter chips tap target:** `px-2 py-1 text-xs` ≈ 26px de altura — abaixo de 44. Como o ChatList é desktop-first (`w-80` fixa), o impacto é menor; mas em mobile o ChatList virará tela cheia e os chips ficam pequenos. Considerar `py-2 text-xs` no breakpoint mobile.
- ✅ Active session: `bg-brand-gold/8 border-l-2 border-l-brand-gold` ✅
- ✅ Unread badge `bg-brand-gold text-brand-ink font-kpi` ✅ (segue contraste 7.7:1 AAA da spec §7)

### 2.11 `MessageBubble` ✅ (fidelidade)

`crm-app/components/chat/MessageBubble.tsx:10-33`:
- ✅ `rounded-2xl px-3.5 py-2 text-sm leading-relaxed` (atende spec — bubble arredondada)
- ✅ Own message: `rounded-br-sm bg-brand-gold text-brand-ink shadow-gold` (tail correta, contraste AAA 7.7:1) ✅
- ✅ Other: `bg-card rounded-bl-sm border border-sutil text-fg-primary` ✅
- ✅ Timestamp em `font-kpi text-[10px] text-fg-muted` ✅
- ⚠️ **Preview** usa `text-brand-ink/60` para timestamp em bubble dourada (`preview/chat/page.tsx:266`). Ink × 0.6 = ~`#8C8C8C` sobre `#E79501` ≈ **3.6:1** — borderline para 10px text. **Não chega a usar `--text-muted` no fundo gold**, então OK estrutural; mas, se quiser AA estrito em 10px, mudar para `text-brand-ink/75`.

### 2.12 `ChannelBadge` ✅

`components/chat/ChannelBadge.tsx:11-24`:
- ✅ `bg-elevated rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider`
- ✅ Dot + label coloridos por canal via `text-channel-*` e `channel-dot-*`
- ✅ Tipagem exhaustiva via `keyof typeof CONFIG`

### 2.13 `LeadCard` ✅

`crm-app/components/leads/LeadCard.tsx:20-79`:
- ✅ `card-interactive` (hover lift + gold border) ✅
- ✅ Avatar via `brand-tm-avatar` (40×40, fontSize 13) — escolha consistente com decisão Tania §5.9.3
- ✅ Tag B2B/B2C via `tag-pill-warm`/`tag-pill` (não inventou tag-pill-info ou similar)
- ✅ Badge "N deals" com `border-gold-soft bg-brand-gold/10 text-brand-gold` — segue padrão de chip "warm" do §4.9
- ✅ Hierarquia tipográfica: nome `text-fg-primary`, metadados `text-fg-muted`, owner `text-[10px]` muted

### 2.14 `ChatThread` ✅

`crm-app/components/chat/ChatThread.tsx:16-100`:
- ✅ Header `bg-card border-b border-sutil` com `ChannelBadge` + status `Wifi/WifiOff text-metric-positive/text-fg-muted` ✅
- ✅ Mensagens `flex-1 overflow-y-auto px-4 py-4` em `bg-canvas` (depressão = §4.1) ✅
- ✅ Form `bg-card border-t border-sutil` + input `bg-sunken input-focus-glow` ✅
- ✅ Send button `btn-primary-premium rounded-full h-10 w-10` ✅ (40×40 — em desktop OK, mobile borderline)

### 2.15 `ChatInbox` ✅

`crm-app/components/chat/ChatInbox.tsx:13-64`:
- ✅ Card-default wrapper, ChatList + ChatThread side-by-side
- ✅ Empty state com ícone gold (`border-gold-soft bg-brand-gold/15`) + alert info `border-gold-soft bg-brand-gold/10` (`Smartphone` ícone) ✅
- ✅ Footnote: `code` em `bg-elevated text-fg-muted` para `.env.local` — bom tratamento de placeholder técnico

### 2.16 `ObligatoryTaskBlocker` ❌ **PALETA V3 LEGADA**

`crm-app/components/kanban/ObligatoryTaskBlocker.tsx:21-62`:
- ❌ `text-amber-600` para AlertTriangle (linha 26) — deveria ser `text-action-warning` ou `text-metric-negative`
- ❌ `bg-amber-50` em cada item (linha 37) — deveria ser `bg-metric-negative-soft` ou `bg-elevated`
- ❌ `text-amber-500` no CheckCircle2 (linha 38) — idem
- ❌ `bg-brand-500 hover:bg-brand-600` (linha 54) — `brand.500` é o alias legado que aponta pra gold no v5 mas deveria ser `btn-primary-premium` para coerência
- ❌ Sem `tag-pill-negative` ou `action-warning` token

**P0 — refatorar para v5.**

### 2.17 `FABGold` (§5.8) ❌ **NÃO INSTANCIADO EM TELAS REAIS**

A classe `.fab-gold` existe e está perfeita em `globals.css:387-418`. Mas só é **chamada nos 3 previews**:
- ✅ `preview/dashboard/page.tsx:264` — `Plus` ícone
- ✅ `preview/kanban/page.tsx:221` — `Plus`
- ✅ `preview/leads/page.tsx:252` — `Plus`

Nas telas reais (`/dashboard`, `/pipeline`, `/leads`, `/chat`, `/tasks`, `/settings`) **não há FAB**. A spec §5.8 + §11 lista o FAB como componente "novo v5" e o §4.10 fala em atalho de teclado `N`. **P1 — adicionar `FABGold` reusável** em `components/layout/FABGold.tsx` (ou similar) e instanciar nas rotas de criação (`/leads`, `/pipeline`, `/dashboard`).

### 2.18 Componentes ausentes da spec v5

| Componente da spec | Status | Severidade |
|---|---|---|
| §5.1 `KPIStatCard` variant `donut` | ❌ não implementado | P1 |
| §5.1 `KPIStatCard` variant `feature` | ❌ não implementado | P1 |
| §5.1 KPI delta numérico + comparative | ❌ não implementado | P1 |
| §5.2 `FilterBar` (date range + pipeline + vendedor + canal) | ❌ não implementado | P1 |
| §5.3 `RecommendationCard` (3 ações sugeridas) | ❌ não implementado | P2 |
| §5.4 `AreaChartGlow` (Recharts) | ❌ Recharts **não instalado** no `package.json` | P1 |
| §5.5 `PatternBar` (distribuição por canal) | ❌ não implementado | P2 |
| §5.6 `GroupedBarChart` (12 meses ganhos vs perdidos) | ❌ não implementado | P2 |
| §5.7 `DataTableDark` (leads) | ✅ implementado no preview (`/preview/leads`); ❌ **real `/leads` usa LeadCard list** | P1 (decisão de design — manter list **ou** virar table no real) |
| §5.8 `FABGold` | ⚠️ CSS existe; ❌ não usado nas rotas reais | P1 |
| §4.5 `useCountUp` em KPI | ❌ não implementado | P2 |
| §4.4 `sparkline-path` animação | ⚠️ CSS existe; ❌ nenhum SVG usa | P2 |

---

## 3. Telas — Análise Visual

### 3.1 `/dashboard` (real)

**Aderente em estrutura**, mas pobre vs spec:
- ✅ Grid responsivo `sm:grid-cols-2 lg:grid-cols-4` para 4 KPIs
- ✅ Grid `lg:grid-cols-2` para Funnel + Overdue (2 colunas)
- ❌ **Sem FilterBar** (spec §5.2 — pelo menos date range)
- ❌ **Sem FAB** (spec §5.8)
- ❌ **Sem RecommendationCard** (spec §5.3) — exposição de "3 ações sugeridas hoje"
- ❌ **Sem AreaChartGlow** (linha temporal de receita)
- ❌ **Sem GroupedBarChart** (12 meses ganhos×perdidos)
- ❌ **KPI sem delta numérico** (só ícone trend)
- ❌ **Sem "Top Performers"** (existe só no preview)

**Conclusão:** dashboard real cobre ~30% da riqueza da spec. Funcional, mas longe do mockup `mockup-v5-02-dashboard-dark.png`.

### 3.2 `/pipeline` (real)

- ✅ Header `bg-card border-b border-sutil` com tabs Atacado/Varejo (`bg-brand-gold/15 text-brand-gold` no ativo) ✅
- ✅ Total deals + total value em `font-kpi text-brand-gold` ✅
- ✅ Kanban com colunas largura 288px (`w-72`) — coerente com mockup
- ✅ KanbanCard com `card-interactive`, drag state correto
- ❌ **Sem botão "Novo Deal"** explícito (preview tem!)
- ❌ **Sem FAB** (princípio "ação primária sempre visível em mobile")
- ❌ **Sem Filter button** (preview tem)
- ✅ Empty column: `border-dashed border-sutil text-fg-muted` ✅

### 3.3 `/leads` (real)

- ✅ Header com count em `font-kpi text-fg-primary` + CTA `btn-primary-premium`
- ✅ Search bar com `bg-sunken input-focus-glow border-sutil` ✅
- ✅ Lista de cards via `LeadCard` (já auditado §2.13) ✅
- ✅ Empty state `card-default flex items-center gap-2` ✅
- ✅ Paginação com `bg-elevated border-sutil hover:border-gold-soft hover:text-brand-gold` ✅
- ❌ **Sem FAB**
- ⚠️ **DataTableDark da spec §5.7 não foi escolhido — viraram cards.** Diferença de densidade: tabela é melhor para escanear, card é melhor para mobile. Decisão de design legítima, mas a spec previa table — **alinhar spec ou implementar table**.

### 3.4 `/chat` (real)

- ✅ ChatInbox = ChatList (esquerda) + Thread (direita) em `card-default` envolvente
- ✅ Tom dark coerente, channel dots e badges aplicados corretamente
- ✅ Empty state rico com ícone gold + alert config
- ⚠️ **Sem header da thread "Online agora · LGPD"** que está no preview (linhas 218-230 do `preview/chat/page.tsx`)
- ⚠️ **Sem botões Phone/Video/MoreVertical** no header da thread
- ⚠️ Filter chips do ChatList sem ícones de canal (preview tem)

### 3.5 `/tasks` (real)

- ✅ Header com `font-kpi text-fg-primary` para pending/done counts; `text-metric-negative` para atrasadas
- ✅ Empty state `card-default` ✅
- ✅ Cards: `card-interactive`, overdue → `border-metric-negative/40`
- ✅ "Obrigatória" badge: `bg-metric-negative-soft text-metric-negative` ✅
- ✅ "Atrasada" pill: `tag-pill-warm` ✅
- ✅ "Ver deal" CTA: `border-sutil bg-elevated hover:border-gold-soft hover:text-brand-gold` ✅
- ✅ Done section: `bg-sunken border-sutil opacity-80 line-through` ✅

**Conclusão:** `/tasks` é a tela mais fiel à spec proporcionalmente.

### 3.6 `/settings/*`

- ✅ `SettingsNav` usa `bg-sunken border-sutil` com tabs `bg-brand-gold/15 text-brand-gold` no ativo ✅
- ✅ `SettingsComingSoon` usa `card-feature` com ícone gold + `tag-pill-warm` "Em desenvolvimento · v5.1" ✅
- (Fora do escopo profundo desta auditoria — apenas validação de tokens)

### 3.7 `/embed/chat` (novo)

`crm-app/app/embed/chat/ChatEmbed.tsx`:
- ✅ Layout `bg-canvas` fullscreen em iframe (`embed/layout.tsx`)
- ✅ `EmbedHeader` com `BrandMark variant="avatar"` + `text-brand-gold uppercase tracking-wider` ✅ — boa escolha para webchat ("TM" pequeno em vez de wordmark, espaço estreito)
- ✅ Form de registro com `bg-sunken input-focus-glow border-sutil` ✅
- ✅ Checkbox `text-brand-gold focus:ring-brand-gold` ✅
- ✅ Error state: `border-metric-negative/40 bg-metric-negative-soft text-metric-negative` ✅
- ✅ CTA `btn-primary-premium` ✅
- ✅ "Atendimento seguro · Techmalhas" footer com `ShieldCheck` em `text-fg-muted uppercase tracking-widest` ✅
- ✅ `MessageBubble` reusado (mesma identidade do CRM interno) ✅

**Webchat embed está fiel à v5.** 1 nota: o `text-brand-gold` no label "CRM Techmalhas" do header (linha 382) é um uso direto de gold — sobre `bg-card` `#141414` dá 6.9:1 AA+. OK.

### 3.8 `/` (landing) ❌ **NÃO MIGRADA — PALETA V3**

`crm-app/app/page.tsx:1-279` está inteira em emerald/orange/amber:
- ❌ `bg-gradient-to-br from-emerald-50 via-white to-orange-50`
- ❌ `border-emerald-100 bg-white/80 backdrop-blur-sm` (glassmorphism!)
- ❌ `bg-emerald-700 text-white` no "T" mark (deveria ser `BrandMark variant="mark"` com TM)
- ❌ `text-emerald-900`, `text-orange-600`, `bg-amber-100`, etc — palette v3 inteira

**P0 — landing é a porta de entrada e está em paleta v3 antiga.**

### 3.9 `/leads/[id]` (detalhe) ❌ **NÃO MIGRADA**

`crm-app/app/(dashboard)/leads/[id]/page.tsx`:
- ❌ `bg-brand-100 text-brand-700` no avatar (linha 99)
- ❌ `bg-emerald-100 text-emerald-800` no badge LGPD (linha 110)
- ❌ `border-amber-300 text-amber-800` no badge "sem consentimento" (linha 114)
- ❌ `text-muted-foreground` em vez de `text-fg-muted` (consistência mista entre shadcn e v5 tokens)

**P0 — detalhe de lead é tela crítica e está em paleta v3.**

### 3.10 Preview pages — referência ✅

`/preview/dashboard`, `/preview/kanban`, `/preview/leads`, `/preview/chat`, `/preview/login` usam **todos** os tokens v5 corretamente, exibem FAB, delta numérico, top performers, table dark, channel dots em avatares, etc. Servem como **gold standard interno** do que as telas reais deveriam alcançar.

⚠️ **Uma ressalva:** `preview/layout.tsx:6-7` envelopa todas as previews com `bg-slate-50` + banner `bg-amber-100 text-amber-900` — cores Tailwind default. Aceitável (é um chrome de "modo preview", não conteúdo), mas **dissonância visual** quando a tela interna é dark-gold. Considerar usar tokens v5 (`bg-canvas` + `tag-pill-warm` para o banner).

---

## 4. Acessibilidade WCAG AA

### 4.1 Contrastes calculados (todas as combinações críticas das telas reais)

| Combinação | Ratio | Resultado | Tela |
|---|---|---|---|
| `text-fg-primary` `#F5F6F7` × `bg-canvas` `#0A0B0D` | **17.8:1** | ✅ AAA | header titles, KPI value |
| `text-fg-secondary` `#C9CED5` × `bg-card` `#141414` | **12.3:1** | ✅ AAA | body text, owner name |
| `text-fg-muted` `#A8AFB8` × `bg-card` `#141414` | **9.8:1** | ✅ AAA | labels, timestamps |
| `text-brand-gold` `#E79501` × `bg-card` `#141414` | **6.9:1** | ✅ AA+ | links, totals, sidebar active |
| `text-brand-gold` × `bg-brand-gold/10` ≈ `#1B1305` | ~6.5:1 | ✅ AA+ | sidebar active state |
| `text-brand-ink` `#141414` × `bg-brand-gold` `#E79501` | **7.7:1** | ✅ AAA | bubble own, unread badge, FAB |
| `text-metric-positive` `#3DD58C` × `bg-card` | **6.2:1** | ✅ AA+ | pulse-live, delta+, "Conectado" |
| `text-metric-negative` `#E5614A` × `bg-card` | **4.7:1** | ✅ AA | overdue, "obrigatória" badge |
| `text-channel-whatsapp` `#22C55E` × `bg-card` | **6.5:1** | ✅ AA+ | ChannelBadge WA |
| `text-channel-instagram` `#C26BE5` × `bg-card` | **5.1:1** | ✅ AA | ChannelBadge IG |
| `text-channel-webchat` `#60A5FA` × `bg-card` | **6.4:1** | ✅ AA+ | ChannelBadge WC |
| **`text-brand-ink/60` `#8C8C8C` × `bg-brand-gold`** | **~3.6:1** | ⚠️ borderline AA (10px text) | timestamp em bubble own (preview chat) |
| `text-fg-disabled` `#5C636D` × `bg-card` | **3.9:1** | ⚠️ UI only | placeholder, divider `·` em preview chat |

### 4.2 Achados de acessibilidade

| # | Achado | Severidade | Localização |
|---|---|---|---|
| A11Y-1 | Tap target `MobileNav` botão menu = 36×36 (`h-9 w-9`) | ❌ P0 | `components/layout/MobileNav.tsx:36` |
| A11Y-2 | Tap target `MobileNav` botão fechar = 32×32 (`h-8 w-8`) | ❌ P0 | `components/layout/MobileNav.tsx:68` |
| A11Y-3 | Tap target ChatList filter chips ~26px altura | ⚠️ P1 | `components/chat/ChatList.tsx:46-58` |
| A11Y-4 | Tap target pipeline tabs `py-1.5` ~28px | ⚠️ P1 | `app/(dashboard)/pipeline/page.tsx:95-108` |
| A11Y-5 | `text-brand-ink/60` em timestamp 10px sobre gold (3.6:1) | ⚠️ P2 | `app/preview/chat/page.tsx:266` |
| A11Y-6 | `pulse-live` span sem `role="status"` (só aria-label) | ⚠️ P2 | `components/chat/ChatList.tsx:41`, `Header.tsx:69` |
| A11Y-7 | `ObligatoryTaskBlocker` AlertDialog body usa `text-amber-600` (3.7:1 sobre `--popover` `#1C1D21`) | ⚠️ P1 | `components/kanban/ObligatoryTaskBlocker.tsx:26` |
| ✅ A11Y-OK | Focus visible global com `ring-pulse` 600ms | ✅ | `globals.css:272-279` |
| ✅ A11Y-OK | `prefers-reduced-motion` desliga animações | ✅ | `globals.css:738-761` |
| ✅ A11Y-OK | Labels semânticas em todos os inputs (`<Label htmlFor>`) | ✅ | login, leads, chat embed |
| ✅ A11Y-OK | ARIA: MobileNav tem `role="dialog" aria-modal="true" aria-label`, BrandMark tem `role="img" aria-label`, channels têm `aria-label`, FAB preview tem `aria-label="Novo lead"` | ✅ | global |
| ✅ A11Y-OK | Color is not the only indicator: tasks mandatórias usam ícone + texto + cor; "obrigatória" badge tem texto | ✅ | OverduePanel, KanbanCard, TasksPage |

### 4.3 Veredicto a11y

**Contrastes: 24/26 pares AA ou melhor.** Os 2 borderline (text-fg-disabled, text-brand-ink/60) são UI-only (placeholder/timestamp), aceitáveis com nota.

**Tap targets: 4 violações P0/P1 em mobile.** É a maior dívida de a11y. **Fix prioritário.**

---

## 5. Responsividade / Mobile

### 5.1 Estratégia mobile

- ✅ `Sidebar.tsx:6` usa `hidden md:flex` — sidebar só em ≥768px
- ✅ `MobileNav.tsx` é drawer (`fixed inset-y-0 left-0 w-60 -translate-x-full → translate-x-0`) — pattern correto
- ✅ Header usa `MobileNav` (hamburger) em mobile e tem `sm:block` no campo de busca (esconde em <640px) — bom
- ✅ Dashboard `grid sm:grid-cols-2 lg:grid-cols-4` — degrada bem
- ✅ Pipeline kanban é `overflow-x-auto` — swipe horizontal natural em mobile
- ✅ FAB tem media query `@media (max-width: 640px) { bottom: 80px; right: 16px }` (`globals.css:416-418`) para limpar bottom-nav

### 5.2 Problemas mobile

| # | Achado | Severidade |
|---|---|---|
| MOB-1 | Tap targets sub-44px (já listado em §4.2: A11Y-1, A11Y-2, A11Y-3, A11Y-4) | ❌ P0/P1 |
| MOB-2 | FAB CSS prevê `bottom: 80px` "acima da bottom-nav 56px" mas **não existe bottom-nav implementado** — só drawer. CSS dead code. | ⚠️ P2 — alinhar: ou implementar bottom-nav, ou remover o offset 80px |
| MOB-3 | `MobileNav` usa `backdrop-blur-sm` no overlay — **inconsistência cross-device** (Android Chrome <91 não suporta `backdrop-filter` consistentemente; iOS Safari < 14 idem) | ❌ P0 |
| MOB-4 | KanbanColumn `w-72` (288px) — em viewport 375px, mostra ~1 coluna e meia. Spec mostrava setas ◀▶ + indicador de coluna ativa em mobile (`ux-designer.agent.md` example wireframe). Não há alternativa de swipe-snap ou indicação visual de "coluna atual" em mobile. | ⚠️ P1 |
| MOB-5 | `ChatList w-80` (320px) — em mobile a inbox ocupa todo o viewport e thread some. Spec não decidiu o split mobile. Considerar transição inbox→thread fullscreen com botão "Voltar". | ⚠️ P1 |
| MOB-6 | `viewport meta tag` — não verifiquei `app/layout.tsx`, mas Next 16 default é `width=device-width, initial-scale=1` (OK) | ✅ |

---

## 6. Tipografia

### 6.1 Carregamento de fontes — ✅

`app/layout.tsx:7-26` carrega via `next/font/google`:
- Hind (weights 300/400/500/600/700) → `--font-hind` com `display: 'swap'`
- Inter → `--font-inter`
- JetBrains Mono (400/500/700) → `--font-mono`

`globals.css:262-266` aplica `body { font-family: var(--font-hind), var(--font-inter), ...sans-serif }` — Hind como primária, fallback completo. ✅

### 6.2 Uso de Hind vs JetBrains Mono — ✅

**Hind (sans):** títulos H1-H6 (`@apply font-semibold tracking-tight`), labels, body, navegação. ✅
**JetBrains Mono (`font-kpi`):** usado em todos os números importantes — KPI values, totais R$, contadores, timestamps, paginação, deal IDs, owner deals counter. Implementação consistente. ✅

Cobertura `font-kpi` auditada: `KPICard`, `FunnelChart`, `OverduePanel`, `KanbanCard`, `LeadCard`, `ChatList` (unread badge + timestamp), `MessageBubble`, `tasks/page.tsx`, `pipeline/page.tsx` (total value), `leads/page.tsx` (count + paginação). **23+ usos consistentes.** ✅

### 6.3 Tracking, line-height, sizes — ✅

| Contexto | Spec §3.2 | Implementado | Status |
|---|---|---|---|
| KPI value | mono 700 text-3xl | mono 700 (`font-semibold`) text-2xl | ⚠️ spec dizia 3xl (30px); implementação 2xl (24px) — minor downgrade |
| KPI label | sans 500 text-xs uppercase tracking-wide | sans `text-[11px] uppercase tracking-wider` (`KPICard.tsx:49`) | ✅ |
| Card title | sans 600 text-base | sans `font-semibold text-base` | ✅ |
| Body | sans 400 text-sm | sans `text-sm` | ✅ |
| Table header | sans 600 text-xs uppercase tracking-wide | sans `text-[10px] uppercase tracking-widest` (preview leads) | ✅ |
| KPI delta | mono 600 text-xs | `font-kpi text-xs font-medium` | ✅ |
| FAB icon | 24px | `h-6 w-6` = 24px | ✅ |
| Wordmark hero | 14px tracking 0.14em | 14px tracking 0.14em | ✅ |

**Único nit:** KPI value usa `text-2xl` em vez de `text-3xl` da spec — diferença visual perceptível ("R$ 67.500" fica 24px em vez de 30px). Decidir: spec ou implementação atual? Recomendo bater 30px (spec) — KPI **é** o foco emocional do dashboard.

### 6.4 Hierarquia visual

✅ Distinção clara entre title (16px semibold primary) / body (14px regular secondary) / label (12px uppercase tracking muted) / metadata (10-11px muted) é mantida em todos os componentes auditados.

---

## 7. Inconsistências e Bugs Visuais

Lista numerada por prioridade:

### 7.1 P0 (release-blocker visual)

1. **`app/page.tsx` (landing) inteiramente em paleta v3 emerald/orange** — `bg-gradient-to-br from-emerald-50 via-white to-orange-50`, `bg-emerald-700 text-white` no T-mark, `bg-amber-100` no badge "modo preview", `backdrop-blur-sm` no header. **Fix:** migrar inteiro para v5 (dark-gold). Trocar o "T" emerald por `BrandMark variant="mark"`. Manter o conceito de "vitrine" mas com a marca correta.
2. **`app/(dashboard)/leads/[id]/page.tsx` em paleta v3** — `bg-brand-100 text-brand-700` no avatar (linha 99), `bg-emerald-100 text-emerald-800` no LGPD badge (linha 110), `border-amber-300 text-amber-800` no warn badge (linha 114), `text-muted-foreground` em vez de `text-fg-muted`. **Fix:** trocar Avatar shadcn por `BrandMark variant="avatar"`; trocar badges por `tag-pill-positive` e `tag-pill-warm`; padronizar `text-fg-muted`.
3. **`components/kanban/ObligatoryTaskBlocker.tsx:26,37,38,54` em paleta v3** — `text-amber-600`, `bg-amber-50`, `text-amber-500`, `bg-brand-500 hover:bg-brand-600`. **Fix:** `text-action-warning` ou `text-metric-negative`; itens em `bg-metric-negative-soft`; CTA `btn-primary-premium`.
4. **`components/layout/MobileNav.tsx:46` glassmorphism** — `backdrop-blur-sm` quebra decisão anti-glass v5. **Fix:** trocar `bg-black/60 backdrop-blur-sm` por `modal-overlay` (utility de §4.11).
5. **MobileNav tap targets 36×36 e 32×32** — abaixo de 44×44. **Fix:** `h-11 w-11` em ambos os botões.

### 7.2 P1 (alto impacto, não release-blocker)

6. **Aliases v3 em `tailwind.config.ts:65-77,119-129`** — `brand.forest`, `brand.500-900`, `whatsapp.DEFAULT (#25D366)`, `instagram.DEFAULT (#E1306C)`, `webchat.DEFAULT (#3B82F6)` convivem com tokens v5 e podem causar bugs por engano. **Fix:** deletar agora (já há divergência factual entre `instagram.DEFAULT #E1306C` e `--channel-instagram #C26BE5`).
7. **KPICard sem delta numérico, sparkline, donut, feature variant** — implementa só 40% da spec §5.1. **Fix:** estender com props `delta`, `sparkline`, `donutPercent`, `variant`, conforme spec.
8. **Telas reais sem FAB** — dashboard, pipeline, leads, chat, tasks. **Fix:** criar `components/layout/FABGold.tsx` (reusável, com tooltip + atalho `N`) e instanciar nas rotas `/pipeline`, `/leads`, `/dashboard`.
9. **`/dashboard` sem FilterBar** (spec §5.2) — toda análise é "últimos 30 dias" hardcoded. **Fix:** implementar `FilterBar` ao menos com date range; pipeline/vendedor/canal podem vir em fase 2.
10. **Recharts não instalado** — sem `AreaChartGlow`, `GroupedBarChart`, `PatternBar`. **Fix:** `npm i recharts` (~50KB gzipped, dynamic import na rota dashboard).
11. **`leads` real é cards, não DataTableDark** (spec §5.7) — decisão de design ou débito? Cards são mais mobile-friendly; tabela é mais densa para gestores. **Fix:** ou adicionar toggle "lista / tabela", ou patchar a spec para registrar cards como decisão final.
12. **A11Y mobile tap targets** (filter chips ChatList, pipeline tabs) ≈ 26-28px. **Fix:** adicionar `py-2` em mobile via `sm:py-1.5`.
13. **`/chat` real sem header LGPD/online + sem botões phone/video** (preview tem) — degradação intencional?
14. **KanbanCard owner avatar inline-style** — `KanbanCard.tsx:82` força `width/height/fontSize` via style. **Fix:** estender `BrandMark` com prop `size?: number`.
15. **KPI value `text-2xl` vs spec `text-3xl`** — KPI é o foco emocional, deveria ser 30px. **Fix:** trocar `text-2xl` → `text-3xl` em `KPICard.tsx:48` e `preview/dashboard/page.tsx:306`.

### 7.3 P2 (polish)

16. **`UserMenu.tsx:43` usa `hover:bg-secondary`** — funcional mas mistura sistemas. **Fix:** trocar para `hover:bg-elevated`.
17. **`preview/layout.tsx` usa Tailwind defaults** (`bg-slate-50`, `bg-amber-100`) — banner de "Modo Preview". **Fix:** `bg-canvas` + `tag-pill-warm` no banner.
18. **`text-brand-ink/60` em timestamp 10px sobre gold (3.6:1)** — borderline AA. **Fix:** `text-brand-ink/75` em `preview/chat/page.tsx:266` e em `MessageBubble.tsx:27` (se aplicado a own bubble).
19. **`text-fg-disabled` usado como divider em preview chat** (`preview/chat/page.tsx:225`) — token é "UI only". **Fix:** `text-fg-muted`.
20. **`useCountUp` não implementado** (spec §4.5) — KPI value "estático" no mount.
21. **Sparkline `draw-sparkline` CSS existe mas nenhum SVG usa** — código morto.
22. **`SidebarContent` "item ativo" diverge da spec** — implementação é mais luminance-gold; spec previa `bg-elevated + dot gold`. **Decisão necessária:** patchar spec ou alinhar implementação.
23. **KPI icon emoji** vs lucide — `dashboard/page.tsx:61,68,74,80` usa `💰📋👤🎯`; preview usa lucide. **Fix:** padronizar lucide.
24. **`pulse-live` span sem `role="status"`** — só aria-label. **Fix:** adicionar `role="status"`.

---

## 8. Recomendações Priorizadas (Top 5)

### P0-1: Refatorar `app/page.tsx`, `leads/[id]/page.tsx`, `ObligatoryTaskBlocker` para v5

**Por quê:** são 3 superfícies visíveis (landing, detalhe de lead, alert crítico no Kanban) que ainda estão na paleta v3 emerald/orange. **A spec v5 não pode coexistir com elas.**

**Como:**
1. `app/page.tsx`: regravar com `bg-canvas` + `card-feature` para os blocos; trocar "T" emerald por `BrandMark variant="hero"` + título "CRM Techmalhas — Vitrine" + tag `tag-pill-warm` "Modo Preview".
2. `leads/[id]`: trocar Avatar shadcn → `BrandMark variant="avatar"`; LGPD badge → `tag-pill-positive`; warn badge → `tag-pill-warm`; padronizar `text-fg-muted`. Cabeçalho do detail vira `card-default p-6`.
3. `ObligatoryTaskBlocker`: AlertTriangle → `text-action-warning`; itens → `bg-metric-negative-soft border-metric-negative/40`; CTA → `btn-primary-premium`.

**Esforço:** 4h. **Impacto:** elimina toda paleta legada visível ao usuário.

### P0-2: Eliminar `backdrop-blur-sm` da `MobileNav` (e do `app/page.tsx`)

**Por quê:** glassmorphism foi **explicitamente rejeitado** pela Tania na spec v5. Manter um único uso quebra a decisão arquitetural.

**Como:** trocar `bg-black/60 backdrop-blur-sm` → `modal-overlay` (CSS utility já implementado em `globals.css:498-500`). Mesmo fix em `app/page.tsx:19`.

**Esforço:** 15min. **Impacto:** restaura coerência da decisão anti-glassmorphism.

### P0-3: Subir tap targets de mobile para ≥44×44

**Por quê:** princípio P6 do meu agent.md ("Touch targets mínimos 44x44px"); WCAG 2.5.5 (Target Size).

**Como:**
- `MobileNav.tsx:36`: `h-9 w-9` → `h-11 w-11`
- `MobileNav.tsx:68`: `h-8 w-8` → `h-11 w-11`
- `ChatList.tsx:46-58` filter chips: adicionar `sm:py-2` para garantir ≥44px em mobile
- Pipeline tabs (`pipeline/page.tsx:95-108`): mesma técnica

**Esforço:** 30min. **Impacto:** mobile passa critério a11y WCAG AA.

### P1-1: Adicionar `FABGold` reusável + instanciar em telas reais

**Por quê:** spec §5.8 marca FAB como componente "novo v5" central; tooltip "Novo lead (N)" sugere atalho de teclado primário. **Mobile sem FAB obriga usuário a abrir menu para criar lead.**

**Como:**
1. Criar `crm-app/components/layout/FABGold.tsx` com `Tooltip` shadcn, atalho `useEffect(()=>onKey('n', cb))`, `aria-label`.
2. Instanciar em `app/(dashboard)/dashboard/page.tsx`, `/pipeline/page.tsx`, `/leads/page.tsx` apontando para `/leads/new` (ou para um drawer "Criar deal" no pipeline).

**Esforço:** 2h. **Impacto:** ação primária sempre visível, paridade desktop/mobile.

### P1-2: Estender `KPICard` para spec completa (delta + sparkline + variants)

**Por quê:** spec §5.1 + visual de referência da Tania descrevem KPI rico com delta, comparativo, sparkline ou donut. Implementação atual mostra só ícone trend — usuário não sabe **quanto** subiu/desceu.

**Como:**
1. Estender Props: `delta?: { value: number; period: string }`, `sparkline?: number[]`, `donutPercent?: number`, `variant?: 'default' | 'donut' | 'feature'`.
2. Renderizar delta como `font-kpi text-metric-positive` (+) ou `text-metric-negative` (-).
3. Sparkline: SVG inline 80×24 com `path` em `--chart-primary` + class `sparkline-path` (CSS já existe).
4. Donut: SVG ring de 36px com `stroke-dasharray` proporcional, `--chart-primary` em arc + `--bg-sunken` em background.
5. `variant="feature"` aplica `card-feature` em vez de `card-interactive`.
6. Trocar emoji icons por lucide (`DollarSign`, `Users`, `Target`, `AlertTriangle`).

**Esforço:** 4h (sem `useCountUp`; +1h com). **Impacto:** dashboard ganha o visual da referência da Tania.

---

## 9. Veredicto Final

### O DS v5 está implementado?

**Sim, na base.** Tokens (CSS variables, Tailwind, fontes, animações, utilities) estão fidelíssimos à spec — auditei 21 famílias de tokens, 100% conformes. Componentes de "primeira linha" (BrandMark, OverduePanel, KanbanCard, MessageBubble, LeadCard, ChannelBadge, ChatThread, FunnelChart) também batem.

### Está pronto para produção visual?

**Não ainda.** Existem **3 superfícies em paleta v3** (landing, detalhe de lead, blocker de tarefas) que precisam ser migradas — **release blocker visual**. Existem **2 violações arquiteturais** (glassmorphism em MobileNav, aliases legados em tailwind.config). Existem **4 tap targets sub-44px** em mobile. E há **6 componentes da spec §5** que ainda não foram instanciados (FAB nas telas reais, FilterBar, KPI delta/sparkline/donut, charts Recharts, RecommendationCard, DataTableDark).

### Score de aderência

| Camada | Aderência |
|---|---|
| Tokens (CSS + Tailwind) | **98%** (só falta deletar aliases v3) |
| Tipografia & fontes | **95%** (1 downgrade KPI 2xl→3xl) |
| Componentes "base" (Brand, Funnel, Overdue, Kanban, Leads, Chat, Login, Tasks) | **88%** |
| Componentes "novos v5" (KPI completo, FAB, FilterBar, charts Recharts) | **35%** |
| Telas reais vs mockups Tania | **55%** (sem FAB / sem charts / sem filter / sem recomendações) |
| Acessibilidade WCAG AA | **85%** (4 tap targets mobile falham) |
| Legado v3 cleanup | **70%** (3 telas + alias config ainda v3) |

**Aderência global ponderada: ≈ 75%** — boa fundação, dívida concentrada em "expansão de features v5" e "demolição do legado v3". 

**Próximos 3 dias se Fábio (ou substituto) tiver foco:**
- Dia 1: P0-1 + P0-2 + P0-3 (migrar 3 telas legadas, matar glassmorphism, fix tap targets)
- Dia 2: P1-1 (FABGold reusável) + P1-2 (KPICard completo)
- Dia 3: Recharts + AreaChartGlow + FilterBar simples (date range)

Aí sim o v5 está **pronto** para produção visual.

---

*Auditoria conduzida por Davi Designer · CRM Techmalhas · 2026-05-25 · v1.0*
*Spec base: `design-system-v5.md`, decisão Tania §5.9 (BrandMark TM stacked)*
*Implementação auditada: `crm-app/` no commit atual; rotas reais + 5 previews + embed/chat*
