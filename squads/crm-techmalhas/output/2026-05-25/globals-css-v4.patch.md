# Patch CSS v4 — `crm-app/app/globals.css`

> **Autor:** Davi Designer · **Data:** 2026-05-25
> **Target:** Fábio Fullstack (aplicar via `StrReplace` ou substituir arquivo inteiro)
> **Companion:** `design-system-v4.md` (justificativas) · `migration-plan-v4.md` (ordem de aplicação)

---

## Resumo das mudanças

| Bloco | Mudança |
|---|---|
| `:root` (light) | Tokens reescritos: ink/paper/gold/sage/terracota substituem verde floresta |
| `.dark` | Refinado: primary swap para gold (preto sobre preto não funciona) |
| `@layer base` | Fonts atualizadas (Hind primary, mono p/ KPI), focus-visible animado |
| `@layer components` | **REMOVIDO** — migrar para `@layer utilities` |
| `@layer utilities` (novo) | `.glass`, `.shadow-gold`, `.bg-hero-mesh`, `.skeleton-shimmer`, etc. |
| Scrollbar | Tons sage no thumb (era verde) |

---

## Arquivo completo após patch (substituir 100%)

> Fábio: a maneira mais segura é **substituir o arquivo inteiro** (são apenas 75 linhas no atual). Se quiser usar `StrReplace`, ver seção "Diffs cirúrgicos" abaixo.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* =================================================================
   CRM Techmalhas — globals.css v4
   Paleta literal do site (preto/branco/dourado/sage/terracota)
   + camada premium futurista (glass, shadows coloridas, mesh, shimmer)
   ================================================================= */

@layer base {
  :root {
    /* ─── shadcn tokens (HSL sem function — Tailwind v4 espera "H S% L%") ───────── */
    --background:           0 0% 100%;        /* #FFFFFF brand-paper */
    --foreground:           0 0% 8%;          /* #141414 brand-ink */

    --card:                 0 0% 100%;
    --card-foreground:      0 0% 8%;

    --popover:              0 0% 100%;
    --popover-foreground:   0 0% 8%;

    /* Primary = brand-ink (era brand-forest verde) */
    --primary:              0 0% 8%;          /* #141414 */
    --primary-foreground:   0 0% 100%;

    /* Secondary = sage muted (era verde claro) */
    --secondary:            150 13% 95%;      /* #EEF2F0 sage-light */
    --secondary-foreground: 0 0% 8%;

    --muted:                0 0% 97%;         /* #F7F7F7 neutral-200 */
    --muted-foreground:     0 0% 40%;         /* #676767 neutral-700 */

    /* Accent = brand-gold (era caramelo) */
    --accent:               39 99% 46%;       /* #E79501 */
    --accent-foreground:    0 0% 8%;          /* ink sobre gold (AAA 7.7:1) */

    /* Destructive = terracota (era vermelho B91C1C) */
    --destructive:          8 60% 50%;        /* #CC4833 */
    --destructive-foreground: 0 0% 100%;

    --border:               0 0% 90%;         /* sutil */
    --input:                0 0% 84%;         /* #D6D6D6 neutral-400 */

    /* Focus ring em gold (funciona light + dark, amarra com marca) */
    --ring:                 39 99% 46%;       /* #E79501 */

    --radius:               0.5rem;

    /* ─── Tokens de marca (não-HSL, para uso direto) ─────────────────────────── */
    --brand-ink:               #141414;
    --brand-ink-hover:         #000000;
    --brand-paper:             #FFFFFF;
    --brand-gold:              #E79501;
    --brand-gold-hover:        #C97D00;
    --brand-gold-light:        #FFF5E1;
    --brand-sage:              #869791;
    --brand-sage-hover:        #6F7F7B;
    --brand-sage-light:        #EEF2F0;
    --brand-terracotta:        #CC4833;
    --brand-terracotta-hover:  #A83A28;
    --brand-terracotta-light:  #FBE5E0;

    /* ─── Glows coloridos (rgba — não passa por HSL) ─────────────────────────── */
    --glow-ink:        20 20 20;              /* usar com /0.32 etc. */
    --glow-gold:       231 149 1;
    --glow-sage:       134 151 145;
    --glow-terracotta: 204 72 51;

    /* ─── Overlay de modal (mais escuro que v3) ──────────────────────────────── */
    --neutral-overlay: rgba(20, 20, 20, 0.55);

    /* ─── Durations (cap 250ms em v4) ────────────────────────────────────────── */
    --duration-instant: 100ms;
    --duration-fast:    150ms;
    --duration-base:    200ms;
    --duration-slow:    250ms;

    --easing-standard:   cubic-bezier(0.4, 0, 0.2, 1);
    --easing-decelerate: cubic-bezier(0,   0, 0.2, 1);
    --easing-accelerate: cubic-bezier(0.4, 0, 1,   1);
    --easing-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .dark {
    /* Backgrounds: ink mais profundo → off-ink → surface elevada */
    --background:           0 0% 6%;          /* #0F0F0F */
    --foreground:           0 0% 96%;

    --card:                 0 0% 10%;         /* #1A1A1A */
    --card-foreground:      0 0% 96%;

    --popover:              0 0% 9%;
    --popover-foreground:   0 0% 96%;

    /* Primary swap: gold no dark (ink sobre ink some) */
    --primary:              39 99% 52%;
    --primary-foreground:   0 0% 8%;          /* ink sobre gold */

    --secondary:            0 0% 14%;
    --secondary-foreground: 0 0% 92%;

    --muted:                0 0% 14%;
    --muted-foreground:     0 0% 65%;

    --accent:               39 99% 52%;
    --accent-foreground:    0 0% 8%;

    --destructive:          8 70% 55%;
    --destructive-foreground: 0 0% 100%;

    --border:               0 0% 18%;
    --input:                0 0% 18%;
    --ring:                 39 99% 52%;

    --neutral-overlay: rgba(0, 0, 0, 0.65);
  }
}

/* =================================================================
   BASE STYLES
   ================================================================= */
@layer base {
  * {
    @apply border-border;
    box-sizing: border-box;
  }

  html {
    @apply scroll-smooth;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-family:
      var(--font-hind), var(--font-inter),
      -apple-system, BlinkMacSystemFont,
      'Segoe UI', Roboto, sans-serif;
    font-feature-settings: 'rlig' 1, 'calt' 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Focus ring global — animado, gold */
  :focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px hsl(var(--ring));
    transition: box-shadow 160ms var(--easing-decelerate);
    border-radius: inherit;
  }

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold tracking-tight;
  }

  /* Scrollbar customizada (sage tones, não mais verde floresta) */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--brand-sage);
  }

  /* Manter scrollbar fina do Kanban (compat com v3) */
  .kanban-scroll::-webkit-scrollbar { height: 6px; }
  .kanban-scroll::-webkit-scrollbar-track { background: transparent; }
  .kanban-scroll::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 9999px;
  }
}

/* =================================================================
   UTILITIES — premium futurista (glass, shadows, shimmer, gradients)
   ================================================================= */
@layer utilities {

  /* ─── 1. Glassmorphism ───────────────────────────────────────── */
  .glass {
    background: color-mix(in srgb, hsl(var(--card)) 78%, transparent);
    backdrop-filter: blur(16px) saturate(140%);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    border: 1px solid color-mix(in srgb, hsl(var(--border)) 60%, transparent);
  }
  .glass-strong {
    background: color-mix(in srgb, hsl(var(--card)) 60%, transparent);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
  }
  /* Fallback para browsers sem backdrop-filter */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .glass, .glass-strong {
      background: hsl(var(--card) / 0.95);
    }
  }

  /* ─── 2. Sombras coloridas ───────────────────────────────────── */
  .shadow-gold {
    box-shadow:
      0 4px 16px -4px rgb(var(--glow-gold) / 0.18),
      0 2px 6px -2px rgb(var(--glow-ink) / 0.08);
  }
  .shadow-sage {
    box-shadow:
      0 4px 14px -4px rgb(var(--glow-sage) / 0.22),
      0 1px 3px -1px rgb(var(--glow-ink) / 0.06);
  }
  .shadow-ink-glow {
    box-shadow:
      0 10px 24px -8px rgb(var(--glow-ink) / 0.32),
      0 4px 10px -4px rgb(var(--glow-ink) / 0.18);
  }
  .shadow-terracotta {
    box-shadow:
      0 4px 14px -4px rgb(var(--glow-terracotta) / 0.22);
  }

  /* ─── 3. Mesh gradient & gradientes sutis ─────────────────────── */
  .bg-hero-mesh {
    background:
      radial-gradient(ellipse 80% 60% at 20% 20%, rgb(var(--glow-gold) / 0.10), transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 70%, rgb(var(--glow-sage) / 0.14), transparent 65%),
      radial-gradient(ellipse 70% 60% at 50% 110%, rgb(var(--glow-terracotta) / 0.08), transparent 60%),
      hsl(var(--background));
  }
  .bg-header-gradient {
    background: linear-gradient(180deg,
      hsl(var(--background)) 0%,
      color-mix(in srgb, hsl(var(--background)) 98%, var(--brand-sage)) 100%);
  }
  .bg-kpi-feature {
    background: linear-gradient(135deg,
      hsl(var(--card)) 0%,
      color-mix(in srgb, hsl(var(--card)) 97%, var(--brand-gold)) 100%);
  }

  /* ─── 4. Focus glow (variante gold para inputs) ──────────────── */
  .input-focus-glow:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px rgb(var(--glow-gold) / 0.6),
      0 4px 16px -4px rgb(var(--glow-gold) / 0.25);
  }

  /* ─── 5. Skeleton shimmer (substitui animate-pulse) ──────────── */
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      hsl(0 0% 94%) 0%,
      hsl(0 0% 98%) 50%,
      hsl(0 0% 94%) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
    border-radius: 0.375rem;
  }
  .dark .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      hsl(0 0% 14%) 0%,
      hsl(0 0% 18%) 50%,
      hsl(0 0% 14%) 100%
    );
    background-size: 200% 100%;
  }

  /* ─── 6. Orb drift (login background) ────────────────────────── */
  .animate-orb-drift {
    animation: orb-drift 14s ease-in-out infinite;
    will-change: transform;
  }
  .animate-orb-drift-slow {
    animation: orb-drift 22s ease-in-out infinite;
    will-change: transform;
  }

  /* ─── 7. Presence pulse (dot online no Chat) ─────────────────── */
  .animate-pulse-sage {
    animation: pulse-sage 1.6s ease-in-out infinite;
  }

  /* ─── 8. Font helpers ────────────────────────────────────────── */
  .font-kpi {
    font-family: var(--font-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1;
  }

  /* ─── 9. Modal overlay refinado ──────────────────────────────── */
  .modal-overlay {
    background-color: var(--neutral-overlay);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
}

/* =================================================================
   KEYFRAMES (não vão em @layer pra evitar interferência com Tailwind)
   ================================================================= */
@keyframes orb-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(20px, -16px) scale(1.06); }
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes pulse-sage {
  0%, 100% { transform: scale(1);    opacity: 1;   }
  50%      { transform: scale(1.15); opacity: 0.7; }
}

/* =================================================================
   ACESSIBILIDADE — prefers-reduced-motion
   ================================================================= */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .animate-orb-drift,
  .animate-orb-drift-slow,
  .animate-pulse-sage,
  .skeleton-shimmer {
    animation: none !important;
  }
}

/* =================================================================
   PRINT
   ================================================================= */
@media print {
  body {
    background: #FFFFFF;
    color: #000000;
  }
  .no-print { display: none !important; }
  .glass, .glass-strong {
    background: #FFFFFF !important;
    backdrop-filter: none !important;
  }
}
```

---

## Diffs cirúrgicos (alternativa via `StrReplace`)

Se preferir aplicar incremental, aqui estão os patches isolados.

### Patch 1 — Substituir bloco `:root` inteiro

**`old_string`:**

```css
  :root {
    /* ─── Techmalhas Brand Verde ───────────────── */
    --background:   0 0% 100%;
    --foreground:   152 60% 10%;     /* verde muito escuro */

    --card:         0 0% 100%;
    --card-foreground: 152 60% 10%;

    --popover:      0 0% 100%;
    --popover-foreground: 152 60% 10%;

    /* Primary = brand-forest (#1A6B3C) — login e CTAs principais */
    --primary:      147 61% 26%;
    --primary-foreground: 0 0% 100%;

    /* Secondary = verde claro */
    --secondary:    152 44% 93%;
    --secondary-foreground: 152 60% 15%;

    --muted:        152 10% 95%;
    --muted-foreground: 152 10% 45%;

    --accent:       30 63% 49%;      /* Caramelo #C97A2F */
    --accent-foreground: 0 0% 100%;

    --destructive:  0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border:       152 15% 88%;
    --input:        152 15% 88%;
    --ring:         152 60% 30%;     /* brand verde para focus rings */

    --radius: 0.5rem;
  }
```

**`new_string`:** (copiar bloco `:root` da seção "Arquivo completo" acima)

### Patch 2 — Substituir bloco `.dark`

**`old_string`:**

```css
  .dark {
    --background:   152 30% 6%;
    --foreground:   152 5% 95%;
    --card:         152 25% 9%;
    --card-foreground: 152 5% 95%;
    --popover:      152 25% 9%;
    --popover-foreground: 152 5% 95%;
    --primary:      147 50% 42%;
    --primary-foreground: 0 0% 100%;
    --secondary:    152 20% 15%;
    --secondary-foreground: 152 5% 80%;
    --muted:        152 15% 15%;
    --muted-foreground: 152 10% 60%;
    --accent:       30 55% 55%;
    --accent-foreground: 0 0% 100%;
    --destructive:  0 70% 50%;
    --destructive-foreground: 0 0% 100%;
    --border:       152 15% 20%;
    --input:        152 15% 20%;
    --ring:         152 40% 50%;
  }
```

**`new_string`:** (copiar bloco `.dark` da seção "Arquivo completo" acima)

### Patch 3 — Substituir base block + adicionar utilities/keyframes

**`old_string`:**

```css
@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* Scrollbar fina (Kanban) */
  .kanban-scroll::-webkit-scrollbar { height: 6px; }
  .kanban-scroll::-webkit-scrollbar-track { @apply bg-transparent; }
  .kanban-scroll::-webkit-scrollbar-thumb { @apply bg-border rounded-full; }
}
```

**`new_string`:** (copiar do segundo `@layer base` em diante + `@layer utilities` + keyframes da seção "Arquivo completo")

---

## Tailwind config — deltas obrigatórios

Não é parte deste patch CSS, mas o `tailwind.config.ts` precisa receber, na mesma migração:

```typescript
// Adicionar dentro de theme.extend.colors.brand:
brand: {
  // Manter os v3 antigos como alias (para não quebrar bg-brand-500, bg-brand-100):
  DEFAULT:           '#141414',           // ← era '#1A6B3C'
  50:                '#F7F7F7',           // sage-tinted neutral
  100:               '#EEF2F0',           // sage-light
  200:               '#D6D6D6',
  300:               '#ADADAD',
  400:               '#869791',           // sage muted
  500:               '#141414',           // ← PRIMARY agora é ink (era forest)
  600:               '#0D0D0D',
  700:               '#000000',
  800:               '#000000',
  900:               '#000000',
  foreground:        '#FFFFFF',

  // Novos tokens semânticos da marca
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

  // Deprecated alias (manter durante migração, remover em v4.1):
  forest:            '#141414',
  'forest-dark':     '#000000',
  'forest-light':    '#EEF2F0',
},

// theme.extend.fontFamily:
fontFamily: {
  sans: ['var(--font-hind)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-mono)', 'JetBrains Mono', 'IBM Plex Mono', 'monospace'],
},

// theme.extend.boxShadow:
boxShadow: {
  'gold':       '0 4px 16px -4px rgb(231 149 1 / 0.18), 0 2px 6px -2px rgb(20 20 20 / 0.08)',
  'sage':       '0 4px 14px -4px rgb(134 151 145 / 0.22), 0 1px 3px -1px rgb(20 20 20 / 0.06)',
  'ink-glow':   '0 10px 24px -8px rgb(20 20 20 / 0.32), 0 4px 10px -4px rgb(20 20 20 / 0.18)',
  'terracotta': '0 4px 14px -4px rgb(204 72 51 / 0.22)',
},

// theme.extend.keyframes (somar aos existentes):
keyframes: {
  // ... manter accordion-down/up ...
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
},

// theme.extend.animation:
animation: {
  // ... manter accordion ...
  'orb-drift':      'orb-drift 14s ease-in-out infinite',
  'orb-drift-slow': 'orb-drift 22s ease-in-out infinite',
  shimmer:          'shimmer 1.4s ease-in-out infinite',
  'pulse-sage':     'pulse-sage 1.6s ease-in-out infinite',
},
```

---

## Compatibilidade com código existente

Os seguintes selectors aparecem hoje no código (`crm-app/`) e **continuam funcionando** após o patch graças aos aliases:

| Selector usado hoje | Antes (v3) | Depois (v4) | Quebra? |
|---|---|---|---|
| `bg-brand-500` | verde `#1A6B3C` | preto `#141414` | ✅ Não quebra (alias) — só muda cor |
| `text-brand-500` | verde | preto | ✅ Não quebra |
| `bg-secondary` | verde claro | sage-light | ✅ Não quebra |
| `text-primary` | hsl primary | hsl primary | ✅ Não quebra (var) |
| `bg-brand` (DEFAULT) | verde | preto | ✅ Não quebra |
| `bg-accent` | caramelo | gold | ✅ Não quebra |
| `kanban-scroll::-webkit-scrollbar-thumb` | `bg-border` | `bg-border` | ✅ Mantido |

**Resultado:** Fábio pode fazer o patch do `globals.css` + `tailwind.config.ts` sem tocar em nenhum componente React. O app inteiro re-renderiza com a nova paleta. Os refinos componente-a-componente (variant `brand` no Button, glass na Sidebar, etc.) entram em commits separados — ver `migration-plan-v4.md`.

---

*Patch CSS v4 — Davi Designer | 2026-05-25*
