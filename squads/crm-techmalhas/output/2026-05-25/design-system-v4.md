# Design System v4 — CRM Techmalhas

> **Autor:** Davi Designer · **Data:** 2026-05-25 · **Status:** Proposto (aguarda ADR-009)
> **Substitui:** `output/2026-05-24-162435/v3/design-system.md`
> **Fonte da verdade da marca:** `brand-audit-techmalhas-site.md` (auditoria literal do site público)

---

## TL;DR — o que mudou de v3 → v4

- **Paleta realinhada ao site real.** Verde floresta `#1A6B3C` (assunção criativa do v3) sai; entram **preto `#141414` + dourado `#E79501` + sage `#869791` + branco puro `#FFFFFF`**, extraídos ao vivo de `techmalhas.com.br`.
- **Primary CTA agora é preto Techmalhas**, não azul `#1D4ED8`. O site real usa preto puro como ação dominante — o azul do v3 destoava da marca.
- **Tipografia migra de Inter → Hind** (mesma família do site). Inter permanece como fallback no stack `next/font` (zero esforço de remoção). `JetBrains Mono` entra apenas para números de KPI.
- **Camada premium SEM glassmorphism** (decisão da Tania, 2026-05-25): paridade visual cross-device é prioridade. Em vez de `backdrop-filter`, usamos **surfaces premium sólidas com sombras coloridas duplas, bordas em gradient sutil, inner highlight 3D e hover lift pronunciado**. Funciona idêntico em Chrome desktop, Safari iOS antigo, WebView in-app.
- **WCAG AA preservado e recalculado** em ambos os temas (light + dark — dark mode firmado dentro da v4, não adiado).

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
| Mono p/ KPIs | — | `JetBrains Mono` + glow gold no hover | ✨ novo |
| Glassmorphism | — | ❌ **rejeitado** (paridade cross-device) | — |
| Surface premium (sólida) | bg branco + shadow neutra | bg sólido + **sombra colorida dupla + border-gradient + inner highlight** | ✨ novo |
| Sombras coloridas | sombras pretas neutras | gold/sage tint 18–28%, dual-layer no hover | ✨ novo |
| Border-gradient sutil | — | 1px gold→sage em cards de destaque | ✨ novo |
| Hover lift pronunciado | translate -2px | translate -3px + sombra +40% | ✨ novo |
| Dark mode | rascunho (v3 não usado) | polido, **incluído na v4 desde o início** | 🔄 firmado |

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

## 4. 9 técnicas premium futuristas (sem glassmorphism)

> A camada futurista é **uma capa fina sobre o design system v3**, não um redesign visual. Cada técnica resolve um problema específico de hierarquia ou delight; nenhuma é decoração pura.
> **Decisão Tania 2026-05-25:** glassmorphism foi **rejeitado** por exigir fallback diferente em Safari < 17 e WebView in-app — quebra de paridade visual entre dispositivos. As técnicas abaixo entregam o mesmo "premium" usando apenas surfaces sólidas + sombras + gradientes + micro-interações, funcionando idêntico em 100% dos browsers atuais.

### 4.1 Surface premium sólida (substitui glassmorphism)

**Quando usar:** sidebar, header sticky, drawers de detalhe de lead, modais, cards de "destaque" no dashboard.

**Quando NÃO usar:** Kanban cards densos (`shadow-sm` neutra basta), inputs (não distrair).

```css
@layer utilities {
  .surface-premium {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    /* triple-layer:
       (1) inner highlight 1px → ilusão 3D leve
       (2) sombra sage tint média
       (3) sombra ink suave para definição */
    box-shadow:
      inset 0 1px 0 0 rgb(255 255 255 / 0.65),
      0 4px 14px -4px rgb(var(--glow-sage) / 0.20),
      0 1px 3px -1px rgb(var(--glow-ink) / 0.08);
  }
  .dark .surface-premium {
    /* inner highlight branca não funciona no dark — usar gold sutil */
    box-shadow:
      inset 0 1px 0 0 rgb(var(--glow-gold) / 0.12),
      0 4px 14px -4px rgb(0 0 0 / 0.45),
      0 1px 3px -1px rgb(0 0 0 / 0.30);
  }

  /* Surface premium "destaque" — para KPI card de receita, login card */
  .surface-premium-gold {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    box-shadow:
      inset 0 1px 0 0 rgb(255 255 255 / 0.70),
      0 6px 20px -6px rgb(var(--glow-gold) / 0.22),
      0 2px 6px -2px rgb(var(--glow-ink) / 0.10);
  }
  .dark .surface-premium-gold {
    box-shadow:
      inset 0 1px 0 0 rgb(var(--glow-gold) / 0.18),
      0 6px 20px -6px rgb(var(--glow-gold) / 0.18),
      0 2px 6px -2px rgb(0 0 0 / 0.40);
  }
}
```

**Tailwind utility:**

```tsx
<aside className="surface-premium border-r border-border/60">
<Card className="surface-premium-gold">
```

**Componente shadcn afetado:** `Sheet`, `Dialog`, `Sidebar` custom, `Card` (variant `premium`, `feature`).

**Paridade cross-device:** 100% — não depende de `backdrop-filter`, `mask-image` ou qualquer feature de browser moderno.

---

### 4.1b Border-gradient sutil (1px gold→sage)

**Quando usar:** cards de "destaque" do dashboard, hero card do login, banner de notificação importante.

**Quando NÃO usar:** todos os cards (perde hierarquia), inputs, botões pequenos.

```css
@layer utilities {
  .border-gradient-brand {
    /* dual background trick:
       - inner: cor do card via padding-box
       - outer: gradient via border-box (vira "borda colorida") */
    background:
      linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box,
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--brand-gold)  65%, transparent) 0%,
        color-mix(in srgb, var(--brand-sage)  50%, transparent) 100%
      ) border-box;
    border: 1px solid transparent;
  }
  /* Variante "destaque" — gold mais forte */
  .border-gradient-feature {
    background:
      linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box,
      linear-gradient(135deg, var(--brand-gold), var(--brand-sage)) border-box;
    border: 1.5px solid transparent;
  }
}
```

**Tailwind utility:**

```tsx
<Card className="border-gradient-brand surface-premium-gold rounded-xl">
```

**Componente shadcn afetado:** `Card` (variant `feature`), `Badge` (variant `feature-pill`).

**Compatibilidade:** `background-clip: padding-box/border-box` é suportado desde 2014 — funciona em 100% dos browsers do tráfego.

---

### 4.2 Micro-interações (hover scale, ripple sutil, fade)

**Quando usar:** botões, KanbanCard, itens de menu, ChannelBadge.

**Quando NÃO usar:** inputs (distrai durante digitação), texto de leitura.

```tsx
// Botão primary com sombra colorida dupla (gold-glow + ink-shadow)
<button className="
  btn-primary-premium
  bg-foreground text-background px-4 py-2 rounded-md font-semibold
  transition-all duration-150 ease-out
  hover:-translate-y-0.5
  active:translate-y-0 active:scale-[0.98]
  focus-visible:focus-ring-pulse
">
  Criar lead
</button>
```

```css
@layer utilities {
  .btn-primary-premium {
    box-shadow:
      0 4px 12px -4px rgb(var(--glow-gold) / 0.30),  /* halo dourado */
      0 2px 6px -2px rgb(var(--glow-ink) / 0.30);    /* base sólida */
  }
  .btn-primary-premium:hover {
    box-shadow:
      0 10px 24px -8px rgb(var(--glow-gold) / 0.40),
      0 4px 10px -4px rgb(var(--glow-ink) / 0.40);
  }
}
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

### 4.4 Sombras coloridas + hover lift pronunciado (gold/sage tint, 18–28%)

**Quando usar:** cards elevados em foco, botão primary em hover, KPI card de destaque, surface premium.

**Quando NÃO usar:** inputs (gera ruído visual), dividers.

> **Mudança vs primeira versão da v4:** intensidade subiu de 8–15% para **18–28%** porque sem glassmorphism precisamos compensar a sensação de "profundidade". Cada `.shadow-*-lift` é a versão hover (translate -3px + sombra maior) da sombra base.

```css
@layer utilities {
  /* ─── Base: card em repouso ──────────────────────── */
  .shadow-gold {
    box-shadow:
      0 4px 16px -4px rgb(var(--glow-gold) / 0.22),
      0 2px 6px -2px rgb(var(--glow-ink) / 0.10);
  }
  .shadow-sage {
    box-shadow:
      0 4px 14px -4px rgb(var(--glow-sage) / 0.24),
      0 1px 3px -1px rgb(var(--glow-ink) / 0.08);
  }
  .shadow-ink-glow {
    box-shadow:
      0 10px 24px -8px rgb(var(--glow-ink) / 0.32),
      0 4px 10px -4px rgb(var(--glow-ink) / 0.18);
  }
  .shadow-terracotta {
    box-shadow:
      0 4px 14px -4px rgb(var(--glow-terracotta) / 0.24);
  }

  /* ─── Hover lift: translate -3px + sombra +40% ────── */
  .shadow-gold-lift {
    transform: translateY(-3px);
    box-shadow:
      0 14px 32px -8px rgb(var(--glow-gold) / 0.28),
      0 6px 14px -6px rgb(var(--glow-ink) / 0.18);
  }
  .shadow-sage-lift {
    transform: translateY(-3px);
    box-shadow:
      0 14px 32px -8px rgb(var(--glow-sage) / 0.30),
      0 6px 14px -6px rgb(var(--glow-ink) / 0.16);
  }
  .shadow-ink-lift {
    transform: translateY(-2px);
    box-shadow:
      0 16px 36px -10px rgb(var(--glow-ink) / 0.45),
      0 8px 16px -6px rgb(var(--glow-ink) / 0.28);
  }
}

/* Aplicação padrão: */
/* .surface-premium { transition: transform 180ms, box-shadow 180ms; } */
/* .surface-premium:hover { @apply shadow-sage-lift; } */
```

**Componente shadcn afetado:** `Card` (todas as variantes), `Button` (hover), `Sheet` (drawer abre com sombra lift).

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

### 4.8 Focus rings animados (com pulse único ao focar)

**Quando usar:** inputs, botões, links — qualquer alvo navegável por teclado.

**Quando NÃO usar:** áreas de leitura, cards não-interativos.

> **Reforço v4:** o ring agora **pulsa 1× ao receber foco** (600ms), depois fica estável. É um "tap visual" que chama atenção sem ser distrativo (não pulsa continuamente).

```css
@layer base {
  :focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px hsl(var(--ring));
    animation: ring-pulse 600ms var(--easing-decelerate) 1;
    transition: box-shadow 160ms var(--easing-decelerate);
  }

  /* Input com focus glow gold + halo */
  .input-focus-glow:focus-visible {
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px rgb(var(--glow-gold) / 0.65),
      0 4px 16px -4px rgb(var(--glow-gold) / 0.30);
    animation: ring-pulse 600ms var(--easing-decelerate) 1;
  }
}

@keyframes ring-pulse {
  0% {
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px rgb(var(--glow-gold) / 0.90),
      0 0 18px 2px rgb(var(--glow-gold) / 0.45);
  }
  60% {
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 7px rgb(var(--glow-gold) / 0.30),
      0 0 12px 0   rgb(var(--glow-gold) / 0.20);
  }
  100% {
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px rgb(var(--glow-gold) / 0.65);
  }
}
```

**Token:** `--ring` aponta para `--brand-gold` no light, mantém no dark. **Por quê gold e não ink?** preto sobre preto no dark some; gold funciona nos dois temas e amarra com a identidade do site.

**Acessibilidade:** `prefers-reduced-motion` desliga o pulse — ring estático aparece direto.

---

### 4.9 Loading skeletons com shimmer dourado-sutil

**Quando usar:** estados de loading de Kanban, lista de leads, dashboard.

**Quando NÃO usar:** banners, toasts (já têm spinner próprio).

> **Reforço v4:** a "onda" do shimmer agora carrega **tom dourado sutil** no pico (em vez de cinza neutro). Comunica marca mesmo durante loading, sem virar pirotécnico.

```css
@layer utilities {
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      hsl(0 0% 94%) 0%,
      /* pico com 12% de gold misturado → dourado-sutil */
      color-mix(in srgb, hsl(0 0% 97%) 88%, var(--brand-gold)) 50%,
      hsl(0 0% 94%) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 0.375rem;
  }
  .dark .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      hsl(0 0% 14%) 0%,
      color-mix(in srgb, hsl(0 0% 18%) 82%, var(--brand-gold)) 50%,
      hsl(0 0% 14%) 100%
    );
    background-size: 200% 100%;
  }
}
```

```tsx
// LeadCardSkeleton — usa surface-premium para coerência
<div className="surface-premium p-3 space-y-2 rounded-md">
  <div className="skeleton-shimmer h-4 w-2/3" />
  <div className="skeleton-shimmer h-3 w-1/2" />
  <div className="flex gap-2 pt-1">
    <div className="skeleton-shimmer h-5 w-16 rounded-full" />
    <div className="skeleton-shimmer h-5 w-12 rounded-full" />
  </div>
</div>
```

**Componente shadcn afetado:** `Skeleton` (override wrapper aplica `.skeleton-shimmer`).

---

### 4.10 KPI numbers com glow gold no hover

**Quando usar:** valores numéricos de destaque no Dashboard (R$, %, contadores grandes).

**Quando NÃO usar:** corpo de texto, números de timestamps, qualquer texto longo.

```css
@layer utilities {
  .font-kpi {
    font-family: var(--font-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1;
    transition: text-shadow 220ms var(--easing-decelerate);
  }
  /* Aplicar no parent card (group-hover) */
  .group:hover .font-kpi-glow,
  .font-kpi-glow:hover {
    text-shadow:
      0 0 18px rgb(var(--glow-gold) / 0.40),
      0 0 2px  rgb(var(--glow-gold) / 0.22);
  }
}
```

```tsx
<Card className="surface-premium group transition-all hover:shadow-gold-lift">
  <span className="font-kpi font-kpi-glow text-3xl font-semibold">R$ 67.5k</span>
</Card>
```

**Componente shadcn afetado:** `KPICard` custom.

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

### Dark mode (firmado na v4 — não adiado)

Tema escuro foi recalculado para todos os pares críticos. Background base: `#0F0F0F`; card surface: `#1A1A1A`; primary swap: gold `#E79501` (ink sobre ink no dark some).

| Foreground | Background | Ratio | Resultado | Uso |
|---|---|---|---|---|
| `#F5F5F5` foreground | `#0F0F0F` background | **18.1:1** | ✅ AAA | Texto principal dark |
| `#F5F5F5` | `#1A1A1A` card | **15.4:1** | ✅ AAA | Texto em card |
| `--brand-ink` `#141414` | `--brand-gold` `#E79501` (primary dark) | **7.7:1** | ✅ AAA | Texto preto em CTA gold |
| `--brand-gold` `#E79501` | `#1A1A1A` card | **6.9:1** | ✅ AA | Acento gold em surface |
| `--brand-gold` `#E79501` | `#0F0F0F` bg | **7.5:1** | ✅ AA | Acento em bg |
| `--brand-sage` `#869791` | `#1A1A1A` | **4.9:1** | ✅ AA | Metadados/labels dark |
| `--brand-paper` `#FFFFFF` | `--brand-terracotta` `#CC4833` | **4.7:1** | ✅ AA | Botão danger dark |
| muted-foreground `#A6A6A6` | `#0F0F0F` bg | **9.8:1** | ✅ AAA | Texto descritivo dark |
| Ring gold no dark `#E79501` | sobre card `#1A1A1A` | UI ≥ **3:1** ✅ | ✅ | Focus ring visível |

**Red lines dark mode:**
- ❌ Ink sobre ink (primary swap obrigatório para gold)
- ❌ Sage como background de texto longo (mesmo que no light)
- ❌ Border `--border` `#2E2E2E` para divisores críticos — usar `#3A3A3A` quando precisar destacar

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
| `Button` | `default` agora é ink, **sombra dupla** (gold-glow + ink-shadow) no repouso, hover ganha lift -2px + sombra +40% | Atualizar `buttonVariants` no `components/ui/button.tsx` |
| `Card` | Variants `premium` (`.surface-premium`), `feature` (`.surface-premium-gold` + `.border-gradient-feature`), `elevated` (`.shadow-sage` → `.shadow-sage-lift` no hover) | Adicionar variantes via `cva` |
| `Sheet` / `Drawer` | **`.surface-premium` sólida** (sem backdrop-filter), slide 250ms, overlay `--neutral-overlay` mais escuro | Override CSS no `sheetVariants` |
| `Dialog` | Backdrop `--neutral-overlay`, card `.surface-premium-gold` | Override |
| `Input` | Focus ring gold animado com **pulse 1× ao focar** (`.input-focus-glow`) | Adicionar `.input-focus-glow` |
| `Badge` | `brand-gold`, `brand-sage` como variantes; variant `feature-pill` com `.border-gradient-feature` | Atualizar `badgeVariants` |
| `Skeleton` | `.skeleton-shimmer` com **tint dourado-sutil** (substitui `animate-pulse`) | Override em `components/ui/skeleton.tsx` |
| `Toast` (sonner) | `next-themes` injeta `theme="dark"` automaticamente quando dark ativo | Atualizar `Toaster` no `layout.tsx` |
| `Tooltip` | Background `--brand-ink`, text branco, fade 100ms | Override |
| `DropdownMenu` | **Surface sólida `--popover`** com `.surface-premium`; item hover `bg-secondary` | Override |
| `Sidebar` (custom) | `.surface-premium` + border-r 1px; item ativo `bg-foreground` + dot dourado | Refactor componente |

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
        // Base (repouso)
        'gold':       '0 4px 16px -4px rgb(231 149 1 / 0.22), 0 2px 6px -2px rgb(20 20 20 / 0.10)',
        'sage':       '0 4px 14px -4px rgb(134 151 145 / 0.24), 0 1px 3px -1px rgb(20 20 20 / 0.08)',
        'ink-glow':   '0 10px 24px -8px rgb(20 20 20 / 0.32), 0 4px 10px -4px rgb(20 20 20 / 0.18)',
        'terracotta': '0 4px 14px -4px rgb(204 72 51 / 0.24)',
        // Lift (hover)
        'gold-lift':  '0 14px 32px -8px rgb(231 149 1 / 0.28), 0 6px 14px -6px rgb(20 20 20 / 0.18)',
        'sage-lift':  '0 14px 32px -8px rgb(134 151 145 / 0.30), 0 6px 14px -6px rgb(20 20 20 / 0.16)',
        'ink-lift':   '0 16px 36px -10px rgb(20 20 20 / 0.45), 0 8px 16px -6px rgb(20 20 20 / 0.28)',
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
        'pulse-sage': {
          '0%, 100%': { transform: 'scale(1)',    opacity: '1'   },
          '50%':      { transform: 'scale(1.15)', opacity: '0.7' },
        },
        'ring-pulse': {
          '0%':   { boxShadow: '0 0 0 2px hsl(var(--background)), 0 0 0 4px rgb(231 149 1 / 0.90), 0 0 18px 2px rgb(231 149 1 / 0.45)' },
          '60%':  { boxShadow: '0 0 0 2px hsl(var(--background)), 0 0 0 7px rgb(231 149 1 / 0.30), 0 0 12px 0 rgb(231 149 1 / 0.20)' },
          '100%': { boxShadow: '0 0 0 2px hsl(var(--background)), 0 0 0 4px rgb(231 149 1 / 0.65)' },
        },
      },
      animation: {
        'orb-drift':      'orb-drift 14s ease-in-out infinite',
        'orb-drift-slow': 'orb-drift 22s ease-in-out infinite',
        shimmer:          'shimmer 1.6s ease-in-out infinite',
        'pulse-sage':     'pulse-sage 1.6s ease-in-out infinite',
        'ring-pulse':     'ring-pulse 600ms cubic-bezier(0,0,0.2,1) 1',
      },
    },
  },
}
```

---

## 10. Checklist de qualidade v4

- [x] Paleta literal extraída do site real (auditoria via Chrome DevTools MCP)
- [x] WCAG AA recalculado em 15 combinações light + 9 dark
- [x] Tipografia Hind + Inter fallback + JetBrains Mono para KPI
- [x] **Glassmorphism REJEITADO** (decisão Tania) — substituído por `.surface-premium` sólida + `.border-gradient-brand` + hover lift
- [x] 10 técnicas premium documentadas com snippets, quando usar e quando NÃO usar
- [x] **Dark mode firmado dentro da v4** (não opcional, não adiado) — swap inteligente primary → gold
- [x] Cap de animação reduzido para 250ms (uso prolongado); ring-pulse é exceção pontual (600ms, 1×)
- [x] `prefers-reduced-motion` mantido (não muda do v3) + cobre `.ring-pulse`, orbs, shimmer
- [x] Compatibilidade com v3: alias `brand-forest → ink`, `bg-brand-500 → ink` durante migração
- [x] Estados completos documentados (default → loading → error)
- [x] Skeleton shimmer com tint dourado-sutil (substitui `animate-pulse`)
- [x] Tokens semânticos preservados (stages, canais não mudam)
- [x] Paridade cross-device 100% — funciona idêntico em Chrome desktop, Safari iOS antigo, WebView in-app

---

*Design System v4 — Davi Designer | CRM Techmalhas | 2026-05-25*
