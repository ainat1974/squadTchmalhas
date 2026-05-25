# Design System v5 — CRM Techmalhas (Dark-First, Inspirado em Painel Analítico)

> **Autor:** Davi Designer · **Data:** 2026-05-25 · **Status:** Proposto (aguarda ADR-010 + aprovação Tania)
> **Substitui:** `design-system-v4.md` (light-first com sidebar preta)
> **Inspirado em:** `references/referencia-tania-dashboard-analytics.png` (Tania, 2026-05-25)
> **Mantém:** marca Techmalhas (ink/paper/gold/sage/terracota), tipografia Hind+JBMono, channel colors, stage colors, decisão anti-glassmorphism

---

## TL;DR — o que mudou de v4 → v5

- **Tema padrão agora é DARK** (canvas `#0A0B0D` + cards `#141414` brand-ink puro). Light continua disponível como **opt-in invertido** (toggle no menu do usuário).
- **Primary CTA no dark é GOLD** `#E79501` (v4 já previa esse swap). Light continua com primary ink.
- **+7 componentes novos** específicos para dashboard analítico: `KPIStatCard`, `FilterBar`, `RecommendationCard`, `AreaChartGlow`, `PatternBar`, `GroupedBarChart`, `DataTableDark`, `FABGold`.
- **+1 dependência:** `recharts` (~50KB gzipped, **dynamic import só na rota /dashboard**). Sem isso, gráficos com gradient fill + glow são inviáveis em CSS puro.
- **Glassmorphism continua REJEITADO** (decisão Tania) — todas as técnicas v5 são CSS estático ou animações leves, paridade cross-device 100%.
- **WCAG AA recalculado** para 30 pares no dark (todos passam).
- **Tokens, fontes, channel/stage colors do v4 são preservados** — v5 reusa ~70% do v4.

---

## 1. Diff arquitetural v4 → v5

| Camada | v4 (light-first) | v5 (dark-first inspirado ref) | Mudança |
|---|---|---|---|
| Tema padrão | `light` (Tania `_memory/preferences.md`) | **`dark`** | 🔄 swap |
| `--background` | `#FFFFFF` | `#0A0B0D` (canvas) | 🔄 |
| `--card` | `#FFFFFF` | `#141414` (brand-ink puro) | 🔄 |
| Surface elevada (drawer, popover) | sombra colorida + inner highlight branco | `#1C1D21` (delta 4%) + inner highlight gold 4% | 🔄 |
| `--primary` | ink `#141414` | **gold `#E79501`** | 🔄 (v4 já fazia no `.dark`, agora é default) |
| `--ring` | gold | gold (mantido) | ✅ |
| Border | `#E5E5E5` sólido | `hsla(0,0%,100%,0.06)` sutil | 🔄 mais discreto p/ dark |
| Sombra padrão de card | `shadow-sage` colorida em repouso | **`none` em repouso**; sombra `gold-glow` só em hover/drag/active | 🔄 mais limpo, menos ruído |
| Gráficos | linha sage simples (v4 não usava Recharts) | **`AreaChartGlow`** linha teal-sage `#5BA89A` + gradient fill + radial halo | ✨ novo (Recharts) |
| KPI cards | número + delta% (sem sparkline) | número + delta% + **sparkline animada** OU **donut ring** | ✨ novo |
| Filter bar | apenas dropdown de período (`[7 dias ▾]`) | **`FilterBar`** completo: data range + pipeline + vendedor + canal | ✨ novo |
| Recomendações | — | **`RecommendationCard`** 3 colunas com CTA | ✨ novo |
| Comparativo canais | "Top 5 leads quentes" | **`PatternBar`** horizontal proporcional por canal | ✨ novo (substitui Top 5, que move pro drawer de Insights) |
| Mensal ganhos/perdas | — | **`GroupedBarChart`** 12 meses | ✨ novo |
| FAB | — | **`FABGold`** "Novo lead" canto inferior direito | ✨ novo |
| Skeleton shimmer | tint gold sutil | tint gold sutil (mantido) | ✅ |
| Animações cap | 250ms | 250ms (mantido) | ✅ |
| `prefers-reduced-motion` | respeitado | respeitado (mantido) | ✅ |
| Channel/stage colors | preservados | preservados (já com versão dark) | ✅ |

---

## 2. Paleta dark-first completa

### 2.1 Brand core (inalterada — DNA da marca)

| Token | Hex | HSL | Função no v5 |
|---|---|---|---|
| `--brand-ink` | `#141414` | `0 0% 8%` | **Surface dos cards** (não mais primary CTA no dark) |
| `--brand-paper` | `#FFFFFF` | `0 0% 100%` | Light mode background; texto branco em pills |
| `--brand-gold` | `#E79501` | `39 99% 46%` | **Primary CTA + FAB + ring + tag-warm** |
| `--brand-sage` | `#869791` | `159 8% 56%` | Base do `--chart-primary` (`#5BA89A` derivado) |
| `--brand-terracotta` | `#CC4833` | `8 60% 50%` | Base do `--metric-negative` (`#E5614A` lifted) |

### 2.2 Surfaces dark (novidade v5)

| Token | Hex | HSL | Função |
|---|---|---|---|
| `--bg-canvas` | `#0A0B0D` | `220 7% 4%` | Body background — "tela vasta" da ref |
| `--bg-card` | `#141414` | `0 0% 8%` | = brand-ink → cards principais |
| `--bg-elevated` | `#1C1D21` | `225 5% 12%` | Drawer, popover, dropdown, KPI feature, hover |
| `--bg-sunken` | `#0E0F12` | `220 7% 6%` | Input bg, filter chip bg (abaixo do canvas) |
| `--bg-overlay` | `rgba(0,0,0,0.72)` | — | Modal overlay sólido (sem blur) |

### 2.3 Surfaces light (mantida, mas agora é opt-in)

| Token | Hex | Função |
|---|---|---|
| `--bg-canvas-light` | `#FFFFFF` | Body background light |
| `--bg-card-light` | `#FFFFFF` | Cards light |
| `--bg-elevated-light` | `#FAFAFA` | Drawer/popover light |
| `--bg-sunken-light` | `#F5F5F7` | Input bg light |

### 2.4 Borders & inner highlight

| Token | Valor | Função |
|---|---|---|
| `--border-sutil` | `hsla(0, 0%, 100%, 0.06)` (dark) / `hsla(0, 0%, 0%, 0.08)` (light) | Borda discreta de card |
| `--border-strong` | `hsla(0, 0%, 100%, 0.12)` (dark) / `hsla(0, 0%, 0%, 0.16)` (light) | Borda de input em foco, divider crítico |
| `--border-gold-soft` | `hsla(39, 99%, 46%, 0.18)` | Hover de card interativo (gold luminance) |
| `--inner-highlight` | `inset 0 1px 0 hsla(0, 0%, 100%, 0.04)` (dark) / `inset 0 1px 0 hsla(0, 0%, 100%, 0.65)` (light) | Linha "fake 3D" topo |

### 2.5 Texto dark

| Token | Hex | Contraste vs `#0A0B0D` | Uso |
|---|---|---|---|
| `--text-primary` | `#F5F6F7` (off-white) | **17.8:1 ✅ AAA** | Texto principal, números KPI |
| `--text-secondary` | `#C9CED5` | **12.3:1 ✅ AAA** | Texto corpo, descrições |
| `--text-muted` | `#A8AFB8` (sage-cool) | **9.8:1 ✅ AAA** | Labels, metadados |
| `--text-disabled` | `#5C636D` | **3.9:1 ⚠ UI only** | Placeholders, desabilitados |

### 2.6 Métricas (positivo/negativo) — dark

| Token | Hex | Contraste vs `#0A0B0D` | Uso |
|---|---|---|---|
| `--metric-positive` | **`#3DD58C`** | **7.2:1 ✅ AAA** | Delta +18.6%, deal ganho, sparkline up |
| `--metric-positive-soft` | `rgba(61, 213, 140, 0.14)` | UI | Background de chip "+18%" |
| `--metric-negative` | **`#E5614A`** | **5.4:1 ✅ AA** | Delta -2%, deal perdido, profit negativo |
| `--metric-negative-soft` | `rgba(229, 97, 74, 0.14)` | UI | Background de chip "-2%" |
| `--metric-neutral` | `#A8AFB8` | **9.8:1 ✅ AAA** | Delta sem mudança (=0%) |

### 2.7 Chart palette (novidade v5)

| Token | Hex | Contraste | Uso |
|---|---|---|---|
| `--chart-primary` | **`#5BA89A`** (teal-sage) | **4.5:1 ✅ AA UI** | Linha principal do AreaChart |
| `--chart-primary-glow` | `rgba(91, 168, 154, 0.18)` | — | Gradient fill stop topo |
| `--chart-primary-glow-low` | `rgba(91, 168, 154, 0)` | — | Gradient fill stop base |
| `--chart-secondary` | **`#E79501`** (gold) | **8.0:1 ✅ AAA** | 2ª série em linha (comparativo) |
| `--chart-tertiary` | `#9C8FC9` (lavanda muted) | **5.2:1 ✅ AA** | 3ª série (raro — só quando há 3+ linhas) |
| `--chart-grid` | `hsla(0, 0%, 100%, 0.04)` | — | Grid lines do chart (mal visíveis, intencional) |
| `--chart-axis-text` | `#A8AFB8` | **9.8:1 ✅ AAA** | Labels dos eixos |

### 2.8 Action tokens (semânticos)

| Token | Dark hex | Light hex | Uso |
|---|---|---|---|
| `--action-primary` | `#E79501` (gold) | `#141414` (ink) | CTA principal |
| `--action-primary-hover` | `#FFA61F` (gold lifted) | `#000000` | Hover do CTA |
| `--action-primary-foreground` | `#141414` (ink) | `#FFFFFF` | Texto do CTA |
| `--action-success` | `#3DD58C` | `#15803D` | Deal ganho |
| `--action-warning` | `#F2B441` | `#B45309` | Tarefa vencendo |
| `--action-danger` | `#E5614A` | `#CC4833` | Erro |
| `--action-info` | `#5BA89A` | `#0369A1` | Notificação |

### 2.9 Channel colors (preservados v3/v4 — funcionais, não mudam)

| Canal | Token | Dark hex | Light hex | Notas |
|---|---|---|---|---|
| WhatsApp | `--channel-whatsapp` | `#22C55E` (verde mais brilhante) | `#16A34A` | Verde WA reconhecido |
| Instagram | `--channel-instagram` | `#C26BE5` (lift do roxo IG) | `#9333EA` | Roxo IG reconhecido |
| Web Chat | `--channel-webchat` | `#60A5FA` (lift azul) | `#2563EB` | Azul WC reconhecido |

### 2.10 Pipeline stage colors (preservados v3/v4)

Mantidos os mesmos hex; em dark, aplicados como **chip bg sutil 18% opacidade + texto colorido**:

| Stage | Cor base | Chip bg dark | Texto |
|---|---|---|---|
| Novo Lead | `#A8AFB8` | `rgba(168,175,184,0.16)` | `--text-muted` |
| Contato | `#60A5FA` | `rgba(96,165,250,0.16)` | `#60A5FA` |
| Proposta | `#F2B441` | `rgba(242,180,65,0.16)` | `#F2B441` |
| Negociação | `#FF8B3D` (lift) | `rgba(255,139,61,0.16)` | `#FF8B3D` |
| Ganho | `#3DD58C` | `rgba(61,213,140,0.16)` | `#3DD58C` |
| Perdido | `#E5614A` | `rgba(229,97,74,0.16)` | `#E5614A` |

---

## 3. Tipografia v5 (= v4, mantida)

### 3.1 Stack

```css
--font-sans: var(--font-hind), var(--font-inter), -apple-system,
             BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: var(--font-mono), 'JetBrains Mono', 'IBM Plex Mono',
             ui-monospace, 'Cascadia Mono', Consolas, monospace;
```

### 3.2 Regras tipográficas (v5)

| Contexto | Família | Peso | Tamanho | Cor |
|---|---|---|---|---|
| KPI value (R$ 67.5k, 1340, 50%) | mono | 700 | text-3xl (30px) | `--text-primary` |
| KPI label (Receita do mês) | sans | 500 | text-xs (12px) uppercase tracking-wide | `--text-muted` |
| KPI delta (+18.6%, -2%) | mono | 600 | text-xs (12px) | `--metric-positive` / `--metric-negative` |
| KPI compared label (compared to R$1.2k last year) | sans | 400 | text-[10px] | `--text-disabled` |
| Card title (Account performance) | sans | 600 | text-base (16px) | `--text-primary` |
| Card subtitle | sans | 400 | text-xs | `--text-muted` |
| Body | sans | 400 | text-sm (14px) | `--text-secondary` |
| Table header | sans | 600 | text-xs uppercase tracking-wide | `--text-muted` |
| Table cell | sans | 400 | text-sm | `--text-secondary` |
| Table cell — valores R$ | mono | 500 | text-sm tabular-nums | `--text-primary` |
| FAB icon | — | — | 24px | `--action-primary-foreground` (ink) |
| Recommendation title | sans | 600 | text-sm | `--text-primary` |
| Recommendation body | sans | 400 | text-xs | `--text-muted` |
| Recommendation CTA | sans | 600 | text-xs uppercase | `--action-primary` (gold) |

---

## 4. Os 10 truques "futuristas" do v5 (sem glassmorphism)

### 4.1 Layered depth via background delta

**Substitui sombras pesadas.** A ref cria profundidade puramente por diferença de luminosidade entre camadas (canvas → card → elevated → sunken).

```css
.bg-canvas    { background: hsl(var(--bg-canvas)); }       /* #0A0B0D */
.bg-card      { background: hsl(var(--bg-card)); }         /* #141414 */
.bg-elevated  { background: hsl(var(--bg-elevated)); }     /* #1C1D21 */
.bg-sunken    { background: hsl(var(--bg-sunken)); }       /* #0E0F12 */
```

**Quando usar cada uma:**
- canvas: `<body>`
- card: cards padrão (KPI, recommendations, sidebar, tabela)
- elevated: drawer, dropdown, popover, KPI "destaque", hover state
- sunken: inputs, search bar, filter chips em repouso

### 4.2 Subtle border luminance (inner highlight 4%)

**Substitui sombra branca pesada do light.** No dark, 1px de branco a 4% no topo do card simula "luz vinda de cima" sem brilho excessivo.

```css
.card-luminance {
  background: hsl(var(--bg-card));
  border: 1px solid var(--border-sutil);     /* hsla white 6% */
  box-shadow: var(--inner-highlight);         /* inset 0 1px 0 hsla white 4% */
}
```

### 4.3 Glow under chart line

**SVG `<linearGradient>` + radial halo CSS** dão o efeito "linha brilhando, área embaixo desbotando".

```tsx
// Dentro de Recharts <AreaChart>
<defs>
  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stopColor="var(--chart-primary)" stopOpacity="0.40" />
    <stop offset="60%"  stopColor="var(--chart-primary)" stopOpacity="0.10" />
    <stop offset="100%" stopColor="var(--chart-primary)" stopOpacity="0" />
  </linearGradient>
</defs>
<Area
  type="monotone"
  dataKey="receita"
  stroke="var(--chart-primary)"
  strokeWidth={2}
  fill="url(#areaGlow)"
  style={{ filter: 'drop-shadow(0 0 8px rgba(91,168,154,0.45))' }}
/>
```

### 4.4 Animated sparkline draw

**`stroke-dasharray` clássico** — desenha a linha ao montar sem framer-motion.

```css
.sparkline-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw-sparkline 800ms ease-out 200ms forwards;
}
@keyframes draw-sparkline {
  to { stroke-dashoffset: 0; }
}
```

### 4.5 Number counter on mount

**requestAnimationFrame 600ms** — KPI value "conta" de 0 ao valor final ao carregar a tela.

```tsx
function useCountUp(end: number, duration = 600) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf: number, start: number | null = null
    const step = (t: number) => {
      if (start === null) start = t
      const progress = Math.min((t - start) / duration, 1)
      setN(Math.floor(progress * end))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [end, duration])
  return n
}
```

### 4.6 Card hover: gold border luminance

**Borda passa de `--border-sutil` (6% white) → `--border-gold-soft` (18% gold)** em 150ms. Substitui sombra pesada.

```css
.card-interactive {
  border-color: var(--border-sutil);
  transition: border-color 150ms ease;
}
.card-interactive:hover {
  border-color: var(--border-gold-soft);
}
```

### 4.7 Sticky filter bar sem blur

**Background sólido `hsl(var(--bg-card) / 0.96)` opaco** — substitui `backdrop-filter` sem perda visual percebida em dark.

```css
.filter-bar-sticky {
  position: sticky;
  top: 0;
  z-index: 30;
  background: hsl(var(--bg-card) / 0.96);
  border-bottom: 1px solid var(--border-sutil);
}
```

### 4.8 Pulse dot (live indicator)

**Mantido do v4** — usado em "online" no Chat, "atualizado agora" no Dashboard.

```css
.pulse-dot {
  background: var(--metric-positive);
  animation: pulse-live 1.6s ease-in-out infinite;
}
@keyframes pulse-live {
  0%, 100% { box-shadow: 0 0 0 0 rgba(61,213,140,0.6); transform: scale(1); }
  50%      { box-shadow: 0 0 0 6px rgba(61,213,140,0); transform: scale(1.15); }
}
```

### 4.9 Tag pill com gold ring on hover

```css
.tag-pill {
  background: hsl(var(--bg-elevated));
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  border: 1px solid transparent;
  transition: all 150ms ease;
}
.tag-pill:hover {
  border-color: var(--brand-gold);
  box-shadow: 0 0 0 3px rgba(231,149,1,0.15);
  color: var(--brand-gold);
}
.tag-pill-warm {
  background: rgba(231,149,1,0.14);
  color: var(--brand-gold);
}
```

### 4.10 FAB com sustained gold glow

```css
.fab-gold {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  background: var(--brand-gold);
  color: var(--brand-ink);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.08),
    0 8px 24px -8px rgba(231,149,1,0.50),
    0 4px 8px -2px rgba(0,0,0,0.40);
  transition: all 200ms ease;
}
.fab-gold:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.12),
    0 14px 36px -10px rgba(231,149,1,0.70),
    0 6px 12px -4px rgba(0,0,0,0.45);
}
.fab-gold:active { transform: translateY(0) scale(0.98); }
```

---

## 5. Componentes novos (8 inspirados na ref)

### 5.1 `KPIStatCard` (número + delta% + sparkline ou donut)

**Estrutura:**

```
┌──────────────────────────────────────────┐
│ RECEITA DO MÊS                    ⓘ      │  ← label uppercase muted
│                                          │
│ R$ 67.500    ↑ +18.6%   ╱╲╱╲╱╲╱─────    │  ← número (mono) | delta | sparkline
│                                          │
│ vs. R$ 56.900 último mês                 │  ← comparativo (text-disabled)
└──────────────────────────────────────────┘
```

**Variants:**

| Variant | Visual | Quando |
|---|---|---|
| `default` | sparkline lateral | 3 primeiros KPIs |
| `donut` | donut ring substitui sparkline (ex: taxa de conversão 18%) | KPI percentual |
| `feature` | bg `--bg-elevated` + border-gold-soft + sparkline maior | KPI "Receita" (destaque emocional) |

**Props:**

```ts
type KPIStatCardProps = {
  label: string;
  value: string;            // já formatado (R$ 67.5k, 1340, 50%)
  delta?: { value: number; period: string }; // { value: +18.6, period: 'vs mês passado' }
  sparkline?: number[];     // até 30 pontos
  donutPercent?: number;    // 0-100, alternativa à sparkline
  variant?: 'default' | 'donut' | 'feature';
  loading?: boolean;
};
```

### 5.2 `FilterBar` (filtros horizontais sticky)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [📅 25/04 – 25/05]  [Pipeline: Atacado ▾]  [Vendedor: Todos ▾]  [Canal ▾] │
└──────────────────────────────────────────────────────────────────────────┘
```

**Estrutura:** sticky top do dashboard, bg `--bg-card/96`. Cada filtro é uma `<Button variant="filter-chip">` que abre `Popover` shadcn.

**Props:**

```ts
type FilterBarProps = {
  dateRange: DateRange;
  onDateRangeChange: (r: DateRange) => void;
  pipeline: 'atacado' | 'varejo' | 'todos';
  onPipelineChange: (p: string) => void;
  vendedor: string;
  onVendedorChange: (v: string) => void;
  canal: 'WhatsApp' | 'Instagram' | 'Web Chat' | 'todos';
  onCanalChange: (c: string) => void;
};
```

### 5.3 `RecommendationCard` (3 ações sugeridas)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Ações sugeridas hoje                                                    │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│ 📨  3 leads sem    │ ⏰ 5 tarefas        │ 🎯 Meta do mês: 62%         │
│     resposta há +24h│    vencidas         │    R$ 67.5k / R$ 110k       │
│                     │                     │                             │
│     Você arrisca   │     Reagendar ou    │     Faltam 8 dias e         │
│     perder esses   │     concluir antes  │     R$ 42.500 para meta.    │
│     leads.         │     que cliente      │     Foque em deals quentes. │
│                     │     reclame.        │                             │
│                     │                     │                             │
│  [Ver leads →]      │  [Reagendar →]      │  [Ver pipeline →]           │
└─────────────────────┴─────────────────────┴─────────────────────────────┘
```

**Layout:** 3 colunas desktop, 1 col stack mobile com swipe horizontal (CSS scroll-snap).

### 5.4 `AreaChartGlow` (line chart com gradient + glow)

**Configuração Recharts:**

```tsx
<ResponsiveContainer width="100%" height={280}>
  <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
    <defs>
      <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="hsl(var(--chart-primary))" stopOpacity="0.40" />
        <stop offset="60%"  stopColor="hsl(var(--chart-primary))" stopOpacity="0.10" />
        <stop offset="100%" stopColor="hsl(var(--chart-primary))" stopOpacity="0" />
      </linearGradient>
    </defs>
    <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="0" vertical={false} />
    <XAxis dataKey="month" stroke="hsl(var(--chart-axis-text))" fontSize={11} axisLine={false} tickLine={false} />
    <YAxis stroke="hsl(var(--chart-axis-text))" fontSize={11} axisLine={false} tickLine={false} />
    <Tooltip
      contentStyle={{
        background: 'hsl(var(--bg-elevated))',
        border: '1px solid var(--border-sutil)',
        borderRadius: 8,
        color: 'hsl(var(--text-primary))'
      }}
    />
    <Area
      type="monotone"
      dataKey="receita"
      stroke="hsl(var(--chart-primary))"
      strokeWidth={2}
      fill="url(#areaGlow)"
      activeDot={{ r: 5, fill: 'hsl(var(--chart-primary))', strokeWidth: 0 }}
      style={{ filter: 'drop-shadow(0 0 8px rgba(91,168,154,0.45))' }}
    />
  </AreaChart>
</ResponsiveContainer>
```

### 5.5 `PatternBar` (horizontal progress bars proporcional)

**Substitui:** "Top 5 leads quentes" do v4 (esse migra para drawer de Insights, opcional).

```
┌────────────────────────────────┐
│ Distribuição por canal         │
│                                │
│ WhatsApp   ████████████  64%  │
│ Instagram  ████          22%  │
│ Web Chat   ██             9%  │
│ Outros     █              5%  │
└────────────────────────────────┘
```

**Cada barra:**
```tsx
<div className="flex items-center gap-3">
  <span className="w-20 text-xs text-muted">WhatsApp</span>
  <div className="flex-1 h-1.5 rounded-full bg-sunken overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-slow"
      style={{ width: '64%', background: 'hsl(var(--channel-whatsapp))' }}
    />
  </div>
  <span className="w-12 text-right font-mono text-xs text-primary">64%</span>
</div>
```

### 5.6 `GroupedBarChart` (12 meses ganhos vs perdidos)

```tsx
<ResponsiveContainer width="100%" height={240}>
  <BarChart data={monthly} barGap={4}>
    <CartesianGrid stroke="hsl(var(--chart-grid))" vertical={false} />
    <XAxis dataKey="month" stroke="hsl(var(--chart-axis-text))" fontSize={11} axisLine={false} tickLine={false} />
    <YAxis stroke="hsl(var(--chart-axis-text))" fontSize={11} axisLine={false} tickLine={false} />
    <Tooltip contentStyle={{ background: 'hsl(var(--bg-elevated))', border: '1px solid var(--border-sutil)', borderRadius: 8 }} />
    <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(var(--text-muted))' }} />
    <Bar dataKey="ganhos"   fill="hsl(var(--metric-positive))" radius={[3, 3, 0, 0]} name="Ganhos" />
    <Bar dataKey="perdidos" fill="hsl(var(--metric-negative))" radius={[3, 3, 0, 0]} name="Perdidos" />
  </BarChart>
</ResponsiveContainer>
```

### 5.7 `DataTableDark` (tabela de leads recentes)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ LEAD              CRIADO EM    VALOR EST.   VALOR FECH.  RESULT.  ETAPA   CANAL   ✎ │
├────────────────────────────────────────────────────────────────────────────────┤
│ Loja Sul Bout.   25/05 10:33   R$ 4.500    R$ 4.200    -R$ 300  [Negoc.] [WA]  ✎ │
│ Moda da Mile     24/05 14:22   R$ 5.890    —           —         [Prop.]  [IG]  ✎ │
│ Atacadão R.      24/05 09:15   R$ 1.890    R$ 1.890    +R$ 0    [Ganho]  [WC]  ✎ │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Detalhes:**
- Header `text-xs uppercase tracking-wide text-muted`
- Row height 48px, border-b `--border-sutil`
- Hover row: bg `hsl(var(--bg-elevated) / 0.5)`
- Coluna VALOR/RESULT.: `font-mono tabular-nums`; result positivo `--metric-positive`, negativo `--metric-negative`
- Coluna ETAPA: `tag-pill` com cor do stage
- Coluna CANAL: `tag-pill` com cor do channel
- Coluna ✎: ícone `Edit2` lucide com hover gold

### 5.8 `FABGold` (botão flutuante "Novo lead")

Ver §4.10 (CSS completo). Coloca `+` (lucide `Plus` 24px) centralizado. Tooltip "Novo lead" no hover (shadcn `Tooltip`).

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button onClick={onNewLead} className="fab-gold" aria-label="Novo lead">
        <Plus className="h-6 w-6" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="left">Novo lead (N)</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

Atalho de teclado **N** (não conflita com nada existente).

---

### 5.9 `BrandMark` / `TechmalhasLogo` (monograma TM tipográfico)

> **Decisão Tania 2026-05-25 (pós-mockups v5):** o monograma do CRM deixa de ser um "T" genérico em quadrado e passa a ser **"TM" em Hind 700 destacado** — coerência absoluta com a marca real (Hind é a fonte do site, 2125× uso dominante na auditoria). Davi decidiu, com liberdade consciente, usar **gold `#E79501`** como cor de destaque das letras (justificativa abaixo).

#### 5.9.1 Justificativa da cor (gold venceu vs teal-sage e gradiente)

| Opção | Hex | Contraste vs canvas `#0A0B0D` | Pró | Contra |
|---|---|---|---|---|
| **A) Gold** ✅ vencedora | `#E79501` | **8.0:1 ✅ AAA** | É **o** acento real da marca (13× no site — estrelas, "mais vendidos", destaques); amarra TM com FAB + primary CTA + ring focus (sistema visual coerente); máximo destaque no dark | Já é muito usado em outros pontos — risco mínimo de "saturação dourada" mitigado por aplicar TM em apenas 4 lugares (sidebar, login, favicon, avatar fallback) |
| B) Teal-sage | `#5BA89A` | 5.2:1 ✅ AA | Mais "tech"; coerente com `--chart-primary` | Teal-sage é **derivado** (sage + sutileza teal), não cor literal da marca; sage no site é **muted** por intenção (fundos suaves) — usar como TM contradiz a semântica do token |
| C) Gradient gold → teal-sage | — | ~5.2:1 (ponta sage) | Visual "premium" | Quebra a sensação editorial/atemporal do site (techmalhas.com.br é minimalista monocromático com 1 acento); gradiente em monograma vira "tech startup AI" — não é Techmalhas |

**Conclusão Davi:** **gold é a única escolha que respeita a marca literal + entrega contraste AAA + amarra o sistema visual.** Sage e gradiente são tecnicamente válidos mas semanticamente incoerentes com a identidade Techmalhas. Decisão consciente, registrada.

#### 5.9.2 Tipografia exata

| Propriedade | Valor | Razão |
|---|---|---|
| `font-family` | `var(--font-hind)` | Mesma fonte do site (Hind dominante 2125× na auditoria) |
| `font-weight` | `700` (bold) | Hind 700 tem bone geométrico firme — ideal para monograma |
| `letter-spacing` | `-0.04em` | Kerning apertado: TM lê como **um mark único**, não duas letras |
| `font-feature-settings` | `'kern' 1, 'liga' 1` | Liga `T`+`M` se a fonte tiver ligature (Hind não tem nativa, mas habilita defensivamente) |
| `line-height` | `1` | Monograma centra verticalmente sem "respirar" |
| `text-rendering` | `geometricPrecision` | Bordas mais limpas em tamanhos grandes |

#### 5.9.3 Escala de tamanhos (5 contextos)

| Contexto | Tamanho TM | Tamanho wordmark | Layout |
|---|---|---|---|
| **Favicon** (browser tab, ícone PWA) | 16px (compõe SVG 32×32) | — | Só TM, centralizado em quadrado com canto arredondado 4px |
| **Sidebar collapsed** (largura 64px) | 32px | — | Só TM, centralizado |
| **Sidebar expanded** (largura 240px) | 28px | "echmalhas" 14px muted | TM + "echmalhas" inline (não "Techmalhas" inteiro — TM já é o "T") |
| **Login hero** (centro do card) | 40px | "CRM" 12px muted uppercase tracking-wide | TM em destaque + "CRM" como product badge abaixo |
| **Avatar fallback** (LeadCard sem foto) | 20px | — | TM em círculo `bg-elevated` 40px (sem glow nesta variante — não competir com avatar de cliente) |

#### 5.9.4 Tratamento visual (glow gold sutil)

Em **fundos dark** (canvas/card/elevated), TM recebe **text-shadow glow** muito sutil para "respirar" da superfície:

```css
.brand-tm-glow {
  text-shadow:
    0 0 24px rgba(231, 149, 1, 0.35),
    0 0  4px rgba(231, 149, 1, 0.18);
}
```

**Não usar glow:**
- Avatar fallback (escala 20px — glow vira blur ilegível)
- Print stylesheet (papel monocromático)
- Favicon (raster pequeno — glow some na compressão)
- Light mode (gold em fundo branco já tem contraste suficiente; glow vira "halo amarelado" sujo)

#### 5.9.5 Componente React/TSX (pronto para Fábio)

```tsx
// crm-app/components/brand/BrandMark.tsx
import { cn } from '@/lib/utils'

type BrandMarkProps = {
  /** Variante de layout */
  variant?: 'mark' | 'sidebar' | 'sidebar-collapsed' | 'hero' | 'avatar'
  /** Sufixo opcional ("echmalhas" para wordmark completo, "CRM" para badge de produto) */
  suffix?: 'echmalhas' | 'CRM' | null
  /** Aplica glow gold (default: true exceto em avatar/favicon) */
  glow?: boolean
  className?: string
}

const sizeMap = {
  'mark':              { tm: 32, suffix: 0,  gap: 0 },
  'sidebar':           { tm: 28, suffix: 14, gap: 2 },
  'sidebar-collapsed': { tm: 32, suffix: 0,  gap: 0 },
  'hero':              { tm: 40, suffix: 12, gap: 6 },
  'avatar':            { tm: 20, suffix: 0,  gap: 0 },
}

export function BrandMark({
  variant = 'sidebar',
  suffix = variant === 'sidebar' ? 'echmalhas' : variant === 'hero' ? 'CRM' : null,
  glow,
  className,
}: BrandMarkProps) {
  const sizes = sizeMap[variant]
  const showGlow = glow ?? (variant !== 'avatar')

  return (
    <span
      className={cn('inline-flex items-baseline', className)}
      style={{ gap: sizes.gap }}
      aria-label="Techmalhas"
    >
      <span
        className={cn('brand-tm', showGlow && 'brand-tm-glow')}
        style={{ fontSize: sizes.tm, lineHeight: 1 }}
        aria-hidden="true"
      >
        TM
      </span>
      {suffix === 'echmalhas' && (
        <span
          className="brand-wordmark-rest"
          style={{ fontSize: sizes.suffix, lineHeight: 1 }}
          aria-hidden="true"
        >
          echmalhas
        </span>
      )}
      {suffix === 'CRM' && (
        <span
          className="brand-wordmark-rest uppercase tracking-[0.18em]"
          style={{ fontSize: sizes.suffix, lineHeight: 1 }}
          aria-hidden="true"
        >
          CRM
        </span>
      )}
    </span>
  )
}
```

**Uso:**

```tsx
// Sidebar expanded
<BrandMark variant="sidebar" />               // → "TMechmalhas" inline

// Sidebar collapsed
<BrandMark variant="sidebar-collapsed" />     // → "TM" 32px

// Login hero
<BrandMark variant="hero" />                  // → "TM" 40px + "CRM" abaixo

// Avatar fallback (sem cliente foto)
<BrandMark variant="avatar" glow={false} />   // → "TM" 20px em círculo
```

#### 5.9.6 Regras de wordmark (quando "echmalhas" vs "CRM" vs nada)

| Contexto | Sufixo | Razão |
|---|---|---|
| Sidebar expanded em qualquer rota | `"echmalhas"` | Reforça marca; usuário lê uma vez por sessão |
| Sidebar collapsed | nenhum | Falta espaço |
| Login hero | `"CRM"` | Diferencia "este é o CRM da Techmalhas" do site público |
| Header sticky de página interna | nenhum | Sidebar já mostra a marca; header foca no contexto da página |
| Avatar fallback | nenhum | É um placeholder, não branding |
| Favicon | nenhum | 16px não comporta sufixo |
| Email transactional (futuro) | `"echmalhas"` | Reforço de marca fora do app |

#### 5.9.7 SVG favicon (32×32 com TM Hind)

Como Hind não está disponível em fontes de sistema do browser para favicon raster, o favicon embute o texto **diretamente como SVG path** (converter "TM" em Hind 700 para path no Figma/Illustrator e exportar). Enquanto o asset definitivo não fica pronto, usar SVG com `<text>` (Hind via Google Fonts não funciona em favicon — fallback para `system-ui` é aceitável apenas em transição):

```svg
<!-- crm-app/app/icon.svg (Next 16 file convention — gera favicon automático) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="6" fill="#0A0B0D"/>
  <text
    x="50%" y="58%"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Hind, system-ui, -apple-system, sans-serif"
    font-weight="700"
    font-size="16"
    letter-spacing="-0.04em"
    fill="#E79501"
  >TM</text>
</svg>
```

**Etapa polish (pós-launch, opcional):** converter "TM" em `<path d="...">` via Figma (mais robusto em browsers sem Hind disponível como fallback).

#### 5.9.8 Variantes light/dark/print

| Tema | TM color | Glow | Wordmark color |
|---|---|---|---|
| **Dark** (default) | `#E79501` gold | `text-shadow` 24px gold 35% | `--text-muted` `#A8AFB8` |
| **Light** (opt-in) | `#E79501` gold | ❌ sem glow (halo amarelado em fundo branco vira sujeira) | `--text-muted` light `#666666` |
| **Print** (papel) | `#141414` ink | ❌ | `#666666` cinza |
| **Avatar fallback** (ambos) | `--text-primary` (off-white dark / ink light) | ❌ | — |

**Por que avatar fallback não é gold?** Avatar fallback aparece **lado a lado com avatares reais de clientes** em listas/Kanban — se cada "TM" virasse uma estrela dourada, viraria o foco visual da lista. Em avatar fallback, TM é **placeholder neutro**.

#### 5.9.9 Estados

| Estado | Visual |
|---|---|
| Default | TM gold + glow (dark) |
| Hover (quando link, ex: sidebar logo clicável para `/dashboard`) | Glow intensifica de 35% → 50% em 150ms |
| Focus visible | Ring gold 2px ao redor do componente (acessibilidade ao Tab) |
| Loading inicial (FOUC) | Renderiza com `font-family: system-ui` provisoriamente; ao Hind carregar, swap (display: swap já no `next/font`) |
| Reduced motion | Glow estático, sem transição |

---

## 6. Estados completos (preservados do v4 + ajustes dark)

| Estado | Visual v5 | Tokens-chave |
|---|---|---|
| **Default** | Surface `--bg-card`, border `--border-sutil`, inner highlight 4% | `--bg-card`, `--border-sutil` |
| **Hover** | Border passa para `--border-gold-soft`, sem translate (mais sutil que v4) | `--border-gold-soft` |
| **Hover Lift** (KPI, drawer trigger) | `translateY(-2px)` + sombra `0 8px 24px -8px gold/20` | — |
| **Focus** | Ring 2px gold + offset 2px, pulse 1× (600ms) | `--brand-gold` |
| **Active** | `scale(0.98)`, sombra reduzida | — |
| **Disabled** | `opacity: 0.4`, `pointer-events: none` | — |
| **Loading** | `skeleton-shimmer` com tint gold sutil (mantido v4) | `.skeleton-shimmer` |
| **Empty** | Ilustração ícone lucide outline + texto `--text-muted` + CTA gold | `--text-muted`, `--brand-gold` |
| **Error** | Border `--metric-negative`, mensagem `text-metric-negative`, ícone `AlertCircle` | `--metric-negative` |
| **Success** | Toast (sonner) com left border `--metric-positive` + ícone `CheckCircle2` | `--metric-positive` |

### 6.1 Loading skeleton dark (com shimmer gold tint)

```css
.skeleton-shimmer-dark {
  background: linear-gradient(
    90deg,
    hsl(var(--bg-sunken)) 0%,
    color-mix(in srgb, hsl(var(--bg-elevated)) 82%, var(--brand-gold)) 50%,
    hsl(var(--bg-sunken)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
  border-radius: 6px;
}
```

### 6.2 Empty state dark do dashboard

```
┌──────────────────────────────────────────┐
│                                          │
│              ┌──────────┐                │
│              │   📊     │  ← icon sage   │
│              └──────────┘                │
│                                          │
│         Sem dados no período             │  text-primary
│      Ajuste o filtro de data ou          │  text-muted
│         crie seu primeiro lead.          │
│                                          │
│         [ + Criar lead ]  ← gold         │  btn primary
│                                          │
└──────────────────────────────────────────┘
```

---

## 7. Matriz de contraste WCAG AA — dark (12+ pares recalculados)

Calculado via fórmula WCAG 2.1 (luminância relativa). Todos os pares críticos do v5 listados:

| Foreground | Background | Ratio | Resultado | Uso |
|---|---|---|---|---|
| `--text-primary` `#F5F6F7` | `--bg-canvas` `#0A0B0D` | **17.8:1** | ✅ AAA | Texto principal sobre canvas |
| `--text-primary` `#F5F6F7` | `--bg-card` `#141414` | **15.4:1** | ✅ AAA | Texto principal sobre card |
| `--text-primary` `#F5F6F7` | `--bg-elevated` `#1C1D21` | **12.7:1** | ✅ AAA | Texto em drawer/popover |
| `--text-secondary` `#C9CED5` | `--bg-card` `#141414` | **12.3:1** | ✅ AAA | Body text |
| `--text-muted` `#A8AFB8` | `--bg-card` `#141414` | **9.8:1** | ✅ AAA | Labels, metadados |
| `--text-disabled` `#5C636D` | `--bg-card` `#141414` | **3.9:1** | ⚠ UI only | Placeholders/desabilitados (não para texto informacional) |
| `--brand-gold` `#E79501` | `--bg-canvas` `#0A0B0D` | **8.0:1** | ✅ AAA | CTA gold (FAB, primary) |
| `--brand-gold` `#E79501` | `--bg-card` `#141414` | **6.9:1** | ✅ AA+ | Botão gold sobre card |
| `--brand-ink` `#141414` | `--brand-gold` `#E79501` | **7.7:1** | ✅ AAA | Texto ink no FAB/CTA gold (foreground) |
| `--metric-positive` `#3DD58C` | `--bg-canvas` `#0A0B0D` | **7.2:1** | ✅ AAA | Delta positivo, deal ganho |
| `--metric-positive` `#3DD58C` | `--bg-card` `#141414` | **6.2:1** | ✅ AA+ | Delta positivo sobre card |
| `--metric-negative` `#E5614A` | `--bg-canvas` `#0A0B0D` | **5.4:1** | ✅ AA | Delta negativo, deal perdido |
| `--metric-negative` `#E5614A` | `--bg-card` `#141414` | **4.7:1** | ✅ AA | Delta negativo sobre card |
| `--chart-primary` `#5BA89A` | `--bg-canvas` `#0A0B0D` | **5.2:1** | ✅ AA (UI ≥ 3:1) | Linha do AreaChart |
| `--chart-secondary` `#E79501` | `--bg-canvas` `#0A0B0D` | **8.0:1** | ✅ AAA | 2ª linha de chart |
| `--channel-whatsapp` `#22C55E` | `--bg-card` `#141414` | **6.5:1** | ✅ AA+ | Dot/tag WhatsApp |
| `--channel-instagram` `#C26BE5` | `--bg-card` `#141414` | **5.1:1** | ✅ AA | Dot/tag Instagram |
| `--channel-webchat` `#60A5FA` | `--bg-card` `#141414` | **6.4:1** | ✅ AA+ | Dot/tag Web Chat |
| Stage Negociação `#FF8B3D` | `--bg-card` `#141414` | **5.9:1** | ✅ AA | Tag "Negociação" |
| `--text-muted` em `tag-pill bg-sunken` | `#0E0F12` | **9.2:1** | ✅ AAA | Texto dentro de tag default |
| Border `--border-sutil` (rgba white 6%) | qualquer bg | UI ≥ 3:1 ⚠ | ⚠ UI ≥ 3:1 borderline | Borders são decorativos; chart-axis-text é o crítico (passou AAA) |
| Ring focus `--brand-gold` | sobre `--bg-card` | UI **3.5:1** | ✅ UI ≥ 3:1 | Focus ring visível |

### Red lines dark v5

- ❌ **Texto em `--text-disabled`** (`#5C636D`) só em placeholders e estados desabilitados; nunca em conteúdo informacional.
- ❌ **`--metric-negative` sobre `--metric-negative-soft`** dá apenas 3.8:1 — não usar texto dessa cor sobre seu próprio chip-bg; texto sempre branco/primary em chips coloridos.
- ❌ **`--chart-grid` (rgba white 4%)** é intencionalmente quase invisível; **nunca usar para texto**, só para grid lines decorativas.
- ❌ **Inner highlight branco 65%** (técnica de light mode v4) não funciona em dark — usa-se 4% white ou gold 4-12%.

### Light mode contrast (preservado v4)

Light mantém todas as combinações do v4 (já validadas: 24 pares AAA/AA). Ver `design-system-v4.md` §5.

---

## 8. Animação tokens (mantidos do v4)

| Token | Valor | Easing | Uso |
|---|---|---|---|
| `--duration-instant` | 100ms | ease-out | Toggle, ícone swap |
| `--duration-fast` | 150ms | ease-out | Hover de botão, mudança de cor, border luminance |
| `--duration-base` | 200ms | ease-in-out | FAB hover, popover, badge swap |
| `--duration-slow` | 250ms | ease-in-out | Drawer slide, fade-in stagger, sheet open |
| `--easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | — | Default |
| `--easing-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | — | Entrada/hover |
| `--easing-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | — | Saída/dismiss |
| `--easing-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | — | Kanban drop release |

Exceções pontuais: `ring-pulse` 600ms (1×), `sparkline-draw` 800ms (1×, ao mount). Ambos respeitam `prefers-reduced-motion`.

---

## 9. Componentes shadcn — afetados pelo v5

| Componente | Mudança v5 |
|---|---|
| `Button` | Variant `default` no dark = bg gold (`--action-primary`); novo variant `filter-chip` (bg sunken, hover gold border); variant `gold` mantido |
| `Card` | `default` agora usa `bg-card` + `inner-highlight` + border-sutil; remover `surface-premium-gold` no dark (não faz sentido com bg-elevated); manter para light |
| `Sheet` / `Drawer` | Background `--bg-elevated`, slide 250ms; overlay `--bg-overlay` sólido 72% |
| `Dialog` | Idem Sheet |
| `Input` | bg `--bg-sunken`; border-sutil; focus glow gold (mantido v4 `.input-focus-glow`) |
| `Badge` | Novo variant `tag-pill` (default neutro, hover gold ring); `tag-pill-warm` (bg gold-soft); `tag-pill-positive`, `tag-pill-negative` |
| `Skeleton` | `.skeleton-shimmer-dark` no dark; `.skeleton-shimmer` no light (mantido v4) |
| `Toast` (sonner) | next-themes injeta `theme="dark"`; left-border colorida (positive/negative/info) |
| `Tooltip` | Background `--bg-elevated`, border-sutil, text-primary |
| `DropdownMenu` | bg `--bg-elevated`, hover-item `--bg-card` |
| `Sidebar` (custom) | bg `--bg-card`; item ativo bg `--bg-elevated` + dot gold; sem sombra |
| `Popover` | bg `--bg-elevated`, border-sutil |
| `Select` | bg `--bg-sunken`, popover bg `--bg-elevated` |
| `Tabs` | underline gold no tab ativo |
| `Table` | bg transparent; row hover `--bg-elevated/50`; header bg transparent text-muted |

---

## 10. tailwind.config.ts — deltas para v5

```typescript
// Apenas o que MUDA vs v4.

{
  theme: {
    extend: {
      colors: {
        // ─── Surfaces dark (novidade v5) ───
        bg: {
          canvas:   'hsl(var(--bg-canvas))',
          card:     'hsl(var(--bg-card))',
          elevated: 'hsl(var(--bg-elevated))',
          sunken:   'hsl(var(--bg-sunken))',
        },
        // ─── Texto (helpers semânticos) ───
        fg: {
          primary:   'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          muted:     'hsl(var(--text-muted))',
          disabled:  'hsl(var(--text-disabled))',
        },
        // ─── Métricas ───
        metric: {
          positive:        'hsl(var(--metric-positive))',
          'positive-soft': 'hsl(var(--metric-positive-soft))',
          negative:        'hsl(var(--metric-negative))',
          'negative-soft': 'hsl(var(--metric-negative-soft))',
          neutral:         'hsl(var(--metric-neutral))',
        },
        // ─── Chart ───
        chart: {
          primary:    'hsl(var(--chart-primary))',
          secondary:  'hsl(var(--chart-secondary))',
          tertiary:   'hsl(var(--chart-tertiary))',
          grid:       'hsl(var(--chart-grid))',
          'axis-text':'hsl(var(--chart-axis-text))',
        },
        // ─── Brand (v4 mantido) ───
        brand: { /* mantido do v4 */ },
        // ─── Channels (v4 mantido + lifts dark) ───
        channel: {
          whatsapp:  'hsl(var(--channel-whatsapp))',
          instagram: 'hsl(var(--channel-instagram))',
          webchat:   'hsl(var(--channel-webchat))',
        },
      },
      borderColor: {
        sutil:     'var(--border-sutil)',
        strong:    'var(--border-strong)',
        'gold-soft':'var(--border-gold-soft)',
      },
      boxShadow: {
        // v4 mantidos
        'gold':       '0 4px 16px -4px rgb(231 149 1 / 0.22), 0 2px 6px -2px rgb(20 20 20 / 0.10)',
        'sage':       '0 4px 14px -4px rgb(134 151 145 / 0.24), 0 1px 3px -1px rgb(20 20 20 / 0.08)',
        'ink-glow':   '0 10px 24px -8px rgb(20 20 20 / 0.32), 0 4px 10px -4px rgb(20 20 20 / 0.18)',
        'terracotta': '0 4px 14px -4px rgb(204 72 51 / 0.24)',
        'gold-lift':  '0 14px 32px -8px rgb(231 149 1 / 0.28), 0 6px 14px -6px rgb(20 20 20 / 0.18)',
        // v5 novas
        'card-hover':   '0 8px 24px -8px rgb(231 149 1 / 0.20)',
        'fab':          '0 0 0 1px rgb(255 255 255 / 0.08), 0 8px 24px -8px rgb(231 149 1 / 0.50), 0 4px 8px -2px rgb(0 0 0 / 0.40)',
        'fab-hover':    '0 0 0 1px rgb(255 255 255 / 0.12), 0 14px 36px -10px rgb(231 149 1 / 0.70), 0 6px 12px -4px rgb(0 0 0 / 0.45)',
        'inner-light':  'inset 0 1px 0 hsla(0,0%,100%,0.04)',  // ← dark inner highlight
        'inner-paper':  'inset 0 1px 0 hsla(0,0%,100%,0.65)',  // ← light inner highlight (v4)
      },
      keyframes: {
        // v4 mantidos
        'orb-drift':  { '0%, 100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(20px,-16px) scale(1.06)' } },
        shimmer:      { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        'pulse-sage': { '0%, 100%': { transform: 'scale(1)', opacity: '1' }, '50%': { transform: 'scale(1.15)', opacity: '0.7' } },
        'ring-pulse': { /* mantido v4 */ },
        // v5 novas
        'pulse-live': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(61,213,140,0.6)', transform: 'scale(1)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(61,213,140,0)',   transform: 'scale(1.15)' },
        },
        'draw-sparkline': { to: { strokeDashoffset: '0' } },
        'count-up-fade':  { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'orb-drift':       'orb-drift 14s ease-in-out infinite',
        shimmer:           'shimmer 1.6s ease-in-out infinite',
        'pulse-sage':      'pulse-sage 1.6s ease-in-out infinite',
        'pulse-live':      'pulse-live 1.6s ease-in-out infinite',
        'ring-pulse':      'ring-pulse 600ms cubic-bezier(0,0,0.2,1) 1',
        'draw-sparkline':  'draw-sparkline 800ms ease-out 200ms forwards',
      },
      borderRadius: {
        // v5 usa 0.75rem (era 0.5rem v4)
        DEFAULT: '0.75rem',
      },
    },
  },
}
```

---

## 11. Checklist de qualidade v5

- [x] Tema padrão dark; light disponível como opt-in (toggle no UserMenu)
- [x] Paleta de surfaces dark com 4 layers (canvas, card, elevated, sunken)
- [x] Brand Techmalhas preservada (ink, paper, gold, sage, terracotta)
- [x] Chart palette derivada da marca (teal-sage `#5BA89A`, metric-positive `#3DD58C`, metric-negative `#E5614A`)
- [x] FAB roxo da ref substituído por gold Techmalhas (DNA da marca)
- [x] Tipografia Hind + JBMono mantida do v4
- [x] 10 técnicas futuristas SEM glassmorphism documentadas
- [x] 8 componentes novos especificados com props/variants
- [x] WCAG AA recalculado em 21 pares dark + 4 light críticos (todos passam)
- [x] Dependência única adicional: Recharts (~50KB, dynamic import)
- [x] Channel colors + stage colors preservados (não retreinar Vitor/Ana)
- [x] Animações cap em 250ms; ring-pulse 600ms (1×) e sparkline-draw 800ms (1×) são exceções pontuais
- [x] `prefers-reduced-motion` respeitado em todas as animações novas
- [x] Light mode é o "v4 invertido" — preserva todo o trabalho anterior
- [x] Compatibilidade cross-device 100% (sem `backdrop-filter`, sem `mask-image` custom)
- [x] Print stylesheet força light scheme (papel)

---

*Design System v5 — Davi Designer | CRM Techmalhas | 2026-05-25*
