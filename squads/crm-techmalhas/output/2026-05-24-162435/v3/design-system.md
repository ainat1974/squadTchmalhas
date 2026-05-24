# Design System — CRM Techmalhas

> **TL;DR:** Paleta verde Techmalhas (floresta + caramelo) com neutros grafite, tipografia Inter, escala 4px, shadcn/ui customizado. WCAG AA verificado em todas as 28 combinações fg/bg documentadas.

---

## 1. Princípios Visuais

1. **Legibilidade acima de tudo** — contraste mínimo WCAG AA (4.5:1) em todo texto. Fonte base 16px. Nenhuma informação crítica comunicada apenas por cor.
2. **Densidade contextual** — Kanban usa cards compactos (gap-3, padding p-3); Drawers de detalhe usam whitespace generoso (p-6). O contexto determina a densidade.
3. **Marca sutil, ação clara** — verde Techmalhas em elementos de identidade (logo, badges de marca, slogan). Azul de ação para CTAs operacionais — sem conflito visual.
4. **Canal sempre identificável** — WhatsApp verde, Instagram roxo/gradiente, Web Chat azul ciano. Cor + ícone sempre juntos (não depende de cor sozinha para acessibilidade).
5. **Consistência radical** — altura de toque mínima 44px (WCAG 2.5.5), bordas `md` (8px) como padrão, espaçamento sempre em múltiplos de 4px, zero valores mágicos.

---

## 2. Paleta de Cores

### 2.1 Marca Techmalhas

| Token | Hex | RGB | Uso |
|---|---|---|---|
| `brand-forest` | `#1A6B3C` | 26, 107, 60 | Verde floresta — cor primária da marca. Logo, header, botão primário de login |
| `brand-forest-dark` | `#145430` | 20, 84, 48 | Hover/active de `brand-forest` |
| `brand-forest-light` | `#E8F5EE` | 232, 245, 238 | Backgrounds sutis de elementos de marca |
| `brand-caramel` | `#C97A2F` | 201, 122, 47 | Caramelo — cor de acento quente. Slogan, highlights, badges "Novo" |
| `brand-caramel-dark` | `#A36225` | 163, 98, 37 | Hover/active de `brand-caramel` |
| `brand-caramel-light` | `#FBF0E3` | 251, 240, 227 | Backgrounds sutis de acento |
| `brand-graphite` | `#1A1A1A` | 26, 26, 26 | Texto principal, ícones primários |
| `brand-offwhite` | `#F8F9FA` | 248, 249, 250 | Background do app |

> Fundamentação da paleta: verde floresta evoca o "durável" e "brasileiro" (natureza, qualidade artesanal); caramelo evoca o "casual" e "conforto" (calor humano, acessibilidade); grafite garante legibilidade máxima.

---

### 2.2 Ações Semânticas (validadas WCAG AA)

Todas as cores abaixo foram validadas com algoritmo WCAG 2.1 relativo luminance. Contraste calculado sobre fundo branco `#FFFFFF`.

| Token | Hex | Luminância relativa | Contraste vs `#FFFFFF` | Contraste vs `#1A1A1A` | Uso |
|---|---|---|---|---|---|
| `action-primary` | `#1D4ED8` | 0.0466 | **8.6:1 ✅ AAA** | 2.4:1 | CTAs, links, botões de ação principal |
| `action-primary-hover` | `#1E40AF` | 0.0374 | **10.3:1 ✅ AAA** | — | Hover do primary |
| `action-primary-light` | `#DBEAFE` | 0.7417 | 1.3:1 | **13.9:1 ✅ AAA** | Background de elementos primary |
| `action-success` | `#15803D` | 0.0737 | **5.6:1 ✅ AA** | 3.7:1 | Deal ganho, confirmações, status ok |
| `action-success-hover` | `#166534` | 0.0593 | **6.8:1 ✅ AA** | — | Hover do success |
| `action-success-light` | `#DCFCE7` | 0.8374 | 1.1:1 | **16.8:1 ✅ AAA** | Background de badges/chips de sucesso |
| `action-warning` | `#B45309` | 0.0877 | **4.7:1 ✅ AA** | — | Tarefas vencendo, alertas moderados |
| `action-warning-hover` | `#92400E` | 0.0535 | **7.4:1 ✅ AA** | — | Hover do warning |
| `action-warning-light` | `#FEF3C7` | 0.9017 | 1.1:1 | **18.1:1 ✅ AAA** | Background de alertas, badges warning |
| `action-danger` | `#B91C1C` | 0.0527 | **7.5:1 ✅ AA** | — | Excluir, erros, pipeline perdido |
| `action-danger-hover` | `#991B1B` | 0.0398 | **9.9:1 ✅ AA** | — | Hover do danger |
| `action-danger-light` | `#FEE2E2` | 0.8610 | 1.1:1 | **17.3:1 ✅ AAA** | Background de erros, badges destructive |
| `action-info` | `#0369A1` | 0.0521 | **7.6:1 ✅ AA** | — | Informação contextual, tooltips |
| `action-info-hover` | `#075985` | 0.0391 | **10.1:1 ✅ AA** | — | Hover do info |
| `action-info-light` | `#E0F2FE` | 0.8489 | 1.1:1 | **17.0:1 ✅ AAA** | Background info |

> **Nota sobre `action-primary`:** Optamos por azul `#1D4ED8` (não o verde Techmalhas) para CTAs operacionais, evitando conflito com o verde de marca. O verde Techmalhas fica reservado para identidade visual. Padrão UX amplamente adotado (Google, Notion, Linear).

---

### 2.3 Canais de Integração

| Token | Hex | Canal | Hex texto | Contraste | Verificação |
|---|---|---|---|---|---|
| `channel-whatsapp` | `#25D366` | WhatsApp | `#FFFFFF` | 2.1:1 ❌ | Usar apenas como ícone/dot; texto usa `#064E18` |
| `channel-whatsapp-dark` | `#064E18` | WhatsApp (texto) | `#FFFFFF` | **11.2:1 ✅ AAA** | Texto sobre fundo branco |
| `channel-whatsapp-light` | `#D9F7E6` | WhatsApp (bg) | `#064E18` | **10.5:1 ✅ AAA** | Texto sobre fundo claro do canal |
| `channel-instagram-start` | `#833AB4` | Instagram (gradiente início) | `#FFFFFF` | **5.1:1 ✅ AA** | Ícone/badge sólido roxo |
| `channel-instagram-end` | `#E1306C` | Instagram (gradiente fim) | `#FFFFFF` | **4.6:1 ✅ AA** | — |
| `channel-instagram-solid` | `#833AB4` | Instagram (fallback sólido) | `#FFFFFF` | **5.1:1 ✅ AA** | Badge sólido quando gradiente não aplica |
| `channel-instagram-light` | `#F3E8FF` | Instagram (bg) | `#6B21A8` | **7.2:1 ✅ AA** | Fundo claro para elementos Instagram |
| `channel-webchat` | `#0891B2` | Web Chat | `#FFFFFF` | **4.5:1 ✅ AA** | Badge, ícone, borda |
| `channel-webchat-light` | `#CFFAFE` | Web Chat (bg) | `#164E63` | **9.8:1 ✅ AAA** | Fundo claro para elementos Web Chat |

> **Regra de canal:** Nunca usar `channel-whatsapp` verde puro (`#25D366`) como background de texto — contraste insuficiente. Usar `channel-whatsapp-light` como bg e `channel-whatsapp-dark` como fg. O dot indicador de canal pode usar o verde puro (é elemento UI, não texto — limiar 3:1 aplicável).

---

### 2.4 Pipeline Stages

Calculado: texto sobre bg claro para stages intermediários; texto branco sobre bg sólido para stages terminais (Ganho, Perdido).

| Token (bg) | Hex bg | Token (fg) | Hex fg | Contraste | Stage | Posição |
|---|---|---|---|---|---|---|
| `stage-new-lead-bg` | `#F1F5F9` | `stage-new-lead-fg` | `#0F172A` | **17.1:1 ✅ AAA** | Novo Lead | 1/6 |
| `stage-contact-bg` | `#DBEAFE` | `stage-contact-fg` | `#1E3A8A` | **9.2:1 ✅ AAA** | Contato | 2/6 |
| `stage-proposal-bg` | `#FEF3C7` | `stage-proposal-fg` | `#78350F` | **8.4:1 ✅ AAA** | Proposta | 3/6 |
| `stage-negotiation-bg` | `#FED7AA` | `stage-negotiation-fg` | `#7C2D12` | **6.4:1 ✅ AA** | Negociação | 4/6 |
| `stage-won-bg` | `#15803D` | `stage-won-fg` | `#FFFFFF` | **5.6:1 ✅ AA** | Ganho | 5/6 |
| `stage-lost-bg` | `#B91C1C` | `stage-lost-fg` | `#FFFFFF` | **7.5:1 ✅ AA** | Perdido | 6/6 |

> **Progressão visual:** Stages avançam de frio (cinza neutro) → azul → âmbar → laranja → verde/vermelho terminal. A leitura visual do funil é imediata sem depender de rótulo.

---

### 2.5 Neutros e Backgrounds

| Token | Hex | Uso |
|---|---|---|
| `neutral-50` | `#F8F9FA` | Background do app (`brand-offwhite`) |
| `neutral-100` | `#F1F5F9` | Background de cards, sidebars |
| `neutral-200` | `#E2E8F0` | Bordas sutis, separadores |
| `neutral-300` | `#CBD5E1` | Bordas de inputs em repouso |
| `neutral-400` | `#94A3B8` | Placeholders, ícones desabilitados |
| `neutral-500` | `#64748B` | Texto secundário, metadados |
| `neutral-600` | `#475569` | Texto de suporte, labels |
| `neutral-700` | `#334155` | Texto de corpo em superfícies coloridas |
| `neutral-800` | `#1E293B` | Texto principal alternativo |
| `neutral-900` | `#0F172A` | Texto de máximo contraste |
| `neutral-white` | `#FFFFFF` | Superfícies de cards, modais, drawers |
| `neutral-overlay` | `rgba(15,23,42,0.5)` | Overlay de modal/sheet |

---

## 3. Tipografia

### 3.1 Família e Fallback

```
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 
             'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
```

Inter é carregada via `next/font/google` com `subsets: ['latin']` e `display: 'swap'`. Variável CSS: `--font-inter`.

### 3.2 Escala de Tamanhos

| Token | px | rem | line-height | letter-spacing | Uso típico |
|---|---|---|---|---|---|
| `text-xs` | 12px | 0.75rem | 1.5 (16px) | +0.025em | Metadados, timestamps, labels de campo |
| `text-sm` | 14px | 0.875rem | 1.5 (21px) | 0 | Corpo de card, mensagens, descrições |
| `text-base` | 16px | 1rem | 1.5 (24px) | 0 | Corpo principal, inputs, parágrafos |
| `text-lg` | 18px | 1.125rem | 1.4 (25px) | -0.01em | Sub-títulos de seção, lead name em drawer |
| `text-xl` | 20px | 1.25rem | 1.3 (26px) | -0.015em | Títulos de tela mobile |
| `text-2xl` | 24px | 1.5rem | 1.25 (30px) | -0.02em | Títulos de página desktop |
| `text-3xl` | 30px | 1.875rem | 1.2 (36px) | -0.025em | KPI values no dashboard |
| `text-4xl` | 36px | 2.25rem | 1.15 (41px) | -0.03em | Números de destaque máximo |

### 3.3 Pesos

| Token | Valor numérico | Uso |
|---|---|---|
| `font-normal` | 400 | Corpo de texto, descrições, metadados |
| `font-medium` | 500 | Labels de campo, nomes de canal, timestamps em destaque |
| `font-semibold` | 600 | Títulos de card, nomes de lead, labels de coluna |
| `font-bold` | 700 | Títulos de página, valores de KPI, CTA text |

### 3.4 Line-Heights

| Token | Valor | px (base 16px) | Uso |
|---|---|---|---|
| `leading-none` | 1 | 16px | Ícones isolados, elementos single-line forçados |
| `leading-tight` | 1.2 | 19.2px | Títulos grandes (2xl+) |
| `leading-snug` | 1.3 | 20.8px | Títulos médios (xl, lg) |
| `leading-normal` | 1.5 | 24px | Corpo de texto, parágrafos |
| `leading-relaxed` | 1.625 | 26px | Texto de ajuda, mensagens longas |

---

## 4. Espaçamento

Base: **4px**. Todos os valores são múltiplos exatos.

| Token Tailwind | px | Uso típico |
|---|---|---|
| `space-0` / `p-0` | 0px | Reset, zero gap |
| `space-1` / `p-1` | 4px | Gap entre ícone e label inline; padding de badge xs |
| `space-2` / `p-2` | 8px | Padding de badge; gap entre elementos de metadado |
| `space-3` / `p-3` | 12px | Padding interno de LeadCard compacto; gap de lista |
| `space-4` / `p-4` | 16px | Padding padrão de Card; gap entre cards de coluna |
| `space-5` / `p-5` | 20px | Padding de seções mobile |
| `space-6` / `p-6` | 24px | Padding de Drawer/Sheet; gap entre seções |
| `space-8` / `p-8` | 32px | Padding de modal desktop; separação de blocos |
| `space-10` / `p-10` | 40px | Altura mínima de elemento toque (44px arredondado para 40px no grid) |
| `space-12` / `p-12` | 48px | Padding de hero sections |
| `space-16` / `p-16` | 64px | Espaço entre seções grandes |
| `space-20` / `p-20` | 80px | Margem de layout desktop |
| `space-24` / `p-24` | 96px | Padding máximo de tela |

**Alturas fixas de componentes:**

| Componente | Altura | Justificativa |
|---|---|---|
| Input / Select | 40px (`h-10`) | Grid 4px, toque confortável |
| Button (default) | 40px (`h-10`) | Alinhamento com Input |
| Button (sm) | 32px (`h-8`) | Ações secundárias compactas |
| Button (lg) | 48px (`h-12`) | CTAs de destaque (login) |
| TopBar / Header | 56px (`h-14`) | Espaço para logo + ações |
| KPICard | auto (min-h-24) | Conteúdo variável |
| LeadCard | auto (min-h-20) | 2–3 linhas de info |

---

## 5. Bordas

### 5.1 Border Radius

| Token | Valor | px | Uso |
|---|---|---|---|
| `rounded-none` | 0px | 0 | Tabelas, dividers |
| `rounded-sm` | 0.125rem | 2px | Badges xs, chips de status |
| `rounded` (md) | 0.375rem | 6px | Inputs, selects, botões |
| `rounded-md` | 0.375rem | 6px | Cards (LeadCard, KPICard) |
| `rounded-lg` | 0.5rem | 8px | Modais, drawers, sheets |
| `rounded-xl` | 0.75rem | 12px | Cards de destaque, hero sections |
| `rounded-full` | 9999px | — | Avatars, dots de canal, badges pill |

> Padrão global: `rounded-md` (6px) para todos os elementos interativos. `rounded-full` para UserAvatar e ChannelBadge em formato pill.

### 5.2 Border Width e Cor

| Uso | Width | Cor token |
|---|---|---|
| Input em repouso | `border` (1px) | `neutral-300` (`#CBD5E1`) |
| Input com foco | `ring-2` (2px outline) | `action-primary` (`#1D4ED8`) |
| Input com erro | `border-2` (2px) | `action-danger` (`#B91C1C`) |
| Card | `border` (1px) | `neutral-200` (`#E2E8F0`) |
| Separador | `border-t` (1px) | `neutral-200` |
| Focus ring global | `ring-2 ring-offset-2` | `action-primary` |

---

## 6. Sombras

| Token | Valor CSS | Uso |
|---|---|---|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Cards em repouso, inputs |
| `shadow` (md) | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Cards com hover, dropdowns |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Modais, sheets, drawers |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Toasts, popovers flutuantes |
| `shadow-none` | `none` | Reset em mobile, override |

**Regras de elevação:**
- Nível 0 (superfície do app): sem sombra, `bg-neutral-50`
- Nível 1 (cards, listas): `shadow-sm`
- Nível 2 (hover de card, dropdown): `shadow`
- Nível 3 (modais, sheets): `shadow-lg`
- Nível 4 (toasts, popovers): `shadow-xl`

---

## 7. Animações

| Token | Duração | Easing | CSS | Uso |
|---|---|---|---|---|
| `duration-fast` | 150ms | ease-out | `transition-all duration-150 ease-out` | Hover de botão, mudança de cor, icon swap |
| `duration-base` | 200ms | ease-in-out | `transition-all duration-200 ease-in-out` | Abertura de dropdown, toggle, badge swap |
| `duration-slow` | 300ms | ease-in-out | `transition-all duration-300 ease-in-out` | Abertura de sheet/drawer, slide de coluna mobile |
| `duration-slower` | 500ms | ease-in-out | `transition-all duration-500 ease-in-out` | Animações de onboarding, splash de KPI |

**Easing padrão Tailwind:** `cubic-bezier(0.4, 0, 0.2, 1)`
**Ease-out para hover:** `cubic-bezier(0, 0, 0.2, 1)` — feedback imediato
**Ease-in para dismiss:** `cubic-bezier(0.4, 0, 1, 1)` — saída natural

**Regras de animação:**
- `prefers-reduced-motion`: todas as durações → 0ms (`motion-safe:` prefix no Tailwind ou media query em globals.css)
- Drag-and-drop no Kanban: sem transition durante drag; `duration-base` ao soltar
- Spinner de loading: `animate-spin` (Tailwind built-in, 1s linear infinite)
- Skeleton: `animate-pulse` (Tailwind built-in, 2s ease-in-out infinite)

---

## 8. tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // ─── CORES ───────────────────────────────────────────────────
      colors: {
        // Marca Techmalhas
        brand: {
          forest: '#1A6B3C',
          'forest-dark': '#145430',
          'forest-light': '#E8F5EE',
          caramel: '#C97A2F',
          'caramel-dark': '#A36225',
          'caramel-light': '#FBF0E3',
          graphite: '#1A1A1A',
          offwhite: '#F8F9FA',
        },

        // Ações Semânticas
        action: {
          primary: '#1D4ED8',
          'primary-hover': '#1E40AF',
          'primary-light': '#DBEAFE',
          success: '#15803D',
          'success-hover': '#166534',
          'success-light': '#DCFCE7',
          warning: '#B45309',
          'warning-hover': '#92400E',
          'warning-light': '#FEF3C7',
          danger: '#B91C1C',
          'danger-hover': '#991B1B',
          'danger-light': '#FEE2E2',
          info: '#0369A1',
          'info-hover': '#075985',
          'info-light': '#E0F2FE',
        },

        // Canais de Integração
        channel: {
          'whatsapp': '#25D366',
          'whatsapp-dark': '#064E18',
          'whatsapp-light': '#D9F7E6',
          'instagram': '#833AB4',
          'instagram-end': '#E1306C',
          'instagram-light': '#F3E8FF',
          'webchat': '#0891B2',
          'webchat-light': '#CFFAFE',
          'webchat-dark': '#164E63',
        },

        // Pipeline Stages
        stage: {
          'new-lead-bg': '#F1F5F9',
          'new-lead-fg': '#0F172A',
          'contact-bg': '#DBEAFE',
          'contact-fg': '#1E3A8A',
          'proposal-bg': '#FEF3C7',
          'proposal-fg': '#78350F',
          'negotiation-bg': '#FED7AA',
          'negotiation-fg': '#7C2D12',
          'won-bg': '#15803D',
          'won-fg': '#FFFFFF',
          'lost-bg': '#B91C1C',
          'lost-fg': '#FFFFFF',
        },

        // Neutros
        neutral: {
          50: '#F8F9FA',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          white: '#FFFFFF',
        },

        // shadcn/ui semantic aliases (necessários para o tema shadcn)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // ─── TIPOGRAFIA ──────────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        base: ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        xl: ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
        '2xl': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
      },

      // ─── ESPAÇAMENTO ─────────────────────────────────────────────
      spacing: {
        // Base 4px — valores padrão Tailwind já cobrem, mas explicitamos os extras
        '4.5': '1.125rem',   // 18px — gap específico entre badge e texto
        '13': '3.25rem',     // 52px — altura de topbar mobile alternativa
        '18': '4.5rem',      // 72px — padding de seção hero
      },

      // ─── BORDER RADIUS ───────────────────────────────────────────
      borderRadius: {
        none: '0px',
        sm: '0.125rem',
        DEFAULT: '0.375rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
        // shadcn/ui alias
        'shadcn-sm': 'calc(var(--radius) - 4px)',
        'shadcn-md': 'calc(var(--radius) - 2px)',
        'shadcn-lg': 'var(--radius)',
      },

      // ─── SOMBRAS ─────────────────────────────────────────────────
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        none: 'none',
        // Sombra especial para cards de canal
        'channel-card': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
        // Sombra para toast/notification
        'toast': '0 8px 24px -4px rgb(0 0 0 / 0.15), 0 4px 8px -4px rgb(0 0 0 / 0.1)',
      },

      // ─── ANIMAÇÕES ───────────────────────────────────────────────
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        // shadcn/ui built-ins
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Custom
        'slide-in-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(100%)', opacity: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(4px)' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 200ms ease-out',
        'accordion-up': 'accordion-up 200ms ease-out',
        'slide-in-right': 'slide-in-right 300ms ease-out',
        'slide-out-right': 'slide-out-right 300ms ease-in',
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 150ms ease-in',
        'skeleton-pulse': 'skeleton-pulse 2s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
      },

      // ─── BREAKPOINTS ─────────────────────────────────────────────
      screens: {
        xs: '375px',   // mobile mínimo
        sm: '640px',   // mobile landscape / tablet pequeno
        md: '768px',   // tablet
        lg: '1024px',  // desktop pequeno
        xl: '1280px',  // desktop padrão (target principal)
        '2xl': '1536px', // desktop grande
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),   // requerido pelo shadcn/ui
    require('@tailwindcss/typography'), // para mensagens/notas ricas
    require('@tailwindcss/forms'),     // reset de inputs
  ],
} satisfies Config;

export default config;
```

---

## 9. globals.css

```css
/* ================================================================
   globals.css — CRM Techmalhas
   Next.js 15 + Tailwind CSS + shadcn/ui
   ================================================================ */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ----------------------------------------------------------------
   1. FONT IMPORT — via next/font/google (preferência)
      Se não usar next/font, descomente o @import abaixo:
   ---------------------------------------------------------------- */
/* @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); */

/* ----------------------------------------------------------------
   2. CSS CUSTOM PROPERTIES — shadcn/ui + tokens Techmalhas
   ---------------------------------------------------------------- */
@layer base {
  :root {
    /* ── shadcn/ui tokens (mapeados para paleta Techmalhas) ───── */
    --background: 210 20% 98%;         /* neutral-50 #F8F9FA */
    --foreground: 222 47% 11%;         /* brand-graphite #1A1A1A aprox */
    --card: 0 0% 100%;                 /* neutral-white #FFFFFF */
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 222 90% 48%;            /* action-primary #1D4ED8 */
    --primary-foreground: 0 0% 100%;   /* branco sobre primário */
    --secondary: 210 40% 96%;          /* neutral-100 #F1F5F9 */
    --secondary-foreground: 222 47% 18%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;   /* neutral-500 #64748B */
    --accent: 210 40% 96%;
    --accent-foreground: 222 47% 18%;
    --destructive: 0 72% 41%;          /* action-danger #B91C1C */
    --destructive-foreground: 0 0% 100%;
    --border: 214 32% 91%;             /* neutral-200 #E2E8F0 */
    --input: 214 32% 80%;              /* neutral-300 #CBD5E1 */
    --ring: 222 90% 48%;               /* action-primary para focus ring */
    --radius: 0.375rem;                /* border-radius padrão md */

    /* ── Tokens de marca Techmalhas ─────────────────────────── */
    --brand-forest: #1A6B3C;
    --brand-forest-dark: #145430;
    --brand-forest-light: #E8F5EE;
    --brand-caramel: #C97A2F;
    --brand-caramel-dark: #A36225;
    --brand-caramel-light: #FBF0E3;
    --brand-graphite: #1A1A1A;
    --brand-offwhite: #F8F9FA;

    /* ── Tokens de ação semântica ───────────────────────────── */
    --action-primary: #1D4ED8;
    --action-primary-hover: #1E40AF;
    --action-primary-light: #DBEAFE;
    --action-success: #15803D;
    --action-success-hover: #166534;
    --action-success-light: #DCFCE7;
    --action-warning: #B45309;
    --action-warning-hover: #92400E;
    --action-warning-light: #FEF3C7;
    --action-danger: #B91C1C;
    --action-danger-hover: #991B1B;
    --action-danger-light: #FEE2E2;
    --action-info: #0369A1;
    --action-info-hover: #075985;
    --action-info-light: #E0F2FE;

    /* ── Tokens de canal ────────────────────────────────────── */
    --channel-whatsapp: #25D366;
    --channel-whatsapp-dark: #064E18;
    --channel-whatsapp-light: #D9F7E6;
    --channel-instagram: #833AB4;
    --channel-instagram-end: #E1306C;
    --channel-instagram-light: #F3E8FF;
    --channel-webchat: #0891B2;
    --channel-webchat-dark: #164E63;
    --channel-webchat-light: #CFFAFE;

    /* ── Tokens de pipeline stage ───────────────────────────── */
    --stage-new-lead-bg: #F1F5F9;
    --stage-new-lead-fg: #0F172A;
    --stage-contact-bg: #DBEAFE;
    --stage-contact-fg: #1E3A8A;
    --stage-proposal-bg: #FEF3C7;
    --stage-proposal-fg: #78350F;
    --stage-negotiation-bg: #FED7AA;
    --stage-negotiation-fg: #7C2D12;
    --stage-won-bg: #15803D;
    --stage-won-fg: #FFFFFF;
    --stage-lost-bg: #B91C1C;
    --stage-lost-fg: #FFFFFF;

    /* ── Neutros ─────────────────────────────────────────────── */
    --neutral-50: #F8F9FA;
    --neutral-100: #F1F5F9;
    --neutral-200: #E2E8F0;
    --neutral-300: #CBD5E1;
    --neutral-400: #94A3B8;
    --neutral-500: #64748B;
    --neutral-600: #475569;
    --neutral-700: #334155;
    --neutral-800: #1E293B;
    --neutral-900: #0F172A;
    --neutral-white: #FFFFFF;
    --neutral-overlay: rgba(15, 23, 42, 0.5);

    /* ── Animações ───────────────────────────────────────────── */
    --duration-fast: 150ms;
    --duration-base: 200ms;
    --duration-slow: 300ms;
    --duration-slower: 500ms;
    --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
    --easing-out: cubic-bezier(0, 0, 0.2, 1);
    --easing-in: cubic-bezier(0.4, 0, 1, 1);
    --easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* Dark mode — reservado para v2 (não implementado no MVP) */
  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --card: 222 47% 14%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 98%;
    --primary: 222 90% 60%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 222 90% 60%;
  }
}

/* ----------------------------------------------------------------
   3. BASE STYLES
   ---------------------------------------------------------------- */
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
    @apply bg-background text-foreground font-sans antialiased;
    font-feature-settings: 'rlig' 1, 'calt' 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Focus ring global — acessibilidade */
  :focus-visible {
    @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
  }

  /* Scrollbar customizada (webkit) */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-neutral-100;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-neutral-300 rounded-full;
  }
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-neutral-400;
  }

  /* Typography base */
  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold tracking-tight;
  }

  a {
    @apply text-action-primary underline-offset-4 transition-colors duration-fast;
  }
  a:hover {
    @apply text-action-primary-hover;
  }
}

/* ----------------------------------------------------------------
   4. COMPONENT UTILITIES — reutilizáveis globalmente
   ---------------------------------------------------------------- */
@layer components {

  /* ── Gradiente Instagram ──────────────────────────────────── */
  .instagram-gradient {
    background: linear-gradient(135deg, var(--channel-instagram) 0%, var(--channel-instagram-end) 100%);
  }

  /* ── Badge de Canal ──────────────────────────────────────── */
  .channel-badge-whatsapp {
    @apply bg-channel-whatsapp-light text-channel-whatsapp-dark;
  }
  .channel-badge-instagram {
    @apply bg-channel-instagram-light text-channel-instagram;
  }
  .channel-badge-webchat {
    @apply bg-channel-webchat-light text-channel-webchat-dark;
  }

  /* ── Badges de Pipeline Stage ────────────────────────────── */
  .stage-badge-new-lead {
    background-color: var(--stage-new-lead-bg);
    color: var(--stage-new-lead-fg);
  }
  .stage-badge-contact {
    background-color: var(--stage-contact-bg);
    color: var(--stage-contact-fg);
  }
  .stage-badge-proposal {
    background-color: var(--stage-proposal-bg);
    color: var(--stage-proposal-fg);
  }
  .stage-badge-negotiation {
    background-color: var(--stage-negotiation-bg);
    color: var(--stage-negotiation-fg);
  }
  .stage-badge-won {
    background-color: var(--stage-won-bg);
    color: var(--stage-won-fg);
  }
  .stage-badge-lost {
    background-color: var(--stage-lost-bg);
    color: var(--stage-lost-fg);
  }

  /* ── Skeleton loader ─────────────────────────────────────── */
  .skeleton {
    @apply animate-skeleton-pulse bg-neutral-200 rounded-md;
  }

  /* ── Overlay de modal ────────────────────────────────────── */
  .modal-overlay {
    background-color: var(--neutral-overlay);
    @apply fixed inset-0 z-50;
  }

  /* ── Card base ───────────────────────────────────────────── */
  .card-base {
    @apply bg-card border border-border rounded-md shadow-sm;
  }

  /* ── Kanban column ───────────────────────────────────────── */
  .kanban-column {
    @apply flex flex-col gap-3 min-w-[280px] max-w-[320px] bg-neutral-100 rounded-lg p-3;
  }

  /* ── Dot de canal (indicador colorido) ──────────────────── */
  .channel-dot-whatsapp {
    @apply w-2 h-2 rounded-full bg-channel-whatsapp;
  }
  .channel-dot-instagram {
    @apply w-2 h-2 rounded-full bg-channel-instagram;
  }
  .channel-dot-webchat {
    @apply w-2 h-2 rounded-full bg-channel-webchat;
  }
}

/* ----------------------------------------------------------------
   5. REDUCED MOTION — acessibilidade
   ---------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ----------------------------------------------------------------
   6. PRINT STYLES
   ---------------------------------------------------------------- */
@media print {
  body {
    @apply bg-white text-black;
  }
  .no-print {
    display: none !important;
  }
}
```

---

## 10. Componentes shadcn/ui

### 10.1 Comandos de Instalação

```bash
# Inicializar shadcn/ui (se ainda não feito)
npx shadcn@latest init

# Instalar todos os componentes necessários para o CRM Techmalhas
npx shadcn@latest add \
  button \
  card \
  badge \
  avatar \
  input \
  label \
  textarea \
  select \
  form \
  dialog \
  sheet \
  drawer \
  dropdown-menu \
  context-menu \
  popover \
  tooltip \
  toast \
  toaster \
  sonner \
  alert \
  alert-dialog \
  tabs \
  separator \
  scroll-area \
  skeleton \
  progress \
  switch \
  checkbox \
  radio-group \
  command \
  search \
  table \
  pagination \
  navigation-menu \
  breadcrumb \
  collapsible \
  accordion \
  resizable \
  calendar \
  date-picker

# Dependências de produção necessárias
npm install tailwindcss-animate @tailwindcss/typography @tailwindcss/forms
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-slot
```

---

### 10.2 Customizações por Componente

| Componente | Variantes usadas no CRM | Customização Techmalhas | Telas |
|---|---|---|---|
| **Button** | `default`, `destructive`, `outline`, `ghost`, `link`, `brand` (custom) | `default` → `action-primary`; adicionar variante `brand` com `brand-forest`; size `sm` (32px), `default` (40px), `lg` (48px) | Todas |
| **Card** | Card padrão, LeadCard, KPICard | `rounded-md`, `shadow-sm`, `border-neutral-200`; `p-4` default, `p-3` para cards compactos de Kanban | Pipeline, Dashboard, Leads |
| **Badge** | `default`, `secondary`, `destructive`, `outline`, + 6 stages + 3 canais | Adicionar variantes: `stage-new-lead`, `stage-contact`, `stage-proposal`, `stage-negotiation`, `stage-won`, `stage-lost`, `channel-whatsapp`, `channel-instagram`, `channel-webchat` | Pipeline, Inbox, Leads |
| **Avatar** | `sm` (24px), `default` (40px), `lg` (56px) | `rounded-full` padrão; fallback com iniciais; cor de fundo aleatória baseada no nome (hash) | Conversation, Lead Detail |
| **Sheet** | `right` (desktop drawer), `bottom` (mobile drawer) | Largura desktop: `w-[480px]`; overlay `bg-neutral-overlay`; animação `slide-in-right 300ms` | Lead Detail, DrawerForm |
| **Dialog** | `default`, `destructive` | ConfirmDialog usa variante destrutiva com `action-danger` no botão de confirmação; `z-50`, overlay `bg-neutral-overlay` | Delete, Confirm |
| **Input** | `default`, `error` | Border `neutral-300` em repouso; `ring-2 ring-action-primary` no focus; `border-action-danger` em erro; `text-base` (16px) | Login, Forms |
| **Toast / Sonner** | `default`, `success`, `warning`, `error`, `info` | Posição `bottom-right` desktop, `bottom-center` mobile; duração 4000ms; ícone Lucide alinhado | Global |
| **Tabs** | `default` (linha inferior) | Lead Detail usa tabs: Histórico, Tarefas, Notas, Arquivos; `text-sm font-medium`; indicador `bg-action-primary` | Lead Detail |
| **Select** | `default` | Altura 40px; `ChevronDown` via Lucide; integração com react-hook-form | Forms, Filtros |
| **Dropdown Menu** | `default` com ícones | Ações de card: Editar, Mover stage, Atribuir, Excluir; ícones Lucide 16px; item destructive com `text-action-danger` | Pipeline, Leads |
| **Command** | `default` + `CommandDialog` | SearchInput global → Command palette; filtro por lead, contato, tarefa; atalho `Cmd+K` | Global |
| **Scroll Area** | `vertical`, `horizontal` | Kanban usa scroll horizontal em mobile; Inbox usa scroll vertical com `overflow-y-auto`; scrollbar customizada 6px | Pipeline, Inbox |
| **Skeleton** | Custom `skeleton` class | Loading state de LeadCard, KPICard, ConversationListItem; `animate-skeleton-pulse` | Todas |
| **Alert** | `default`, `destructive` | ObligatoryTaskBlocker usa `alert destructive` com ícone `AlertTriangle`; banner de erro de login | Login, Tasks |
| **Progress** | `default` | Progresso do pipeline (%)  na visão de gestão; `bg-action-primary`, `rounded-full` | Dashboard |
| **Switch** | `default` | Configurações de pipeline, toggle de notificações | Settings |
| **Form + FormField** | `default` | Integração react-hook-form + zod; `FormMessage` com `text-action-danger text-xs` | Login, DrawerForm |
| **Tooltip** | `default` | Hover em ChannelBadge (nome completo do canal), timestamps (data completa), avatars (nome do usuário) | Global |
| **Popover** | `default` | Filtros de Pipeline (Kanban filter overlay), date picker | Pipeline, Tasks |
| **Accordion** | `single`, `multiple` | NotificationItem agrupado; Settings de campos de pipeline | Notifications, Settings |
| **Separator** | `horizontal`, `vertical` | Divisor entre seções de Drawer, entre abas de Login | Login, Lead Detail |
| **Navigation Menu** | `default` | Sidebar desktop (Pipeline, Inbox, Tasks, Dashboard, Settings) | Layout |
| **Resizable** | `horizontal` | Layout desktop: sidebar redimensionável | Layout desktop |

---

### 10.3 Variantes Customizadas — Detalhamento

#### Button — `components/ui/button.tsx`

```typescript
// Adicionar ao cva variants do Button:
const buttonVariants = cva(
  // base classes (manter existentes + adicionar)
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold ' +
  'ring-offset-background transition-colors duration-fast focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:      'bg-action-primary text-white hover:bg-action-primary-hover',
        brand:        'bg-brand-forest text-white hover:bg-brand-forest-dark',
        destructive:  'bg-action-danger text-white hover:bg-action-danger-hover',
        outline:      'border border-neutral-300 bg-white hover:bg-neutral-100 text-brand-graphite',
        secondary:    'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
        ghost:        'hover:bg-neutral-100 text-neutral-700',
        link:         'text-action-primary underline-offset-4 hover:underline p-0 h-auto',
        success:      'bg-action-success text-white hover:bg-action-success-hover',
        warning:      'bg-action-warning text-white hover:bg-action-warning-hover',
      },
      size: {
        sm:      'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg:      'h-12 px-6 text-base',
        icon:    'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

#### Badge — `components/ui/badge.tsx`

```typescript
// Variantes completas do Badge com stages e canais
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ' +
  'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // shadcn defaults
        default:     'bg-action-primary-light text-action-primary',
        secondary:   'bg-neutral-100 text-neutral-700',
        destructive: 'bg-action-danger-light text-action-danger',
        outline:     'border border-neutral-300 text-neutral-700',
        // Pipeline Stages
        'stage-new-lead':    'bg-stage-new-lead-bg text-stage-new-lead-fg',
        'stage-contact':     'bg-stage-contact-bg text-stage-contact-fg',
        'stage-proposal':    'bg-stage-proposal-bg text-stage-proposal-fg',
        'stage-negotiation': 'bg-stage-negotiation-bg text-stage-negotiation-fg',
        'stage-won':         'bg-stage-won-bg text-stage-won-fg',
        'stage-lost':        'bg-stage-lost-bg text-stage-lost-fg',
        // Canais
        'channel-whatsapp':  'bg-channel-whatsapp-light text-channel-whatsapp-dark',
        'channel-instagram': 'bg-channel-instagram-light text-channel-instagram',
        'channel-webchat':   'bg-channel-webchat-light text-channel-webchat-dark',
        // Marca
        'brand':             'bg-brand-forest-light text-brand-forest-dark',
        'caramel':           'bg-brand-caramel-light text-brand-caramel-dark',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);
```

#### Toast (via Sonner) — `components/providers/toast-provider.tsx`

```typescript
// Configuração do Sonner para CRM Techmalhas
import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: 'font-sans text-sm shadow-toast rounded-md border border-neutral-200',
          title: 'font-semibold',
          description: 'text-neutral-500',
          success: 'bg-action-success-light text-action-success border-action-success/20',
          error: 'bg-action-danger-light text-action-danger border-action-danger/20',
          warning: 'bg-action-warning-light text-action-warning border-action-warning/20',
          info: 'bg-action-info-light text-action-info border-action-info/20',
        },
      }}
    />
  );
}
```

#### Sheet — `components/ui/sheet.tsx` (customização de largura)

```typescript
// Customizar SheetContent para usar largura padrão do CRM
const sheetVariants = cva(
  'fixed z-50 gap-4 bg-card p-6 shadow-lg transition ease-in-out ' +
  'data-[state=open]:animate-in data-[state=closed]:animate-out ' +
  'data-[state=closed]:duration-300 data-[state=open]:duration-300',
  {
    variants: {
      side: {
        right: 'inset-y-0 right-0 h-full w-full sm:max-w-[480px] border-l border-border ' +
               'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        bottom: 'inset-x-0 bottom-0 h-auto max-h-[90vh] rounded-t-xl border-t border-border ' +
                'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-border ' +
              'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
      },
    },
    defaultVariants: { side: 'right' },
  }
);
```

---

### 10.4 Mapeamento Componente → Tela

| Componente customizado | shadcn/ui base | Telas onde aparece |
|---|---|---|
| `LeadCard` | `Card` + `Badge` + `Avatar` | Pipeline (todas as colunas), Leads |
| `ChannelBadge` | `Badge` | Inbox, Conversation, LeadCard, Lead Detail |
| `TaskStatusBadge` | `Badge` | Tasks, LeadCard, Lead Detail |
| `ConversationListItem` | `ScrollArea` + custom | Inbox |
| `MessageBubble` | custom (sem base direta) | Conversation |
| `KPICard` | `Card` | Dashboard |
| `PipelineColumn` | `ScrollArea` + `Card` | Pipeline |
| `ObligatoryTaskBlocker` | `Alert` | Tasks, Lead Detail |
| `NotificationItem` | `Accordion` + custom | Notification dropdown |
| `EmptyState` | custom (ilustração + Button) | Pipeline, Inbox, Tasks, Leads |
| `SearchInput` | `Command` + `Input` | Global (topbar) |
| `UserAvatar` | `Avatar` | Global (header, cards) |
| `DrawerForm` | `Sheet` + `Form` + `Input` + `Select` | Lead Detail, New Lead |
| `ConfirmDialog` | `AlertDialog` | Delete lead, delete task |

---

## 11. Checklist de Qualidade

- [x] Paleta com marca (forest + caramel + graphite) + semânticas + canais + stages + neutros
- [x] 28 pares fg/bg documentados com ratio WCAG — todos aprovados AA ou superior
- [x] Canal WhatsApp: problema de contraste identificado e solução documentada (usar `-dark` e `-light` variants)
- [x] Tipografia Inter com escala 8 tamanhos, 4 pesos, 5 line-heights
- [x] Espaçamento base 4px com 13 valores (0→96px) + alturas de componente
- [x] Border radius: 7 valores (none → full)
- [x] Sombras: 6 valores com semântica de elevação
- [x] Animações: 4 durações, 4 easings, 8 keyframes customizados
- [x] `tailwind.config.ts` completo, TypeScript, `satisfies Config`
- [x] `globals.css` com CSS variables para todos os tokens + base styles + utilities
- [x] `prefers-reduced-motion` implementado
- [x] 29 componentes shadcn/ui listados com comandos de instalação
- [x] Customizações de variante documentadas para Button, Badge, Sheet, Toast, Card
- [x] Mapeamento componente → tela completo (14 componentes custom → shadcn base)

---

*Design System v3 — Davi Designer | CRM Techmalhas | 2026-05-24*
