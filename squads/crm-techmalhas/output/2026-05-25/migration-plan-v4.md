# Plano de Migração v3 → v4 — Para Fábio Fullstack

> **Autor:** Davi Designer · **Data:** 2026-05-25 (rev. pós-decisão Tania)
> **Companion:** `design-system-v4.md` · `globals-css-v4.patch.md` · `wireframes-v4.md`
> **Premissa:** branch separada `feat/design-system-v4` com PR único; Quésia valida ao final; deploy só após aprovação da Tania.
> **Decisões da Tania incorporadas:**
> - ✅ Verde → Preto `#141414` (primary CTA)
> - ❌ Glassmorphism rejeitado (paridade cross-device) → substituído por `.surface-premium` sólida + `.border-gradient-brand`
> - ✅ Dark mode **firmado dentro da v4** (T13 não é opcional)

---

## Estratégia de retrocompatibilidade

Princípio: **fazer o app inteiro mudar de cor com 2 arquivos**, depois polir componente-a-componente sem rush.

| Camada | Estratégia |
|---|---|
| **Tokens HSL** (`globals.css`) | Substituir 100%. Como tudo no app consome via `hsl(var(--primary))`, etc., a mudança propaga sem refactor. |
| **Tokens diretos** (`tailwind.config.ts`) | Manter alias `brand.500 → #141414` durante migração. Remover apenas em v4.1. |
| **Classes literais** (`bg-brand-500`, `text-brand-500`) | Continuam funcionando, mas agora renderizam **preto** em vez de verde. Isto **é o efeito desejado** — não corrigir individualmente. |
| **Fontes** | `next/font` carrega Hind + Inter juntas. `--font-hind` é a primária; `--font-inter` é fallback automático no stack. |
| **Componentes shadcn customizados** (`Button`, `Card`, `Badge`) | Mantém variants antigas. Novas variants (`glass`, `feature`, `gold`) são **opt-in** — código antigo não muda. |

**Resultado:** após T1+T2 (tokens + fonts), o app já está com a paleta v4 funcionando, sem nada quebrar. T3 em diante são refinos.

---

## Tarefas (estimativa total: 14–17h, target 15h)

> **Recalculo pós-decisão Tania:**
> - **−1h** sem glassmorphism (não precisa setup `@supports`, nem testar fallback Safari)
> - **+0h** sage substitui glass com `.surface-premium` no mesmo lugar de classes (mesmo esforço)
> - **+1.5h** dark mode firmado (T13 era opcional v3, agora obrigatório)
> - **Saldo: ~+0.5h** vs estimativa anterior (16h → 15h target, faixa 14–17h)

> Cada Tn tem: o que fazer · arquivos · horas estimadas · critério de "feito".

### T1 — Tokens CSS + Tailwind config

**O que:** aplicar o patch do `globals-css-v4.patch.md` + atualizar `tailwind.config.ts` com os deltas documentados.

**Arquivos:**
- `crm-app/app/globals.css` (substituir 100%)
- `crm-app/tailwind.config.ts` (merge dos deltas)

**Como:**
1. Copiar arquivo completo do patch para `globals.css`.
2. Em `tailwind.config.ts`, fazer merge das chaves `colors.brand`, `fontFamily`, `boxShadow`, `keyframes`, `animation`.
3. Rodar `pnpm typecheck` + `pnpm build` localmente.
4. Abrir o app local e confirmar visualmente: login virou preto, sidebar virou preta, KPI cards mantém forma.

**Critério de feito:** `pnpm build` verde + screenshot do `/pipeline` mostrando primary preto.

**Horas:** **1.5h**

---

### T2 — Configurar fontes Hind + JetBrains Mono via next/font

**O que:** trocar Inter por Hind como primary (mantendo Inter como fallback) e adicionar Mono para KPI.

**Arquivos:**
- `crm-app/app/layout.tsx` (substituir import block)

**Como:**

```typescript
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

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
})

// No <html>:
<html
  lang="pt-BR"
  className={`${hind.variable} ${inter.variable} ${mono.variable}`}
>
```

**Atenção:** o `body` no `globals.css` v4 já usa `font-family: var(--font-hind), var(--font-inter), …`. Sem isso, a fonte volta para fallback do sistema.

**Critério de feito:** abrir DevTools → Computed → `font-family` mostra "Hind" no body.

**Horas:** **0.5h**

---

### T3 — Logo SVG (variants black + white)

**O que:** transformar o logo Techmalhas (atual: PNG remoto na Irroba CDN) em componente React SVG. Permite usar `fill: currentColor` para light/dark mode.

**Arquivos:**
- Criar `crm-app/components/brand/TechmalhasLogo.tsx`
- Atualizar `Sidebar.tsx` e `login/page.tsx` para usar o componente.

**Como:**
1. Extrair SVG do PNG (Davi pode fornecer SVG aproximado se Tania não tiver vetor original — fallback aceitável: typography `<h1 className="font-hind font-bold text-2xl">TECHMALHAS</h1>`).
2. Componente aceita prop `variant: 'mark' | 'full'` e `className` (cor herdada via `currentColor`).
3. Substituir nos 2 callsites.

**Critério de feito:** logo aparece preto na sidebar light, branco no dark.

**Horas:** **2h** (assumindo SVG já obtido; se precisar redesenhar, **+2h**)

> 🔴 **Bloqueio possível:** se Tania não tiver o SVG original do logo, Fábio pode usar fallback typográfico durante migração e abrir issue para receber o vetor depois.

---

### T4 — Refactor `Sidebar.tsx` (surface-premium + ink + tokens novos)

**O que:** substituir as classes literais `bg-brand-500` por tokens da v4, aplicar `.surface-premium`, ativo gold.

**Arquivos:** `crm-app/components/layout/Sidebar.tsx`

**Mudanças (StrReplace por seção):**

```tsx
// 1) Container <aside>: ganha .surface-premium + border-r sutil
<aside className="surface-premium flex h-full w-60 flex-col border-r border-border/60">

// 2) Logo container — bg de brand-500 vira preto explícito
<div className="flex h-16 items-center gap-3 border-b border-border/60 px-6">
  <TechmalhasLogo variant="mark" className="h-8 w-8" />
  <span className="font-hind font-semibold text-foreground">Techmalhas CRM</span>
</div>

// 3) Link ativo — era bg-brand-500 text-white, agora bg-foreground text-background
//    + dot dourado sob ícone
<Link
  className={cn(
    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
    'transition-all duration-fast',
    isActive
      ? 'bg-foreground text-background shadow-ink-glow'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-0.5',
  )}
>
  {item.icon}
  <span>{item.label}</span>
  {isActive && (
    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-gold" />
  )}
</Link>
```

**Critério de feito:** sidebar com `.surface-premium` (inner highlight + sombra sage), item ativo preto com dot dourado, hover suave com `translate-x`.

**Horas:** **1.5h** (−0.5h vs versão com glass — não tem fallback para testar)

---

### T5 — Refactor `Login` (mesh hero + surface-premium-gold card + ink CTA)

**O que:** reescrever a tela de login conforme wireframe 1 — sem glass, com surface sólida premium + border-gradient + sombra gold dupla.

**Arquivos:** `crm-app/app/(auth)/login/page.tsx`

**Mudanças principais:**

```tsx
// Container principal
<div className="relative min-h-screen overflow-hidden bg-hero-mesh">
  {/* 3 orbs animados (pointer-events-none, absolute) — opacidade 25-30% */}
  <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96
                  rounded-full bg-brand-gold/30 blur-3xl animate-orb-drift" />
  <div className="pointer-events-none absolute top-1/3 -right-40 h-[28rem] w-[28rem]
                  rounded-full bg-brand-sage/35 blur-3xl animate-orb-drift-slow" />
  <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80
                  rounded-full bg-brand-terracotta/18 blur-3xl animate-orb-drift" />

  {/* Card SÓLIDO com border-gradient + surface-premium-gold (sem glass) */}
  <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
    <Card className="surface-premium-gold border-gradient-brand w-full max-w-sm rounded-xl">
      <CardHeader>
        <TechmalhasLogo variant="mark" className="mx-auto h-12 w-12" />
        <CardTitle className="text-center font-hind text-2xl font-bold text-foreground">
          CRM Techmalhas
        </CardTitle>
        <CardDescription className="text-center">
          Entre para continuar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleEmailLogin} className="space-y-3">
          {/* inputs com .input-focus-glow + ring-pulse */}
          <Input className="input-focus-glow" />
          {/* botão primary com sombra dupla (gold-glow + ink-shadow) */}
          <Button
            type="submit"
            className="btn-primary-premium w-full bg-foreground text-background
                       hover:bg-foreground/95"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        {/* Botão Google fica outline com hover sage-light */}
        <Button
          variant="outline"
          className="w-full hover:bg-brand-sage-light hover:border-brand-sage/50"
        >
          {/* SVG do Google + texto */}
        </Button>
      </CardContent>
    </Card>
  </div>
</div>
```

**Critério de feito:**
- Mesh visível mas discreto (não ofusca form); 3 orbs animam com `animate-orb-drift`.
- Card **sólido** com inner highlight 3D + sombra gold + border-gradient gold→sage visível.
- CTA preto com **sombra dupla** (gold-glow + ink-shadow) no repouso; hover intensifica.
- Inputs com ring-pulse gold 1× ao focar.
- Lighthouse perf não degrada > 5pts (orbs estão em GPU; sem backdrop-filter = menos custo).

**Horas:** **2.5h** (−0.5h sem glass)

---

### T6 — Refactor `Button` (variants `default` ink premium + `gold` + sombras duplas)

**O que:** atualizar `components/ui/button.tsx` para incluir variantes da v4 — variante `glass` REMOVIDA.

**Arquivos:** `crm-app/components/ui/button.tsx`

**Mudança no `cva`:**

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold ' +
  'font-hind ring-offset-background transition-all duration-fast ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
  'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ' +
  'active:scale-[0.98]',
  {
    variants: {
      variant: {
        // primary: sombra dupla gold+ink desde o repouso, hover intensifica
        default:     'btn-primary-premium bg-foreground text-background hover:bg-foreground/95',
        gold:        'bg-brand-gold text-foreground hover:bg-brand-gold-hover ' +
                     'shadow-gold hover:shadow-gold-lift',
        destructive: 'bg-destructive text-destructive-foreground ' +
                     'hover:bg-destructive/90 hover:shadow-terracotta',
        outline:     'border border-border bg-transparent hover:bg-secondary hover:border-brand-sage/50',
        secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:       'hover:bg-secondary hover:text-foreground',
        link:        'text-foreground underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:        'h-8 px-3 text-xs',
        default:   'h-10 px-4 py-2',
        lg:        'h-12 px-6 text-base',
        icon:      'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)
```

**Critério de feito:** página de teste renderiza as 7 variantes (sem `glass`) sem regressão; primary tem sombra dupla visível em repouso.

**Horas:** **1.5h**

---

### T7 — Refactor `Card` (variants `premium`, `feature`, `elevated`)

**O que:** adicionar variantes da v4 no Card — variante `glass` removida; entram `premium`, `feature`, `elevated`.

**Arquivos:** `crm-app/components/ui/card.tsx`

**Como:**

```tsx
import { cva } from 'class-variance-authority'

const cardVariants = cva(
  'rounded-md text-card-foreground',
  {
    variants: {
      variant: {
        default:  'bg-card border border-border shadow-sm',
        premium:  'surface-premium',
        elevated: 'surface-premium hover:shadow-sage-lift',
        feature:  'surface-premium-gold border-gradient-feature rounded-xl',
        ghost:    'border-transparent shadow-none bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)
```

**Critério de feito:** KPI cards 1-3 do dashboard usam `variant="elevated"`; KPI de receita usa `variant="feature"`; sidebar/drawers usam `variant="premium"`.

**Horas:** **1.5h**

---

### T8 — Refactor Dashboard (KPI cards + stagger elaborado + funnel + KPI glow)

**O que:** aplicar variantes de Card, fonte mono nos números com glow gold no hover, Framer Motion stagger.

**Arquivos:** `crm-app/app/(dashboard)/dashboard/page.tsx` + `components/dashboard/KpiCard.tsx`

**Mudanças:**
1. `<KpiCard variant="elevated">` para 3 primeiros; `variant="feature"` para o de receita.
2. Valor numérico: `<span className="font-kpi font-kpi-glow text-3xl font-semibold">R$ 67.5k</span>` — ganha glow gold ao hover do card (via `.group:hover`).
3. Wrapper KPI grid com Framer Motion: `staggerChildren: 0.05`, item variant `opacity 0 + translateY 16px + scale 0.96 → final` em 220ms.
4. Funnel bars com `scaleX 0 → 1` (transformOrigin left) em 400ms, stagger 80ms por barra.

**Critério de feito:** dashboard carrega com cards entrando em cascata (200ms total); números com tabular-nums; hover de qualquer KPI card mostra glow gold sutil no número + lift -3px.

**Horas:** **2h**

---

### T9 — Refactor Kanban (cards opacos + drawer surface-premium-gold + drag shadow)

**O que:** manter cards do Kanban **opacos** (legibilidade), com hover lift; drawer sólido com surface-premium-gold.

**Arquivos:**
- `crm-app/components/pipeline/KanbanCard.tsx`
- `crm-app/components/pipeline/LeadDetailDrawer.tsx`

**Mudanças KanbanCard:**

```tsx
<motion.div
  layout
  whileHover={{ y: -3, scale: 1.01 }}
  whileDrag={{ scale: 1.03, rotate: 1 }}
  transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
  className={cn(
    'rounded-md border border-border bg-card p-3',
    'shadow-sm transition-all duration-base',
    'hover:shadow-sage-lift',  // ← classe v4: translate -3px + sombra
  )}
  style={isDragging ? { boxShadow: 'var(--shadow-ink-lift, …)' } : {}}
>
  {/* ... */}
</motion.div>
```

**Mudanças LeadDetailDrawer:** `SheetContent` recebe className `surface-premium-gold border-gradient-brand`.

```tsx
<SheetContent
  side="right"
  className="surface-premium-gold border-gradient-brand w-full sm:max-w-[480px]"
>
```

**Critério de feito:** cards levantam 3px no hover com sombra sage; durante drag, sombra ink forte; drawer entra sólido com inner highlight + sombra gold (sem blur).

**Horas:** **2h**

---

### T10 — Refactor Leads list (tabela hover + avatar gradient)

**O que:** aplicar wireframe da Tela 4 — hover row sage-light, avatar gradient, badges preservados.

**Arquivos:** `crm-app/app/(dashboard)/leads/page.tsx` + `components/leads/LeadsTable.tsx`

**Mudanças:**
1. `<TableRow className="hover:bg-brand-sage-light/60 transition-colors duration-fast group">`
2. Avatar com gradient: `<Avatar className="bg-gradient-to-br from-brand-gold-light to-brand-sage" />`
3. Coluna VALOR: `<TableCell className="font-kpi tabular-nums text-right">`
4. ChevronRight aparece com `group-hover:opacity-100 opacity-0` no fim da row.

**Critério de feito:** lista responsiva; mobile vira cards (preservar lógica `block sm:hidden` / `hidden sm:table-row`).

**Horas:** **2h**

---

### T11 — Refactor Chat (bolhas + presence pulse + input focus)

**O que:** aplicar wireframe da Tela 5.

**Arquivos:**
- `crm-app/components/chat/MessageBubble.tsx`
- `crm-app/components/chat/ChatInput.tsx`
- `crm-app/components/chat/ConversationHeader.tsx`

**Mudanças MessageBubble:**

```tsx
// Recebida: sage-light + ink text
const bubbleClass = isReceived
  ? 'bg-brand-sage-light text-foreground rounded-2xl rounded-tl-sm shadow-sm'
  : 'bg-foreground text-background rounded-2xl rounded-tr-sm shadow-sm';
```

**Mudanças ChatInput:**

```tsx
<div className="surface-premium sticky bottom-0 border-t border-border/60 p-3">
  <Input className="input-focus-glow" />
</div>
```

**Mudanças ConversationHeader:**

```tsx
<header className="surface-premium sticky top-0 flex items-center gap-3 border-b border-border/60 p-3 z-10">
  <Avatar ... />
  <div>
    <h2 className="font-hind font-semibold">{lead.name}</h2>
    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-action-success animate-pulse-sage" />
      online
    </p>
  </div>
</header>
```

**Critério de feito:** conversa visualmente diferenciada (recebida sage / enviada ink), presence pulsa, input com ring-pulse gold no focus, header/sidebar sólidos com surface-premium.

**Horas:** **2h** (−0.5h sem glass)

---

### T12 — Skeletons shimmer + Empty/Error states

**O que:** substituir `animate-pulse` por `.skeleton-shimmer` em todos os pontos de loading; adicionar ilustrações sage outline + CTA em empty states.

**Arquivos:**
- `crm-app/components/ui/skeleton.tsx` (override base)
- `crm-app/components/empty-state/*` (criar se não existe)

**Mudança no Skeleton:**

```tsx
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton-shimmer rounded-md', className)} {...props} />
}
```

**Empty state padrão:**

```tsx
export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="rounded-full bg-brand-sage-light p-4 text-brand-sage">{icon}</div>
      <h3 className="font-hind font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
```

**Critério de feito:** todos os pontos de loading shimmer; empty states usam o componente novo.

**Horas:** **2h**

---

### T13 — ThemeToggle (dark mode — **firmado dentro da v4**, não opcional)

**O que:** adicionar toggle no `UserMenu` para alternar entre light/dark. **Status: tarefa obrigatória v4** (Tania confirmou em 2026-05-25).

**Arquivos:**
- Instalar `next-themes` (se ainda não): `pnpm add next-themes`
- `crm-app/components/providers/ThemeProvider.tsx` (criar)
- `crm-app/app/layout.tsx` (wrap com `<ThemeProvider>`)
- `crm-app/components/layout/UserMenu.tsx` (adicionar item)

**Como:**

```tsx
// ThemeProvider.tsx
'use client'
import { ThemeProvider as NextThemes } from 'next-themes'
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemes>
  )
}

// UserMenu.tsx — adicionar item
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

const { theme, setTheme } = useTheme()

<DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
  Tema: {theme === 'dark' ? 'Claro' : 'Escuro'}
</DropdownMenuItem>
```

**Critério de feito:**
- Toggle alterna sem flash de tema errado (FOUC) na primeira carga.
- Preferência persiste em localStorage.
- Default é **light** (decisão `_memory/preferences.md`).
- **Todas as surfaces** (`surface-premium`, `surface-premium-gold`, KPI cards, drawers, mensagens de chat, etc.) renderizam corretamente no dark.
- Matriz de contraste WCAG AA do dark mode (ver `design-system-v4.md` §5) validada com axe DevTools antes do merge.

**Horas:** **1.5h** (firmadas — não opcional)

---

## Ordem de execução recomendada

```
T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12 → T13
└─ tokens     └─ logo     └─ pages base       └─ pages detail    └─ extras
   + fonts      + sidebar    + componentes
              login
```

**Pontos de commit sugeridos:**

| Commit | Tasks | Mensagem |
|---|---|---|
| 1 | T1+T2 | `feat(theme): apply v4 brand tokens (ink/gold/sage) + Hind font` |
| 2 | T3+T4 | `feat(layout): refactor Sidebar with glass + new logo SVG` |
| 3 | T5 | `feat(login): premium mesh hero + glass card + ink CTA` |
| 4 | T6+T7 | `feat(ui): Button & Card variants for v4 design system` |
| 5 | T8 | `feat(dashboard): KPI cards with stagger + mono font for numbers` |
| 6 | T9 | `feat(pipeline): refined hover/drag shadows + glass drawer` |
| 7 | T10 | `feat(leads): table hover with sage tint + avatar gradient` |
| 8 | T11 | `feat(chat): refined bubbles + presence pulse + input glow` |
| 9 | T12 | `feat(ui): shimmer skeletons + empty state component` |
| 10 | T13 | `feat(theme): add dark mode toggle (opt-in, default light)` |

Cada commit deve passar `pnpm typecheck && pnpm build` antes de ser empurrado.

---

## Checklist de QA (para Quésia validar ao final)

### Visual
- [ ] Login com mesh + 3 orbs visíveis mas sem afetar legibilidade do form
- [ ] Sidebar com glassmorphism; item ativo preto com dot dourado
- [ ] Logo Techmalhas correto em light (preto) e dark (branco)
- [ ] Dashboard KPI cards entram com stagger (visual de cascata)
- [ ] KPI de receita destacado com gradient + glow gold
- [ ] Funnel chart com bar "Ganho" em gold
- [ ] Kanban cards opacos (não glass), hover levanta + sombra sage
- [ ] Drawer de detalhe de lead com glass + blur
- [ ] Tabela de Leads com hover sage-light + chevron no fim
- [ ] Chat: bolhas recebida sage / enviada ink, presence pulse, input glow

### Tipografia
- [ ] Body usa Hind (DevTools: Computed → font-family)
- [ ] KPI values com `font-kpi` (JetBrains Mono, tabular-nums)
- [ ] Heading h1/h2 com Hind 700 e tracking-tight

### Acessibilidade
- [ ] Contraste texto principal: 18.7:1 ✅
- [ ] Botão primary (white sobre ink): 18.7:1 ✅
- [ ] Botão Google (outline) visível em hover sage-light
- [ ] Focus ring gold visível em todos os botões/inputs ao Tab
- [ ] `prefers-reduced-motion`: orbs/shimmer/pulse desligam
- [ ] Touch targets ≥ 44px no mobile (sidebar drawer, bottom nav, cards)
- [ ] Screen reader anuncia presence "online" (não só visual)
- [ ] Dark mode: contrast check com axe DevTools

### Performance
- [ ] Lighthouse Performance > 85 (mobile)
- [ ] Lighthouse Accessibility = 100
- [ ] First Contentful Paint < 2s
- [ ] Cumulative Layout Shift < 0.05 (Hind tem `display: swap`)
- [ ] Orbs do login não causam jank ao scroll (GPU layers verificadas)

### Funcional (não-regressão)
- [ ] Login com email/password funciona
- [ ] Login com Google funciona
- [ ] Pipeline drag-drop preserva ordem
- [ ] Drawer de detalhe abre/fecha
- [ ] Chat envia mensagem (botão ➤)
- [ ] Theme toggle persiste após reload

### Browsers
- [ ] Chrome 122+ (desktop + mobile)
- [ ] Safari 17+ (iPhone Vitor)
- [ ] Firefox 124+ (fallback `@supports` glass funciona)
- [ ] Edge 122+

---

## Riscos técnicos a observar

1. **Layout shift por troca de fonte:** Hind tem métricas diferentes de Inter. Fábio deve testar especialmente o login e botões com texto longo. Mitigação: `display: 'swap'` já configurado; fallback Inter tem stack próximo.

2. ~~Performance de `backdrop-filter`~~ ✅ **RISCO ELIMINADO** — glassmorphism foi rejeitado pela Tania. Paridade cross-device 100% garantida.

3. **Conflito de `ring-pulse` gold com inputs em foco contínuo:** o pulse é 1×, 600ms — não infinito. Se Vitor digitar muito no Chat input, o ring estabiliza após o pulse inicial. Validar em sessão de uso real de 10 min. Mitigação extra: `prefers-reduced-motion` desliga o pulse.

4. **Dark mode FOUC** (Flash of Unstyled Content): `next-themes` configurado com `attribute="class"` pode flickerar entre temas no primeiro paint. Mitigação: `<script>` inline no `<head>` que aplica a classe antes do React hidratar (next-themes faz isso por padrão se setado corretamente).

5. **Inner highlight branca no dark mode:** sem ajuste, a linha branca de `.surface-premium` no dark fica esquisita. Já mitigado no CSS: `.dark .surface-premium` troca para inner-highlight gold sutil (12% opacidade).

---

## Estimativa total

| Faixa | Cenário |
|---|---|
| **14h** | Tudo correr bem, SVG do logo disponível, dark mode sem FOUC, sem regressões |
| **15h** | **Estimativa target** (inclui buffer pequeno para resolver 1-2 quirks) |
| **17h** | Pior caso (logo precisa redesenhar OU dark mode tem FOUC OU border-gradient renderiza diferente em Firefox) |

**Recomendação:** alocar **15h** (~2 dias úteis do Fábio). T13 (dark mode) é firmado — não pode ser cortado.

**Soma analítica das horas:**

| T | Tarefa | Horas |
|---|---|---|
| T1 | Tokens CSS + Tailwind config | 1.5 |
| T2 | Configurar fontes Hind + Mono | 0.5 |
| T3 | Logo SVG (variants) | 2.0 |
| T4 | Sidebar (surface-premium) | 1.5 |
| T5 | Login (mesh + premium-gold + ink CTA) | 2.5 |
| T6 | Button variants | 1.5 |
| T7 | Card variants | 1.5 |
| T8 | Dashboard (KPI stagger + glow) | 2.0 |
| T9 | Kanban (cards + drawer) | 2.0 |
| T10 | Leads (table hover + avatar) | 2.0 |
| T11 | Chat (bolhas + presence + input glow) | 2.0 |
| T12 | Skeletons (shimmer gold) + Empty/Error | 2.0 |
| T13 | Dark mode toggle (firmado) | 1.5 |
| **Soma** | | **22.5h brutas** |
| **Concorrência/reuso** | (estimativa Davi: 30% de tarefas se sobrepõem em refactors compartilhados) | **−7.5h** |
| **Estimativa target** | | **~15h** |

> O `21.5h - 30%` é estimativa conservadora baseada em reuso de tokens e componentes shadcn (uma vez que `Button` é atualizado, todos os 12+ call-sites herdam a mudança sem refactor adicional).

---

*Plano de migração v4 — Davi Designer | 2026-05-25 (rev. pós-decisão Tania)*
