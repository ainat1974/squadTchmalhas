# Patch CSS v4 — `crm-app/app/globals.css`

> **Autor:** Davi Designer · **Data:** 2026-05-25 (rev. pós-decisão Tania)
> **Target:** Fábio Fullstack (aplicar via `StrReplace` ou substituir arquivo inteiro)
> **Companion:** `design-system-v4.md` (justificativas) · `migration-plan-v4.md` (ordem de aplicação)
> **Mudança crítica:** glassmorphism REMOVIDO (paridade cross-device). Substituído por `.surface-premium` sólida + `.border-gradient-brand` + hover lift pronunciado.

---

## Resumo das mudanças

| Bloco | Mudança |
|---|---|
| `:root` (light) | Tokens reescritos: ink/paper/gold/sage/terracota substituem verde floresta |
| `.dark` | Refinado: primary swap para gold; inner-highlight via gold sutil |
| `@layer base` | Fonts atualizadas (Hind primary, mono p/ KPI), focus-visible com **ring-pulse animado** |
| `@layer utilities` | **`.surface-premium`**, **`.surface-premium-gold`**, **`.border-gradient-brand`**, `.shadow-*` (base) + `.shadow-*-lift` (hover), `.skeleton-shimmer` (com tint gold), `.bg-hero-mesh`, `.font-kpi` + `.font-kpi-glow`, `.btn-primary-premium`, `.animate-orb-drift`, `.animate-pulse-sage` |
| Glass | ❌ **TUDO removido**: `.glass`, `.glass-strong`, `@supports not(backdrop-filter)` fallback |
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
   + camada premium SEM glassmorphism (paridade cross-device)
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

    --muted:                0 0% 97%;
    --muted-foreground:     0 0% 40%;

    /* Accent = brand-gold (era caramelo) */
    --accent:               39 99% 46%;       /* #E79501 */
    --accent-foreground:    0 0% 8%;

    /* Destructive = terracota (era vermelho B91C1C) */
    --destructive:          8 60% 50%;        /* #CC4833 */
    --destructive-foreground: 0 0% 100%;

    --border:               0 0% 90%;
    --input:                0 0% 84%;
    --ring:                 39 99% 46%;       /* gold ring */

    --radius:               0.5rem;

    /* ─── Tokens de marca (não-HSL) ──────────────────────────────────────────── */
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
    --glow-ink:        20 20 20;
    --glow-gold:       231 149 1;
    --glow-sage:       134 151 145;
    --glow-terracotta: 204 72 51;

    /* ─── Overlay de modal (sem glass, mais escuro) ──────────────────────────── */
    --neutral-overlay: rgba(20, 20, 20, 0.60);

    /* ─── Durations (cap 250ms; ring-pulse é exceção pontual 600ms 1×) ───────── */
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
    --background:           0 0% 6%;          /* #0F0F0F */
    --foreground:           0 0% 96%;

    --card:                 0 0% 10%;         /* #1A1A1A */
    --card-foreground:      0 0% 96%;

    --popover:              0 0% 9%;
    --popover-foreground:   0 0% 96%;

    /* Primary swap: gold no dark (ink sobre ink some) */
    --primary:              39 99% 52%;
    --primary-foreground:   0 0% 8%;

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

    --neutral-overlay: rgba(0, 0, 0, 0.70);
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

  /* Focus ring global — animado com pulse único (1×, 600ms) */
  :focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px hsl(var(--ring));
    animation: ring-pulse 600ms var(--easing-decelerate) 1;
    border-radius: inherit;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold tracking-tight;
  }

  /* Scrollbar customizada (sage tones) */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--brand-sage); }

  .kanban-scroll::-webkit-scrollbar { height: 6px; }
  .kanban-scroll::-webkit-scrollbar-track { background: transparent; }
  .kanban-scroll::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 9999px;
  }
}

/* =================================================================
   UTILITIES — premium SEM glassmorphism (paridade cross-device)
   ================================================================= */
@layer utilities {

  /* ─── 1. Surfaces premium sólidas (substitui glass) ──────────── */
  .surface-premium {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    box-shadow:
      inset 0 1px 0 0 rgb(255 255 255 / 0.65),
      0 4px 14px -4px rgb(var(--glow-sage) / 0.20),
      0 1px 3px -1px rgb(var(--glow-ink) / 0.08);
    transition: transform 180ms var(--easing-decelerate),
                box-shadow 180ms var(--easing-decelerate);
  }
  .dark .surface-premium {
    box-shadow:
      inset 0 1px 0 0 rgb(var(--glow-gold) / 0.12),
      0 4px 14px -4px rgb(0 0 0 / 0.45),
      0 1px 3px -1px rgb(0 0 0 / 0.30);
  }

  .surface-premium-gold {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    box-shadow:
      inset 0 1px 0 0 rgb(255 255 255 / 0.70),
      0 6px 20px -6px rgb(var(--glow-gold) / 0.22),
      0 2px 6px -2px rgb(var(--glow-ink) / 0.10);
    transition: transform 180ms var(--easing-decelerate),
                box-shadow 180ms var(--easing-decelerate);
  }
  .dark .surface-premium-gold {
    box-shadow:
      inset 0 1px 0 0 rgb(var(--glow-gold) / 0.18),
      0 6px 20px -6px rgb(var(--glow-gold) / 0.18),
      0 2px 6px -2px rgb(0 0 0 / 0.40);
  }

  /* ─── 2. Bordas com gradient sutil (gold→sage) ───────────────── */
  .border-gradient-brand {
    background:
      linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box,
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--brand-gold) 65%, transparent) 0%,
        color-mix(in srgb, var(--brand-sage) 50%, transparent) 100%
      ) border-box;
    border: 1px solid transparent;
  }
  .border-gradient-feature {
    background:
      linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box,
      linear-gradient(135deg, var(--brand-gold), var(--brand-sage)) border-box;
    border: 1.5px solid transparent;
  }

  /* ─── 3. Sombras coloridas — base (repouso) ──────────────────── */
  .shadow-gold {
    box-shadow:
      0 4px 16px -4px rgb(var(--glow-gold) / 0.22),
      0 2px 6px  -2px rgb(var(--glow-ink)  / 0.10);
  }
  .shadow-sage {
    box-shadow:
      0 4px 14px -4px rgb(var(--glow-sage) / 0.24),
      0 1px 3px  -1px rgb(var(--glow-ink)  / 0.08);
  }
  .shadow-ink-glow {
    box-shadow:
      0 10px 24px -8px rgb(var(--glow-ink) / 0.32),
      0 4px  10px -4px rgb(var(--glow-ink) / 0.18);
  }
  .shadow-terracotta {
    box-shadow:
      0 4px 14px -4px rgb(var(--glow-terracotta) / 0.24);
  }

  /* ─── 3b. Sombras lift (hover) — translate-3px + sombra +40% ─── */
  .shadow-gold-lift {
    transform: translateY(-3px);
    box-shadow:
      0 14px 32px -8px rgb(var(--glow-gold) / 0.28),
      0 6px  14px -6px rgb(var(--glow-ink)  / 0.18);
  }
  .shadow-sage-lift {
    transform: translateY(-3px);
    box-shadow:
      0 14px 32px -8px rgb(var(--glow-sage) / 0.30),
      0 6px  14px -6px rgb(var(--glow-ink)  / 0.16);
  }
  .shadow-ink-lift {
    transform: translateY(-2px);
    box-shadow:
      0 16px 36px -10px rgb(var(--glow-ink) / 0.45),
      0 8px  16px -6px  rgb(var(--glow-ink) / 0.28);
  }

  /* ─── 4. Botão primary premium (sombra dupla gold + ink) ─────── */
  .btn-primary-premium {
    box-shadow:
      0 4px 12px -4px rgb(var(--glow-gold) / 0.30),
      0 2px 6px  -2px rgb(var(--glow-ink)  / 0.30);
    transition: transform 150ms var(--easing-decelerate),
                box-shadow 150ms var(--easing-decelerate);
  }
  .btn-primary-premium:hover {
    transform: translateY(-2px);
    box-shadow:
      0 10px 24px -8px rgb(var(--glow-gold) / 0.40),
      0 4px  10px -4px rgb(var(--glow-ink)  / 0.40);
  }
  .btn-primary-premium:active {
    transform: translateY(0) scale(0.98);
  }

  /* ─── 5. Mesh gradient & gradientes sutis ────────────────────── */
  .bg-hero-mesh {
    background:
      radial-gradient(ellipse 80% 60% at 20% 20%, rgb(var(--glow-gold) / 0.12), transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 70%, rgb(var(--glow-sage) / 0.16), transparent 65%),
      radial-gradient(ellipse 70% 60% at 50% 110%, rgb(var(--glow-terracotta) / 0.10), transparent 60%),
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
      color-mix(in srgb, hsl(var(--card)) 96%, var(--brand-gold)) 100%);
  }

  /* ─── 6. Focus glow (variante gold para inputs, com pulse) ───── */
  .input-focus-glow:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px rgb(var(--glow-gold) / 0.65),
      0 4px 16px -4px rgb(var(--glow-gold) / 0.30);
    animation: ring-pulse 600ms var(--easing-decelerate) 1;
  }

  /* ─── 7. Skeleton shimmer com tint dourado-sutil ─────────────── */
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      hsl(0 0% 94%) 0%,
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

  /* ─── 8. Orb drift (login background) ────────────────────────── */
  .animate-orb-drift {
    animation: orb-drift 14s ease-in-out infinite;
    will-change: transform;
  }
  .animate-orb-drift-slow {
    animation: orb-drift 22s ease-in-out infinite;
    will-change: transform;
  }

  /* ─── 9. Presence pulse (dot online no Chat) ─────────────────── */
  .animate-pulse-sage {
    animation: pulse-sage 1.6s ease-in-out infinite;
  }

  /* ─── 10. Font helpers ───────────────────────────────────────── */
  .font-kpi {
    font-family: var(--font-mono), 'JetBrains Mono', ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1;
    transition: text-shadow 220ms var(--easing-decelerate);
  }
  /* Glow gold no hover (aplicar no parent .group ou direto) */
  .group:hover .font-kpi-glow,
  .font-kpi-glow:hover {
    text-shadow:
      0 0 18px rgb(var(--glow-gold) / 0.40),
      0 0 2px  rgb(var(--glow-gold) / 0.22);
  }

  /* ─── 11. Modal overlay sólido (sem blur) ────────────────────── */
  .modal-overlay {
    background-color: var(--neutral-overlay);
  }
}

/* =================================================================
   KEYFRAMES
   ================================================================= */
@keyframes orb-drift {
  0%, 100% { transform: translate(0, 0)      scale(1);    }
  50%      { transform: translate(20px,-16px) scale(1.06); }
}

@keyframes shimmer {
  0%   { background-position: 200% 0;  }
  100% { background-position: -200% 0; }
}

@keyframes pulse-sage {
  0%, 100% { transform: scale(1);    opacity: 1;   }
  50%      { transform: scale(1.15); opacity: 0.7; }
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
      0 0 12px 0  rgb(var(--glow-gold) / 0.20);
  }
  100% {
    box-shadow:
      0 0 0 2px hsl(var(--background)),
      0 0 0 4px rgb(var(--glow-gold) / 0.65);
  }
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
  :focus-visible,
  .input-focus-glow:focus-visible {
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
  .surface-premium,
  .surface-premium-gold,
  .border-gradient-brand,
  .border-gradient-feature {
    background: #FFFFFF !important;
    box-shadow: none !important;
    border: 1px solid #CCCCCC !important;
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

```typescript
// theme.extend.colors.brand:
brand: {
  DEFAULT:           '#141414',           // ← era '#1A6B3C'
  50:                '#F7F7F7',
  100:               '#EEF2F0',
  200:               '#D6D6D6',
  300:               '#ADADAD',
  400:               '#869791',
  500:               '#141414',           // ← PRIMARY agora é ink
  600:               '#0D0D0D',
  700:               '#000000',
  800:               '#000000',
  900:               '#000000',
  foreground:        '#FFFFFF',

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

  // Deprecated alias (manter durante migração):
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
  // Base (repouso)
  'gold':       '0 4px 16px -4px rgb(231 149 1 / 0.22), 0 2px 6px -2px rgb(20 20 20 / 0.10)',
  'sage':       '0 4px 14px -4px rgb(134 151 145 / 0.24), 0 1px 3px -1px rgb(20 20 20 / 0.08)',
  'ink-glow':   '0 10px 24px -8px rgb(20 20 20 / 0.32), 0 4px 10px -4px rgb(20 20 20 / 0.18)',
  'terracotta': '0 4px 14px -4px rgb(204 72 51 / 0.24)',
  // Lift (hover, com transform aplicado pela classe utility)
  'gold-lift':  '0 14px 32px -8px rgb(231 149 1 / 0.28), 0 6px 14px -6px rgb(20 20 20 / 0.18)',
  'sage-lift':  '0 14px 32px -8px rgb(134 151 145 / 0.30), 0 6px 14px -6px rgb(20 20 20 / 0.16)',
  'ink-lift':   '0 16px 36px -10px rgb(20 20 20 / 0.45), 0 8px 16px -6px rgb(20 20 20 / 0.28)',
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
  'ring-pulse': {
    '0%':   { boxShadow: '0 0 0 2px hsl(var(--background)), 0 0 0 4px rgb(231 149 1 / 0.90), 0 0 18px 2px rgb(231 149 1 / 0.45)' },
    '60%':  { boxShadow: '0 0 0 2px hsl(var(--background)), 0 0 0 7px rgb(231 149 1 / 0.30), 0 0 12px 0 rgb(231 149 1 / 0.20)'  },
    '100%': { boxShadow: '0 0 0 2px hsl(var(--background)), 0 0 0 4px rgb(231 149 1 / 0.65)' },
  },
},

// theme.extend.animation:
animation: {
  'orb-drift':      'orb-drift 14s ease-in-out infinite',
  'orb-drift-slow': 'orb-drift 22s ease-in-out infinite',
  shimmer:          'shimmer 1.6s ease-in-out infinite',
  'pulse-sage':     'pulse-sage 1.6s ease-in-out infinite',
  'ring-pulse':     'ring-pulse 600ms cubic-bezier(0,0,0.2,1) 1',
},
```

---

## Compatibilidade com código existente

| Selector usado hoje | Antes (v3) | Depois (v4) | Quebra? |
|---|---|---|---|
| `bg-brand-500` | verde `#1A6B3C` | preto `#141414` | ✅ Não quebra (alias) |
| `text-brand-500` | verde | preto | ✅ Não quebra |
| `bg-secondary` | verde claro | sage-light | ✅ Não quebra |
| `text-primary` | hsl primary | hsl primary | ✅ Não quebra (var) |
| `bg-accent` | caramelo | gold | ✅ Não quebra |
| `.glass`, `.glass-strong` | n/a (não existia v3) | **REMOVIDO** | n/a — nunca foi exposto |

**Resultado:** Fábio aplica o patch + tailwind.config sem tocar em nenhum componente React; o app inteiro renderiza com a paleta v4 e sem glass. Refinos componente-a-componente (variants `premium`, `feature`, hover lift) entram em commits separados — ver `migration-plan-v4.md`.

---

*Patch CSS v4 (sem glassmorphism) — Davi Designer | 2026-05-25*
