# Design System v4 — CRM Techmalhas

> **Autor:** Davi Designer · **Data:** 2026-05-25 · **Status:** Proposto (aguarda ADR-009)
> **Substitui:** `output/2026-05-24-162435/v3/design-system.md`
> **Fonte da verdade da marca:** `brand-audit-techmalhas-site.md` (auditoria literal do site público)

---

## TL;DR — o que mudou de v3 → v4

- **Paleta realinhada ao site real.** Verde floresta `#1A6B3C` (assunção criativa do v3) sai; entram **preto `#141414` + dourado `#E79501` + sage `#869791` + branco puro `#FFFFFF`**, extraídos ao vivo de `techmalhas.com.br`.
- **Primary CTA agora é preto Techmalhas**, não azul `#1D4ED8`. O site real usa preto puro como ação dominante — o azul do v3 destoava da marca.
- **Tipografia migra de Inter → Hind** (mesma família do site). Inter permanece como fallback no stack `next/font` (zero esforço de remoção). `JetBrains Mono` entra apenas para números de KPI.
- **Camada premium futurista** adicionada de forma cirúrgica: glassmorphism em sidebar/drawers, sombras coloridas (gold/sage tint), mesh gradient no login, micro-interações ≤ 250ms, dark mode polido (opt-in).
- **WCAG AA preservado e recalculado**. Toda combinação fg/bg da nova paleta foi reverificada — nenhuma regressão de acessibilidade.

---

## 1. Diff visual de paleta (v3 → v4)

| Camada | v3 (atual deployed) | v4 (novo — site real) | Status |
|---|---|---|---|
| Primary CTA | `#1D4ED8` azul royal (action-primary) ou `#1A6B3C` verde floresta (brand) | `#141414` preto Techmalhas | 🔄 **mudança radical** |
| Accent / destaque | `#C97A2F` caramelo | `#E79501` dourado/âmbar | ⚠️ mesma família, mais vibrante |
| Background app | `#F8F9FA` off-white | `#FFFFFF` branco puro | ⚠️ sutil |
| Texto principal | `#1A1A1A` grafite | `#141414` ink | ✅ praticamente idêntico |
| Verde "secundário" | — (não havia) | `#869791` sage muted | ✨ novo (seções, dividers) |
| Cor de "perigo suave" | `#B91C1C` vermelho | `#CC4833` terracotta | 🔄 ajuste |
| Família tipográfica | Inter | **Hind** + Inter fallback | 🔄 mudança |
| Mono p/ KPIs | — | `JetBrains Mono` | ✨ novo |
| Glassmorphism | — | Sidebar/drawer/modal | ✨ novo |
| Sombras coloridas | sombras pretas neutras | gold/sage tint 8–15% | ✨ novo |
| Dark mode | rascunho (v3 não usado) | polido e selecionável | 🔄 amadurece |

> **Nota de continuidade:** Pipeline stages, canais (WhatsApp/Instagram/Web Chat) e ações semânticas success/warning/info/danger são **preservados** do v3. A reforma é na camada de **marca + chrome**, não na camada de **dado funcional** — não queremos retreinar Vitor sobre o que é "Negociação amarela" vs "Negociação laranja".

---

## 2. Tokens fundamentais — paleta v4

### 2.1 Brand core (literais do site, 2026-05-25)

| Token | Hex | HSL | RGB | Uso |
|---|---|---|---|---|
| `--brand-ink` | `#141414` | `0 0% 8%` | 20,20,20 | Texto principal + **primary CTA**, header dark mode |
| `--brand-paper` | `#FFFFFF` | `0 0% 100%` | 255,255,255 | Background principal do app |
| `--brand-gold` | `#E79501` | `39 99% 46%` | 231,149,1 | Acento principal — badges, highlights, "novo" |
| `--brand-sage` | `#869791` | `159 8% 56%` | 134,151,145 | Fundos de seção, dividers suaves, dark mode surface |
| `--brand-terracotta` | `#CC4833` | `8 60% 50%` | 204,72,51 | CTA ocasional, erros suaves |

### 2.2 Variantes de marca (hover, light, glow)

| Token | Hex | HSL | Uso |
|---|---|---|---|
| `--brand-ink-hover` | `#000000` | `0 0% 0%` | Hover/active de `--brand-ink` |
| `--brand-ink-glow` | `rgba(20,20,20,0.18)` | — | Sombra colorida para CTA primary em hover |
| `--brand-gold-hover` | `#C97D00` | `38 100% 39%` | Hover dourado |
| `--brand-gold-light` | `#FFF5E1` | `41 100% 94%` | Background de badges "destaque", chips dourados |
| `--brand-gold-glow` | `rgba(231,149,1,0.15)` | — | Sombra colorida em KPI card de destaque |
| `--brand-sage-hover` | `#6F7F7B` | `163 7% 47%` | Hover sage |
| `--brand-sage-light` | `#EEF2F0` | `150 13% 95%` | Background de seções suaves |
| `--brand-sage-glow` | `rgba(134,151,145,0.12)` | — | Sombra colorida em cards de leitura |
| `--brand-terracotta-hover` | `#A83A28` | `9 62% 41%` | Hover terracota |
| `--brand-terracotta-light` | `#FBE5E0` | `12 79% 93%` | Background de erros suaves |

### 2.3 Neutros (escala extraída do site)

| Token | Hex | HSL | Uso |
|---|---|---|---|
| `--neutral-900` | `#141414` | `0 0% 8%` | mesmo que `--brand-ink` |
| `--neutral-800` | `#212529` | `210 11% 15%` | Texto de máximo contraste alternativo |
| `--neutral-700` | `#676767` | `0 0% 40%` | Texto descritivo, preço barrado |
| `--neutral-600` | `#6C6A77` | `248 6% 44%` | Texto secundário, metadados |
| `--neutral-500` | `#ADADAD` | `0 0% 68%` | Placeholders, ícones desabilitados |
| `--neutral-400` | `#D6D6D6` | `0 0% 84%` | Bordas em repouso |
| `--neutral-300` | `#F0F0F0` | `0 0% 94%` | Backgrounds neutros, botão secundário |
| `--neutral-200` | `#F7F7F7` | `0 0% 97%` | Surface alternativa, hover de linha |
| `--neutral-100` | `#FAFAFA` | `0 0% 98%` | Surface mais suave (sidebar light) |
| `--neutral-paper` | `#FFFFFF` | `0 0% 100%` | Background principal |
| `--neutral-overlay` | `rgba(20,20,20,0.55)` | — | Overlay de modal/sheet (mais escuro que v3) |

### 2.4 Ações semânticas (preservadas do v3, mas terracota substitui danger antigo)

| Token | Hex | HSL | Contraste vs branco | Uso |
|---|---|---|---|---|
| `--action-primary` | `#141414` | `0 0% 8%` | **18.7:1 ✅ AAA** | CTA principal (ex-azul `#1D4ED8`) |
| `--action-primary-hover` | `#000000` | `0 0% 0%` | **21:1 ✅ AAA** | Hover |
| `--action-success` | `#15803D` | `142 71% 29%` | **5.6:1 ✅ AA** | Deal ganho, confirmações (mantido v3) |
| `--action-warning` | `#B45309` | `26 90% 37%` | **4.7:1 ✅ AA** | Tarefa vencendo (mantido v3) |
| `--action-danger` | `#CC4833` | `8 60% 50%` | **4.6:1 ✅ AA** | Erros (era `#B91C1C`, agora terracota da marca) |
| `--action-info` | `#0369A1` | `200 95% 32%` | **7.6:1 ✅ AA** | Informação (mantido v3) |

### 2.5 Canais (preservados do v3, sem mudança)

WhatsApp, Instagram e Web Chat permanecem com os mesmos tokens do v3 — são padrões reconhecidos do mercado e Vitor já está mentalmente treinado.

### 2.6 Pipeline stages (preservados do v3)

`stage-new-lead` → `stage-lost` mantêm os mesmos hex do v3 (gradação cinza → azul → amarelo → laranja → verde/vermelho terminal). **Justificativa:** alterar a leitura do funil sem motivo de marca confunde o vendedor.

---

## 3. Tipografia v4

### 3.1 Configuração `next/font/google` (substituir Inter por Hind)

```typescript
// crm-app/app/layout.tsx
import { Hind, Inter, JetBrains_Mono } from 'next/font/google'

const hind = Hind({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${hind.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      ...
    </html>
  )
}
```

### 3.2 Stack final em CSS

```css
:root {
  --font-sans: var(--font-hind), var(--font-inter), -apple-system,
               BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: var(--font-mono), 'JetBrains Mono', 'IBM Plex Mono',
               ui-monospace, 'Cascadia Mono', Consolas, monospace;
}

body { font-family: var(--font-sans); }
.font-kpi { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
```

### 3.3 Escala (preservada do v3 — não há razão para mudar)

`text-xs` 12px · `text-sm` 14px · `text-base` 16px · `text-lg` 18px · `text-xl` 20px · `text-2xl` 24px · `text-3xl` 30px · `text-4xl` 36px

**Pesos Hind:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold).

### 3.4 Regras tipográficas novas

| Contexto | Família | Peso | Motivação |
|---|---|---|---|
| KPI value (R$ 12.500, 47 leads, 23%) | `--font-mono` | 600 | Tabular-nums alinha dígitos; toque "techy" sutil |
| KPI label | `--font-sans` | 500 | Hind para legibilidade do rótulo |
| Botão primary | `--font-sans` | 600 | Hind 600 tem ótimo bone em CTAs |
| Headings (h1–h3) | `--font-sans` | 700 | Hind bold é geométrica e firme |
| Corpo / inputs | `--font-sans` | 400 | Default editorial do site |

---

## 4. 9 técnicas premium futuristas

> A camada futurista é **uma capa fina sobre o design system v3**, não um redesign visual. Cada técnica resolve um problema específico de hierarquia ou delight; nenhuma é decoração pura.

### 4.1 Glassmorphism sutil

**Quando usar:** sidebar, header sticky, drawers de detalhe de lead, modais sobre conteúdo.

**Quando NÃO usar:** KPI cards (precisam fundo sólido), inputs (perdem clareza), Kanban cards densos.

```css
@layer utilities {
  .glass {
    background: color-mix(in srgb, hsl(var(--card)) 78%, transparent);
    backdrop-filter: blur(16px) saturate(140%);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    border: 1px solid color-mix(in srgb, hsl(var(--border)) 60%, transparent);
  }
  .glass-dark {
    background: color-mix(in srgb, hsl(var(--card)) 60%, transparent);
    backdrop-filter: blur(20px) saturate(160%);
  }
}
```

**Tailwind utility:**

```tsx
<aside className="glass border-r border-border/60">
```

**Componente shadcn afetado:** `Sheet`, `Dialog`, `Sidebar` custom.

**Fallback:** se `backdrop-filter` não suportado, usar `bg-card/95` sólido (browsers ≥ 2018 cobrem 96% do tráfego).

---

### 4.2 Micro-interações (hover scale, ripple sutil, fade)

**Quando usar:** botões, KanbanCard, itens de menu, ChannelBadge.

**Quando NÃO usar:** inputs (distrai durante digitação), texto de leitura.

```tsx
// Botão primary com micro-interação
<button className="
  bg-action-primary text-white px-4 py-2 rounded-md font-semibold
  transition-all duration-150 ease-out
  hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgb(20_20_20/0.35)]
  active:translate-y-0 active:scale-[0.98]
  focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2
">
  Criar lead
</button>
```

**Framer Motion (KanbanCard):**

```tsx
import { motion } from 'framer-motion'

<motion.div
  whileHover={{ y: -2, scale: 1.01 }}
  whileTap={{ scale: 0.99 }}
  transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
  className="kanban-card"
>
```

**Regra de ouro:** nenhuma transição passa de **250ms**. CRM tem uso prolongado — animação longa cansa.

**Componente shadcn afetado:** `Button` (variantes), `Card`.

---

### 4.3 Gradientes sutis (1–3% de variação tonal)

**Quando usar:** hero de login, header de página, KPI cards de destaque, fundo de seção.

**Quando NÃO usar:** bordas, texto de corpo, cards densos.

```css
@layer utilities {
  /* Hero do login — mesh sutil ink → terracota → sage */
  .bg-hero-mesh {
    background:
      radial-gradient(ellipse 80% 60% at 20% 20%, hsl(var(--brand-gold) / 0.10), transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 70%, hsl(var(--brand-sage) / 0.12), transparent 65%),
      radial-gradient(ellipse 70% 60% at 50% 110%, hsl(var(--brand-terracotta) / 0.08), transparent 60%),
      hsl(var(--background));
  }

  /* Header de página — gradiente vertical 2% */
  .bg-header-gradient {
    background: linear-gradient(180deg,
      hsl(var(--background)) 0%,
      color-mix(in srgb, hsl(var(--background)) 98%, hsl(var(--brand-sage))) 100%);
  }

  /* KPI card de destaque — gradiente diagonal sutil */
  .bg-kpi-feature {
    background: linear-gradient(135deg,
      hsl(var(--card)) 0%,
      color-mix(in srgb, hsl(var(--card)) 97%, hsl(var(--brand-gold))) 100%);
  }
}
```

**Componente shadcn afetado:** `Card` (variant `feature`).

---

### 4.4 Sombras coloridas (gold/sage tint, 8–15%)

**Quando usar:** cards elevados em foco, botão primary em hover, KPI card de destaque.

**Quando NÃO usar:** inputs (gera ruído visual), dividers.

```css
@layer utilities {
  /* Sombra com tint dourado (foco) */
  .shadow-gold {
    box-shadow:
      0 4px 16px -4px rgb(231 149 1 / 0.18),
      0 2px 6px -2px rgb(20 20 20 / 0.08);
  }
  /* Sombra com tint sage (cards de leitura) */
  .shadow-sage {
    box-shadow:
      0 4px 14px -4px rgb(134 151 145 / 0.22),
      0 1px 3px -1px rgb(20 20 20 / 0.06);
  }
  /* Sombra para CTA primary hover */
  .shadow-ink-glow {
    box-shadow:
      0 10px 24px -8px rgb(20 20 20 / 0.32),
      0 4px 10px -4px rgb(20 20 20 / 0.18);
  }
  /* Sombra terracota — usado em estados de erro destacados */
  .shadow-terracotta {
    box-shadow:
      0 4px 14px -4px rgb(204 72 51 / 0.22);
  }
}
```

**Tailwind config (alternativa):** adicionar como `boxShadow` em `theme.extend`. Documentado também na seção 9.

**Componente shadcn afetado:** `Card`, `Button` (hover state).

---

### 4.5 Animações de entrada (fade + slide stagger 50ms)

**Quando usar:** listas de leads ao carregar, cards do Kanban na primeira renderização, dashboard KPI ao montar.

**Quando NÃO usar:** toda interação subsequente (cansa após 10 minutos de uso).

```tsx
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,  // 50ms stagger
      delayChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.22, ease: [0, 0, 0.2, 1] },
  },
}

<motion.div variants={containerVariants} initial="hidden" animate="show">
  {leads.map(lead => (
    <motion.div key={lead.id} variants={itemVariants}>
      <LeadCard lead={lead} />
    </motion.div>
  ))}
</motion.div>
```

**Regra:** stagger limitado aos primeiros 12 itens visíveis (resto entra direto). Acima disso, performance > delight.

**Acessibilidade:** respeitar `prefers-reduced-motion` (já no `globals.css` v3 — manter).

---

### 4.6 Dark mode polido (opt-in)

**Padrão:** light (decisão da Tania em `_memory/preferences.md`). Dark mode disponível via toggle no menu do usuário.

```css
.dark {
  /* Backgrounds: ink → off-ink → surface elevada */
  --background: 0 0% 6%;            /* #0F0F0F (mais escuro que ink puro) */
  --foreground: 0 0% 96%;           /* off-white */
  --card: 0 0% 10%;                 /* #1A1A1A surface */
  --card-foreground: 0 0% 96%;
  --popover: 0 0% 9%;
  --popover-foreground: 0 0% 96%;

  /* Primary fica gold no dark (preto sobre preto não funciona) */
  --primary: 39 99% 52%;            /* gold ligeiramente mais claro */
  --primary-foreground: 0 0% 8%;    /* ink sobre gold */

  --secondary: 0 0% 14%;
  --secondary-foreground: 0 0% 92%;
  --muted: 0 0% 14%;
  --muted-foreground: 0 0% 65%;
  --accent: 39 99% 52%;
  --accent-foreground: 0 0% 8%;
  --destructive: 8 70% 55%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 18%;
  --input: 0 0% 18%;
  --ring: 39 99% 52%;               /* gold ring no dark */

  /* Glass no dark fica mais opaco */
  --glass-bg: 0 0% 10% / 0.72;
}
```

**Justificativa do swap "preto → gold" no dark mode:** se `--primary` continuasse preto, o botão sumiria no fundo preto. Gold como primary no dark mantém a paleta da marca **e** garante contraste (gold sobre ink dá 7.7:1 — AAA).

**Componente shadcn afetado:** todos via tokens HSL. Adicionar `ThemeToggle` em `UserMenu`.

---

### 4.7 Mesh gradient / orb glow no login (toque "futurista")

**Quando usar:** apenas no `/login` (hero). É o ponto onde o usuário entra "frio" e merece um momento de cuidado visual.

**Quando NÃO usar:** dashboards, listas operacionais (precisa de calma).

```tsx
// app/(auth)/login/page.tsx — fragmento do background
<div className="relative min-h-screen overflow-hidden bg-hero-mesh">
  {/* Orbs animados com mix-blend-multiply */}
  <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96
                  rounded-full bg-brand-gold/25 blur-3xl animate-orb-drift" />
  <div className="pointer-events-none absolute top-1/3 -right-40 h-[28rem] w-[28rem]
                  rounded-full bg-brand-sage/30 blur-3xl animate-orb-drift-slow" />
  <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80
                  rounded-full bg-brand-terracotta/15 blur-3xl animate-orb-drift" />

  {/* Card glass do form */}
  <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
    <Card className="glass w-full max-w-sm shadow-gold">
      ...
    </Card>
  </div>
</div>
```

```css
@layer utilities {
  @keyframes orb-drift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(20px, -16px) scale(1.06); }
  }
  .animate-orb-drift      { animation: orb-drift 14s ease-in-out infinite; }
  .animate-orb-drift-slow { animation: orb-drift 22s ease-in-out infinite; }
}
```

**Performance:** 3 orbs com `blur-3xl` rodam em GPU (transform + opacity). Sem repintura. Mobile OK.

---

### 4.8 Focus rings animados

**Quando usar:** inputs, botões, links — qualquer alvo navegável por teclado.

**Quando NÃO usar:** áreas de leitura, cards não-interativos.

```css
@layer base {
  :focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px hsl(var(--ring));
    transition: box-shadow 160ms cubic-bezier(0, 0, 0.2, 1);
  }

  /* Input com focus animado */
  .input-focus-glow:focus-visible {
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px hsl(var(--brand-gold) / 0.6),
      0 4px 16px -4px hsl(var(--brand-gold) / 0.25);
  }
}
```

**Token:** `--ring` aponta para `--brand-gold` no light, mantém no dark. **Por quê gold e não ink?** preto sobre preto no dark some; gold funciona nos dois temas e amarra com a identidade do site.

---

### 4.9 Loading skeletons com shimmer

**Quando usar:** estados de loading de Kanban, lista de leads, dashboard.

**Quando NÃO usar:** banners, toasts (já têm spinner próprio).

```css
@layer utilities {
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      hsl(var(--neutral-200)) 0%,
      hsl(var(--neutral-100)) 50%,
      hsl(var(--neutral-200)) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
}
```

```tsx
// LeadCardSkeleton
<div className="rounded-md border border-border p-3 space-y-2">
  <div className="skeleton-shimmer h-4 w-2/3 rounded" />
  <div className="skeleton-shimmer h-3 w-1/2 rounded" />
  <div className="flex gap-2 pt-1">
    <div className="skeleton-shimmer h-5 w-16 rounded-full" />
    <div className="skeleton-shimmer h-5 w-12 rounded-full" />
  </div>
</div>
```

**Componente shadcn afetado:** `Skeleton` (override ou wrapper).

---

## 5. Matriz de contraste WCAG AA — combinações v4

Calculado via fórmula WCAG 2.1 (luminância relativa).

| Foreground | Background | Ratio | Resultado | Uso |
|---|---|---|---|---|
| `--brand-ink` `#141414` | `--brand-paper` `#FFFFFF` | **18.7:1** | ✅ AAA | Texto principal |
| `--brand-paper` `#FFFFFF` | `--brand-ink` `#141414` | **18.7:1** | ✅ AAA | Texto branco em CTA primary |
| `--brand-ink` `#141414` | `--brand-gold` `#E79501` | **7.7:1** | ✅ AAA | Texto preto sobre badge dourado |
| `--brand-paper` `#FFFFFF` | `--brand-gold` `#E79501` | **2.4:1** | ❌ FAIL | **Nunca usar branco sobre dourado** |
| `--brand-ink` `#141414` | `--brand-sage` `#869791` | **6.1:1** | ✅ AA | Texto preto sobre sage |
| `--brand-paper` `#FFFFFF` | `--brand-sage` `#869791` | **3.1:1** | ⚠️ UI only | OK para ícones/bordas (≥3:1), não para texto |
| `--brand-paper` `#FFFFFF` | `--brand-terracotta` `#CC4833` | **4.7:1** | ✅ AA | Texto branco em CTA terracota |
| `--brand-ink` `#141414` | `--brand-gold-light` `#FFF5E1` | **17.4:1** | ✅ AAA | Texto em badge dourado claro |
| `--brand-ink` `#141414` | `--brand-sage-light` `#EEF2F0` | **17.1:1** | ✅ AAA | Texto em chip sage claro |
| `--neutral-700` `#676767` | `--brand-paper` `#FFFFFF` | **5.7:1** | ✅ AA | Texto secundário/metadado |
| `--neutral-600` `#6C6A77` | `--brand-paper` `#FFFFFF` | **5.4:1** | ✅ AA | Texto descritivo |
| `--neutral-500` `#ADADAD` | `--brand-paper` `#FFFFFF` | **2.7:1** | ⚠️ UI only | Apenas placeholders/ícones desabilitados |
| `--action-success` `#15803D` | `--brand-paper` `#FFFFFF` | **5.6:1** | ✅ AA | Status ganho |
| `--action-warning` `#B45309` | `--brand-paper` `#FFFFFF` | **4.7:1** | ✅ AA | Tarefa vencendo |
| `--action-danger` `#CC4833` | `--brand-paper` `#FFFFFF` | **4.6:1** | ✅ AA | Erros |

### Dark mode

| Foreground | Background | Ratio | Resultado |
|---|---|---|---|
| `#F5F5F5` foreground | `#0F0F0F` background | **18.1:1** | ✅ AAA |
| `--brand-ink` em `--brand-gold` (primary no dark) | gold sobre ink | **7.7:1** | ✅ AAA |
| `--brand-gold` sobre `#1A1A1A` card | acento no dark | **6.9:1** | ✅ AA |

**Red lines:**
- ❌ Branco sobre dourado em qualquer cenário (badge "novo" usa **ink sobre gold**).
- ❌ Sage como background de texto longo (use sage-light para isso).
- ❌ Neutral-500 para texto informacional (só placeholders/desabilitados).

---

## 6. Estados completos por componente

Estados obrigatórios (toda tela documenta os 6):

| Estado | Visual v4 | Tokens-chave |
|---|---|---|
| **Default** | Surface limpa, sombra `shadow-sm` | `--card`, `--border` |
| **Hover** | `-translate-y-0.5`, sombra gold/sage tint, duração 150ms | `.shadow-gold`, `.shadow-sage` |
| **Focus** | Ring 2px gold com offset 2px, fade-in 160ms | `--brand-gold` |
| **Active / Pressed** | `scale-[0.98]`, sombra reduzida | — |
| **Disabled** | `opacity-50`, `pointer-events-none`, sem hover | — |
| **Loading** | Skeleton shimmer ou Spinner Lucide com `animate-spin` | `.skeleton-shimmer` |
| **Empty** | Ilustração SVG leve (sage outline) + CTA primary | `--brand-sage`, `--action-primary` |
| **Error** | Border `--action-danger`, mensagem `text-action-danger`, ícone `AlertTriangle` | `--action-danger` |
| **Success** | Toast `--action-success-light`, checkmark Lucide | `--action-success` |

### 6.1 Skeleton de KanbanCard (estado loading)

```
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                        │ ← shimmer h-4 w-2/3
│ ▓▓▓▓▓▓▓▓▓▓▓                             │ ← shimmer h-3 w-1/2
│                                         │
│ [▓▓▓▓▓] [▓▓▓]                           │ ← 2 badges shimmer
└─────────────────────────────────────────┘
```

### 6.2 Empty state do Pipeline (coluna sem deals)

```
┌─────────────────────────────────────────┐
│              ╭───────╮                  │
│              │  📋   │  ← ilustração   │
│              ╰───────╯     sage outline │
│                                         │
│        Nenhum deal em "Contato"         │
│        Arraste um card aqui ou          │
│        crie um novo lead.               │
│                                         │
│          [ + Criar lead ]               │ ← btn primary ink
└─────────────────────────────────────────┘
```

---

## 7. Animação tokens

| Token | Valor | Easing | Uso |
|---|---|---|---|
| `--duration-instant` | 100ms | ease-out | Toggle de switch, ícone swap |
| `--duration-fast` | 150ms | ease-out | Hover de botão, mudança de cor |
| `--duration-base` | 200ms | ease-in-out | Abertura de dropdown, badge swap |
| `--duration-slow` | 250ms | ease-in-out | **Limite duro** — sheet/drawer, fade-in stagger |
| `--easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | — | Default Tailwind |
| `--easing-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | — | Entrada/hover |
| `--easing-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | — | Saída/dismiss |
| `--easing-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | — | Cards drag-drop release |

**Red line:** v3 tinha `--duration-slower: 500ms`. **Removido em v4.** Em CRM (uso prolongado), 500ms cansa. Caps em 250ms.

---

## 8. Componentes shadcn/ui — afetados pelo v4

| Componente | Mudança v4 | Como aplicar |
|---|---|---|
| `Button` | `default` agora é ink, hover ganha `.shadow-ink-glow`, micro-tilt | Atualizar `buttonVariants` no `components/ui/button.tsx` |
| `Card` | Variant `glass`, `feature` (com gradiente sutil) | Adicionar variantes via `cva` |
| `Sheet` / `Drawer` | Backdrop com glassmorphism, slide 250ms | Override CSS no `sheetVariants` |
| `Dialog` | Backdrop `--neutral-overlay` mais escuro, card pode receber `.glass` | Override |
| `Input` | Focus ring gold animado | Adicionar `.input-focus-glow` |
| `Badge` | `brand-gold`, `brand-sage` como variantes; variant `feature` com ring-1 gold | Atualizar `badgeVariants` |
| `Skeleton` | Substituir `animate-pulse` por `.skeleton-shimmer` | Override em `components/ui/skeleton.tsx` |
| `Toast` (sonner) | Toaster com `theme="light"` default + variante `theme="dark"` quando tema dark ativo | Atualizar `Toaster` no `layout.tsx` |
| `Tooltip` | Background `--brand-ink`, text branco, fade 100ms | Override |
| `DropdownMenu` | Backdrop glass leve, item hover `bg-brand-sage-light` | Override |

---

## 9. tailwind.config.ts — deltas para v4

```typescript
// Apenas o que MUDA. O resto do v3 permanece (escala, espaçamento, breakpoints).
{
  theme: {
    extend: {
      colors: {
        brand: {
          ink:               '#141414',
          'ink-hover':       '#000000',
          paper:             '#FFFFFF',
          gold:              '#E79501',
          'gold-hover':      '#C97D00',
          'gold-light':      '#FFF5E1',
          sage:              '#869791',
          'sage-hover':      '#6F7F7B',
          'sage-light':      '#EEF2F0',
          terracotta:        '#CC4833',
          'terracotta-hover':'#A83A28',
          'terracotta-light':'#FBE5E0',
          // Aliases de compatibilidade com v3 (deprecated, remover em v4.1)
          forest:            '#141414',  // mapeia para ink p/ não quebrar
          500:               '#141414',  // bg-brand-500 → ink durante migração
        },
        action: {
          primary:       'hsl(var(--primary))',          // = ink no light
          'primary-hover':'hsl(var(--primary) / 0.92)',
          success:       '#15803D',
          warning:       '#B45309',
          danger:        '#CC4833',  // ← terracota substitui #B91C1C
          info:          '#0369A1',
        },
      },
      fontFamily: {
        sans: ['var(--font-hind)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'gold':       '0 4px 16px -4px rgb(231 149 1 / 0.18), 0 2px 6px -2px rgb(20 20 20 / 0.08)',
        'sage':       '0 4px 14px -4px rgb(134 151 145 / 0.22), 0 1px 3px -1px rgb(20 20 20 / 0.06)',
        'ink-glow':   '0 10px 24px -8px rgb(20 20 20 / 0.32), 0 4px 10px -4px rgb(20 20 20 / 0.18)',
        'terracotta': '0 4px 14px -4px rgb(204 72 51 / 0.22)',
      },
      transitionDuration: {
        instant: '100ms',
        fast:    '150ms',
        base:    '200ms',
        slow:    '250ms',  // ← cap reduzido de 300ms p/ 250ms
      },
      keyframes: {
        'orb-drift': {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '50%':      { transform: 'translate(20px,-16px) scale(1.06)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'orb-drift':      'orb-drift 14s ease-in-out infinite',
        'orb-drift-slow': 'orb-drift 22s ease-in-out infinite',
        shimmer:          'shimmer 1.4s ease-in-out infinite',
      },
    },
  },
}
```

---

## 10. Checklist de qualidade v4

- [x] Paleta literal extraída do site real (auditoria via Chrome DevTools MCP)
- [x] WCAG AA recalculado em 15 combinações novas
- [x] Tipografia Hind + Inter fallback + JetBrains Mono para KPI
- [x] 9 técnicas premium documentadas com snippets, quando usar e quando NÃO usar
- [x] Dark mode com swap inteligente (primary → gold no dark)
- [x] Cap de animação reduzido para 250ms (uso prolongado)
- [x] `prefers-reduced-motion` mantido (não muda do v3)
- [x] Compatibilidade com v3: alias `brand-forest → ink`, `bg-brand-500 → ink` durante migração
- [x] Estados completos documentados (default → loading → error)
- [x] Skeleton shimmer substitui `animate-pulse`
- [x] Tokens semânticos preservados (stages, canais não mudam)

---

*Design System v4 — Davi Designer | CRM Techmalhas | 2026-05-25*
