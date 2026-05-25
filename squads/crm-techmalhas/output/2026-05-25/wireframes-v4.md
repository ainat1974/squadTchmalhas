# Wireframes v4 — Telas-Chave do CRM Techmalhas

> **Autor:** Davi Designer · **Data:** 2026-05-25 (rev. pós-decisão Tania)
> **Companion de:** `design-system-v4.md`
> **Telas cobertas:** Login · Dashboard · Pipeline Kanban · Leads (lista) · Chat (Amanda)
> **Breakpoints:** mobile 375px, desktop 1280px
> **Decisão Tania:** glassmorphism rejeitado. Todas as surfaces "premium" usam `.surface-premium` sólida + `.border-gradient-brand` + hover lift.

---

## Convenções de notação

```
┌─┐  contorno de surface sólida (card, drawer) — todas usam .surface-premium
╔═╗  contorno com border-gradient brand (gold→sage) — surface de destaque
     OBS: no login, o ╔═╗ outer representa apenas o viewport com bg-hero-mesh
          (não é uma surface — é o "palco"). O ╔═╗ inner (volta do form)
          é o card real com .border-gradient-brand.
┃    sidebar / divider vertical
░░   gradient mesh / orb glow (login)
▓▓   skeleton shimmer (com tint dourado-sutil)
●    dot indicador (canal, presence)
◐    avatar (gradient sage→gold)
─    border / divider
[XX] botão / chip
{XX} input / select
↑    micro-interação hover (translate-y -3px + sombra lift)
✦    sombra colorida (gold/sage/ink-glow)
✧    inner highlight 3D (linha branca topo)
```

---

# Tela 1 — Login

## 1.1 Intenção UX

O login é a única tela em que o usuário entra "frio" no produto. É onde a marca deve dar boas-vindas e estabelecer **competência**. A camada futurista (mesh + orbs + card premium com border-gradient gold→sage + shadow-gold dupla) trabalha aqui, mas a hierarquia funcional permanece: campo email → senha → CTA → "ou Google". Sem glassmorphism — card é sólido, ganha sensação de "objeto físico" via sombra colorida + inner highlight.

## 1.2 Desktop 1280px

```
╔═══════════════════════════════════════════════════════════════════════╗
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░ ⊙ orb-gold ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░░░░░░░░░░    ╔═══════════════════════════════════╗   ░░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║                                    ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   ┌─────┐                          ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   │  T  │  ← logo Techmalhas       ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   │ ink │     (variant black)      ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   └─────┘                          ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║                                    ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   CRM Techmalhas                   ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   Entre para continuar             ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║                                    ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   E-mail                           ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   { vitor@techmalhas.com.br      } ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║                                    ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   Senha                            ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   { ••••••••••••••       👁     } ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║                                    ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   [    Entrar    ]✦ ← shadow-ink   ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║                                    ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   ────  ou continue com  ────      ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║                                    ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   [ G  Continuar com Google     ] ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║      └ outline, hover sage tint   ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║                                    ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ║   Esqueceu a senha?  Recuperar     ║   ░░░░░░░░░░║
║░░░░░░░░░░░░░░    ╚═══════════════════════════════════╝   ░░░░░░░░░░║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ⊙ orb-sage ░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║                                                                       ║
║      Techmalhas · há 30 anos no varejo de moda íntima brasileira      ║
╚═══════════════════════════════════════════════════════════════════════╝
```

## 1.3 Mobile 375px

```
╔════════════════════════════════╗
║░░░░░ ⊙ orb-gold (top) ░░░░░░░░║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║                                ║
║       ┌─────┐                  ║
║       │  T  │  ← logo ink      ║
║       └─────┘                  ║
║                                ║
║       CRM Techmalhas           ║
║       Entre para continuar     ║
║                                ║
║ ╔════════════════════════════╗ ║
║ ║                            ║ ║
║ ║ E-mail                     ║ ║
║ ║ {                       }  ║ ║
║ ║                            ║ ║
║ ║ Senha                      ║ ║
║ ║ {                    👁  } ║ ║
║ ║                            ║ ║
║ ║ [     Entrar         ]✦    ║ ║
║ ║                            ║ ║
║ ║ ──  ou continue com  ──    ║ ║
║ ║                            ║ ║
║ ║ [ G    Google           ]  ║ ║
║ ║                            ║ ║
║ ║ Esqueceu a senha?          ║ ║
║ ╚════════════════════════════╝ ║
║                                ║
║░░░░░ ⊙ orb-sage (bottom) ░░░░░║
╚════════════════════════════════╝
```

## 1.4 Tokens usados

| Token | Onde |
|---|---|
| `.bg-hero-mesh` | Container do `<main>` |
| `.surface-premium-gold` + `.border-gradient-brand` | **Card do form** (sólido, com inner highlight + sombra gold) |
| `.btn-primary-premium` | Botão "Entrar" — sombra dupla (gold-glow + ink-shadow) no repouso |
| `--brand-ink` + `--brand-paper` | Botão "Entrar" (bg ink, text paper) |
| `.shadow-ink-lift` (no hover via transition) | "Entrar" levanta 2px com sombra +40% |
| `.input-focus-glow` + `.ring-pulse` | Inputs com glow gold + pulse 1× ao focar |
| `.animate-orb-drift` / `.animate-orb-drift-slow` | 2 orbs gold + 1 orb sage + 1 orb terracota (mais marcantes — opacidade 25-30%) |
| `--font-hind` weight 700 | "CRM Techmalhas" headline |
| Botão Google: `variant="outline"` + `hover:bg-brand-sage-light` | CTA secundário |

## 1.5 Microinterações

1. **Mount:** orbs entram com `opacity 0 → 0.3` em 600ms; card sólido entra com fade + `translateY 12px → 0` em 250ms; sombra gold se materializa no fim da animação.
2. **Input focus:** `.input-focus-glow` aplica ring gold + pulse 1× (600ms ring-pulse animation, depois estabiliza).
3. **Botão "Entrar" hover:** `.btn-primary-premium:hover` → `translateY(-2px)` + sombra dupla intensifica em 150ms.
4. **Botão "Entrar" loading:** trocar texto por spinner Lucide 16px + texto "Entrando…"; manter altura para evitar layout shift.
5. **Erro de credencial:** input com border `--action-danger`, shake horizontal 200ms (`translateX ±4px ×3`), mensagem abaixo do form.

## 1.6 Estados

| Estado | Visual |
|---|---|
| Default | Conforme acima |
| Loading (submit) | Botão "Entrando…" + spinner; inputs `disabled` com opacidade 50% |
| Error | Toast no top-right + inline message vermelha; campo com border terracota |
| Success | Redirect imediato para `/pipeline` (sem celebração — vendedor quer trabalhar) |

---

# Tela 2 — Dashboard

## 2.1 Intenção UX

Primeira tela após login (para gestores). KPIs com peso visual via `.surface-premium` (3 primeiros) e `.surface-premium-gold + .border-gradient-feature` (o de Receita, com hierarquia visual elevada); gráfico de funil claro; lista "Top 5 leads quentes" abaixo. Stagger de entrada (50ms entre cards) cria sensação de "carregamento orgânico" sem ser teatral. KPI numbers em JetBrains Mono com `.font-kpi-glow` — ganha glow gold sutil ao hover.

## 2.2 Desktop 1280px

```
┌────────┬──────────────────────────────────────────────────────────────────┐
│┌──────┐│  ┌─────────────────────────────────────────────────────────────┐│
││ side ││  │ Dashboard                              [Filtro: 7 dias  ▾] ││
││ ✧hi  ││  └─────────────────────────────────────────────────────────────┘│
││ prem ││                                                                  │
││ T    ││  ┌──────────┐ ┌──────────┐ ┌──────────┐ ╔══════════╗            │
││      ││  │ ↑ stagger│ │ +50ms    │ │ +100ms   │ ║ +150ms   ║            │
││▓Dash ││  │ Leads    │ │ Pipeline │ │ Conv.    │ ║ Receita  ║            │
││ Pipe ││  │ novos    │ │ ativo    │ │ rate     │ ║ no mês   ║            │
││ Lead ││  │ ✧hi 3D   │ │ ✧hi 3D   │ │ ✧hi 3D   │ ║ ✦ gold   ║            │
││ Chat ││  │  47      │ │  R$182k  │ │  18.4%   │ ║ R$ 67.5k ║            │
││ Tasks││  │  ↑12%    │ │  ↑8%     │ │  ↓2%     │ ║  ↑34%    ║            │
││ Conf ││  │ font-kpi │ │ font-kpi │ │ font-kpi │ ║ font-kpi-║            │
││      ││  │ -glow    │ │ -glow    │ │ -glow    │ ║ glow     ║            │
││      ││  │ surface- │ │ surface- │ │ surface- │ ║ surface- ║            │
││      ││  │ premium  │ │ premium  │ │ premium  │ ║ premium- ║            │
││      ││  │          │ │          │ │          │ ║ gold +   ║            │
││      ││  │  sage    │ │  sage    │ │  sage    │ ║ border-  ║            │
││      ││  │  shadow  │ │  shadow  │ │  shadow  │ ║ gradient ║            │
││      ││  └──────────┘ └──────────┘ └──────────┘ ╚══════════╝            │
││      ││                                                                  │
││      ││  ┌─────────────────────────────┐  ┌────────────────────────────┐│
││      ││  │ Funil de conversão          │  │ Top 5 leads quentes        ││
││      ││  │ surface-premium             │  │ surface-premium            ││
││◐Vitor││  │  Novo     ▓▓▓▓▓▓▓▓▓▓▓ 240   │  │ ◐ Loja Sul Boutique        ││
│└──────┘│  │  Contato  ▓▓▓▓▓▓▓▓ 175      │  │   R$ 2.450 · ● WA · 2d     ││
│        │  │  Proposta ▓▓▓▓▓ 89          │  │ ─────────────────────────  ││
│        │  │  Negoc.   ▓▓▓ 42            │  │ ◐ Moda da Mile             ││
│        │  │  Ganho    ▓▓ 23   ← gold    │  │   R$ 5.890 · ● IG · 4h     ││
│        │  │           gradient diagonal │  │ ─────────────────────────  ││
│        │  │                             │  │ ◐ Atacadão Roupas          ││
│        │  └─────────────────────────────┘  │   R$ 1.890 · ● WC · 1d     ││
│        │                                   └────────────────────────────┘│
└────────┴──────────────────────────────────────────────────────────────────┘
```

## 2.3 Mobile 375px

```
┌────────────────────────────┐
│ ☰  Dashboard       🔔 ◐   │  ← header surface-premium sticky
├────────────────────────────┤
│ [Filtro: 7 dias        ▾] │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ Leads novos      ↑12%  │ │  ← surface-premium + sage shadow
│ │ 47                     │ │     font-kpi-glow (gold no hover)
│ │ ✧ inner highlight 3D   │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Pipeline ativo    ↑8%  │ │
│ │ R$ 182k                │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Conv. rate       ↓2%   │ │
│ │ 18.4%                  │ │
│ └────────────────────────┘ │
│ ╔════════════════════════╗ │
│ ║ Receita no mês  ↑34%   ║ │  ← surface-premium-gold
│ ║ R$ 67.5k    ✦          ║ │   + border-gradient-feature
│ ╚════════════════════════╝ │

│                            │
│ Funil de conversão         │
│ Novo       ▓▓▓▓▓▓▓▓ 240   │
│ Contato    ▓▓▓▓▓ 175      │
│ Proposta   ▓▓▓ 89         │
│ Negoc.     ▓▓ 42          │
│ Ganho      ▓ 23  gold      │
│                            │
│ Top 5 quentes              │
│ ◐ Loja Sul · R$ 2.4k · WA │
│ ◐ Moda Mile · R$ 5.9k · IG│
│ ◐ Atacadão · R$ 1.9k · WC │
└────────────────────────────┘
[Bottom nav fixa]
```

## 2.4 Tokens usados

| Token | Onde |
|---|---|
| `.surface-premium` | Sidebar desktop, header sticky mobile, KPI cards 1–3, Funnel, Top 5 |
| `.shadow-sage` → `.shadow-sage-lift` (hover) | KPI cards 1–3 (leitura/operação) |
| `.surface-premium-gold` + `.border-gradient-feature` | KPI 4 (Receita = destaque emocional) |
| `.shadow-gold` → `.shadow-gold-lift` (hover) | KPI 4 e cards de destaque |
| `.font-kpi` + `.font-kpi-glow` | Valores numéricos dos KPIs (mono + glow gold no hover) |
| `--brand-gold` | Stage "Ganho" no funil, indicador ↑ positivo |
| `--brand-terracotta` | Indicador ↓ negativo (Conv. rate -2%) |
| `--action-success` | Indicador ↑ neutro/positivo |
| `--brand-sage-light` | Hover de linha em "Top 5" |
| Framer Motion `staggerChildren: 50ms` | Entrada dos KPI cards (mais elaborado: 5 estágios) |

## 2.5 Microinterações

1. **Mount:** KPI cards entram com stagger 50ms + entrada elaborada — `opacity 0 + translateY 16px → 0` com `scale 0.96 → 1` (4 cards = 200ms total, sensação de "se assentar").
2. **KPI hover:** `.shadow-sage-lift` aplica `translateY(-3px)` + sombra +40% em 180ms; número ganha `.font-kpi-glow` (text-shadow gold 18px).
3. **KPI Receita hover:** sombra gold mais intensa (`.shadow-gold-lift`); border-gradient ganha leve animação de brilho diagonal (opcional T8.b).
4. **Funil bars:** entrada com `scaleX 0 → 1` em 400ms (transformOrigin left), uma a uma com 80ms de stagger.
5. **Top 5 row hover:** background fade para `--brand-sage-light` em 120ms + chevron `›` aparece com fade.
6. **Filtro (Popover):** abertura com fade + slide 200ms; popover usa `.surface-premium`.

## 2.6 Estados

| Estado | Visual |
|---|---|
| Loading | Skeletons shimmer nos 4 KPI cards (mesma altura), barras do funil cinza, lista com 5 skeletons |
| Empty | KPI mostra "0" + texto "Sem dados no período"; funil colapsado mostra mensagem |
| Error | Banner sage-light no topo: "Erro ao carregar. Retentar →" |

---

# Tela 3 — Pipeline Kanban

## 3.1 Intenção UX

Tela de uso mais intensivo. Densidade alta — sidebar e header usam `.surface-premium` sólida (sem glass). Cards Kanban são **opacos com sombra leve** (legibilidade > delight); ganham `.shadow-sage-lift` (translate -3px) só no hover. Drawer de lead detail também é sólido (`.surface-premium-gold`) com slide-in 250ms. Drag-and-drop preservado.

## 3.2 Desktop 1280px

```
┌────────┬──────────────────────────────────────────────────────────────────┐
│┌──────┐│ ┌───────────────────────────────────────────────────────────┐   │
││ side ││ │ Pipeline · Atacado ▾    Buscar lead 🔍    [+ Novo lead]✦ │   │
││ ✧hi  ││ │ surface-premium sticky                                    │   │
││ prem ││ └───────────────────────────────────────────────────────────┘   │
││      ││                                                                 │
││▓Pipe ││ ┌──────────┬──────────┬──────────┬──────────┬─────────┬───────┐│
││      ││ │ NOVO     │ CONTATO  │ PROPOSTA │ NEGOC.   │ GANHO   │PERDIDO││
││      ││ │ (12)     │ (8)      │ (5)      │ (3)      │ (2)     │ (1)   ││
││      ││ │ gray bg  │ blue bg  │ amber bg │ orange bg│ green   │ red   ││
││      ││ │  v3      │  v3      │   v3     │  v3      │  v3     │  v3   ││
││      ││ ├──────────┼──────────┼──────────┼──────────┼─────────┼───────┤│
││      ││ │┌────────┐│┌────────┐│┌────────┐│┌────────┐│┌──────┐ │┌─────┐││
││      ││ ││Loja Sul││Atacadão││Moda Mile││Boutique││Maxima│ ││Lojas│││
││      ││ ││R$ 2.4k ││R$ 1.8k ││R$ 5.9k ││R$ 12k  ││R$ 8k │ ││R$3k │││
││      ││ ││◐ Vitor ││◐ Ana   ││◐ Vitor ││◐ Vitor ││◐ Ana │ ││◐ Vi │││
││      ││ ││● WA    ││● WC    ││● IG    ││● WA    ││● WA  │ ││● IG │││
││      ││ ││★ gold  ││        ││        ││⚠ task  ││✓ won │ ││✗ los│││
││      ││ ││ hover  ││        ││        ││ today  ││ gold │ ││      │││
││      ││ ││ ↑lift  ││        ││        ││        ││shadow│ ││      │││
││      ││ │└────────┘│└────────┘│└────────┘│└────────┘│└──────┘ │└─────┘││
││      ││ │┌────────┐│┌────────┐│┌────────┐│┌────────┐│         │       ││
││      ││ ││Centro  ││...     ││...     ││...     ││         │       ││
││      ││ ││R$ 3.2k ││        ││        ││        ││         │       ││
││      ││ │└────────┘│└────────┘│└────────┘│└────────┘│         │       ││
││◐Vitor││ │   ...    │   ...    │   ...    │          │         │       ││
│└──────┘│ └──────────┴──────────┴──────────┴──────────┴─────────┴───────┘│
└────────┴──────────────────────────────────────────────────────────────────┘
                                                              ← drawer slide
                                                              ┌────────────┐
                                                              │ surface-   │
                                                              │ premium-   │
                                                              │ gold       │
                                                              │ ✧ inner hi │
                                                              │ Loja Sul   │
                                                              │ ...        │
                                                              └────────────┘
```

## 3.3 Mobile 375px

```
┌────────────────────────────┐
│ ☰  Pipeline  [Atacado ▾]  │ ← surface-premium sticky
├────────────────────────────┤
│ 🔍 Buscar           [+]   │
├────────────────────────────┤
│ ◀  NOVO (12)        ▶     │  ← swipe horizontal entre colunas
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ Loja Sul Boutique  ★   │ │  ← KanbanCard opaco, shadow-sm
│ │ R$ 2.450               │ │     hover → shadow-sage-lift
│ │ ◐ Vitor   ● WA   2d    │ │     font-kpi no valor
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Centro Atacado         │ │
│ │ R$ 3.200               │ │
│ │ ◐ Vitor   ● WA   1d    │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Moda Sul    ⚠ vencida  │ │  ← warning sutil
│ │ R$ 4.100               │ │
│ │ ◐ Ana    ● IG    5h    │ │
│ └────────────────────────┘ │
│ ▓▓ shimmer skeleton ▓▓     │  ← scroll infinito loading
└────────────────────────────┘
[Bottom nav fixa: Pipe Lead Chat Tar +]
```

## 3.4 Tokens usados

| Token | Onde |
|---|---|
| `.surface-premium` | Sidebar desktop, header sticky com filtro + busca |
| `.surface-premium-gold` + `.border-gradient-feature` | Drawer de lead detail (slide-in right) |
| **`bg-card` opaco + `shadow-sm`** | KanbanCards em repouso (densidade > delight) |
| `bg-stage-*-bg` (v3) | Cabeçalho de cada coluna (preservado) |
| `--brand-gold` ★ | Star de "lead destacado/quente" |
| `--action-warning` | Badge "⚠ tarefa vencida" |
| `.shadow-sage-lift` (hover) | Card em hover: translate -3px + sombra sage |
| `.shadow-ink-lift` (drag) | Card sendo arrastado: translate -2px + sombra ink intensa |
| Framer Motion `layout` + spring | Card mudando de coluna após drop |
| `.font-kpi` | Valor R$ no card (mono + tabular-nums) |

## 3.5 Microinterações

1. **Card hover (desktop):** `.shadow-sage-lift` aplica `translateY(-3px)` + sombra sage em 180ms.
2. **Drag start:** card eleva com `.shadow-ink-lift`, escala 1.02, cursor `grabbing`.
3. **Drag over column:** coluna alvo recebe outline 2px gold pulsante (1s ease, com `.animate-pulse-sage`).
4. **Drop:** card aterrissa com Framer Motion `layout` + spring easing (`--easing-spring`).
5. **Tap card mobile:** drawer entra `slide-in-right 250ms` com `.surface-premium-gold` sólido (sem glass).
6. **Swipe coluna mobile:** indicador `◀▶` dá feedback de scroll com fade da seta inativa.
7. **Skeleton scroll infinito:** 3 `.skeleton-shimmer` cards (tint dourado) aparecem no fim da coluna ao chegar a 80% do scroll.
8. **Mount inicial:** colunas entram com stagger 80ms; primeiros 8 cards visíveis por coluna entram com stagger 30ms (resto entra direto — performance).

## 3.6 Estados

| Estado | Visual |
|---|---|
| Loading inicial | 3 shimmer cards por coluna |
| Empty (coluna sem deals) | Ilustração sage + "Nenhum deal aqui" + "[+ Criar lead]" |
| Drag rejected | Card volta com `spring` reverso + toast "Não é possível mover para Ganho sem tarefas concluídas" terracota |
| Error de save | Card pisca terracota 2× + toast retry |

---

# Tela 4 — Leads (lista)

## 4.1 Intenção UX

Vista "tabular" para consulta densa. Linhas alternadas? **Não** — usar hover row + dividers sage-light. Avatar circular com gradient gold→sage para visualidade sem ruído. Header sticky e sidebar usam `.surface-premium`.

## 4.2 Desktop 1280px

```
┌────────┬──────────────────────────────────────────────────────────────────┐
│┌──────┐│ ┌────────────────────────────────────────────────────────────┐  │
││ side ││ │ Leads · 247 ativos   🔍 buscar   [Filtros ▾]  [+ Novo]    │  │
││ ✧hi  ││ │ surface-premium sticky                                     │  │
││ prem ││ └────────────────────────────────────────────────────────────┘  │
││▓Leads││                                                                 │
││      ││ ┌──────────────────────────────────────────────────────────────┐│
││      ││ │ □ NOME ↕            CANAL    STAGE         VENDEDOR    VALOR ││
││      ││ ├──────────────────────────────────────────────────────────────┤│
││      ││ │ □ ◐ Loja Sul       ● WA     [Negociação]  ◐ Vitor    R$ 2.4k││
││      ││ │   hover sage-light row                          font-kpi     ││
││      ││ ├──────────────────────────────────────────────────────────────┤│
││      ││ │ □ ◐ Moda da Mile   ● IG     [Proposta  ]  ◐ Vitor    R$ 5.9k││
││      ││ ├──────────────────────────────────────────────────────────────┤│
││      ││ │ □ ◐ Atacadão R.    ● WC     [Novo Lead ]  ◐ Ana      R$ 1.9k││
││      ││ ├──────────────────────────────────────────────────────────────┤│
││      ││ │ □ ◐ Boutique Bia   ● WA     [Ganho     ]  ◐ Vitor    R$  12k││
││      ││ │     ★ gold                                       ↑ ganho     ││
││      ││ ├──────────────────────────────────────────────────────────────┤│
││      ││ │ □ ◐ Modas Centro   ● WA     [Contato   ]  ◐ Ana      R$ 3.2k││
││      ││ ├──────────────────────────────────────────────────────────────┤│
││      ││ │ ▓▓▓▓▓▓▓▓▓▓▓ skeleton-shimmer (gold tint) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││
││◐Vitor││ └──────────────────────────────────────────────────────────────┘│
│└──────┘│ ────────────────────────────────────────────────────────────────│
│        │ Mostrando 1–25 de 247         [◀ Anterior] [Próxima ▶]            │
└────────┴──────────────────────────────────────────────────────────────────┘
```

## 4.3 Mobile 375px

```
┌────────────────────────────┐
│ ☰  Leads · 247       🔍   │ ← surface-premium sticky
├────────────────────────────┤
│ [Filtros: WA, Negoc.   ▾] │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ ◐ Loja Sul Boutique    │ │  ← LeadCard mobile (surface-premium)
│ │   ● WA  [Negociação]   │ │     hover → shadow-sage-lift
│ │   ◐ Vitor    R$ 2.4k   │ │     ✧ inner highlight 3D
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ ◐ Moda da Mile     ★   │ │
│ │   ● IG  [Proposta  ]   │ │
│ │   ◐ Vitor    R$ 5.9k   │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ ◐ Atacadão Roupas      │ │
│ │   ● WC  [Novo Lead ]   │ │
│ │   ◐ Ana      R$ 1.9k   │ │
│ └────────────────────────┘ │
│ ▓▓ skeleton ▓▓             │
│ [Mostrar mais (224)    ↓] │
└────────────────────────────┘
[Bottom nav fixa]
```

## 4.4 Tokens usados

| Token | Onde |
|---|---|
| `.surface-premium` | Header sticky com filtros, sidebar, LeadCards mobile |
| `--brand-sage-light` | Hover row |
| `--brand-gold` ★ | Estrela de "lead quente" |
| Avatar gradient `from-brand-gold-light to-brand-sage` | Círculo com iniciais |
| Badge `stage-*` (v3 preservado) | Coluna STAGE |
| Badge `channel-*` dot (v3) | Coluna CANAL |
| `.font-kpi` | Coluna VALOR (mono + tabular-nums) |
| `--brand-paper` | Background da tabela (limpo) |
| `.skeleton-shimmer` (gold tint) | Loading rows |
| `.shadow-sage-lift` (hover, mobile cards) | LeadCard mobile no toque |

## 4.5 Microinterações

1. **Row hover:** background fade para sage-light em 120ms; chevron `›` aparece no fim da row.
2. **Click row:** drawer slide-in-right 250ms com `.surface-premium-gold` sólido.
3. **Sort column:** seta ↕ rotaciona suavemente, header pisca gold 200ms.
4. **Bulk select (checkbox header):** todos os checks animam em cascata 30ms cada.
5. **Filtro popover:** abertura com fade + slide 200ms.

## 4.6 Estados

| Estado | Visual |
|---|---|
| Loading | 8 skeleton rows shimmer |
| Empty (sem filtro) | Ilustração sage + "Nenhum lead ainda" + "[+ Criar primeiro lead]" |
| Empty (com filtro) | "Nenhum resultado para esses filtros. [Limpar filtros]" |
| Error | Banner sage-light topo + retry |

---

# Tela 5 — Chat (Amanda — WhatsApp Inbox)

## 5.1 Intenção UX

Tela de **comunicação ao vivo**. Sidebar de conversas, header da conversa e input sticky usam `.surface-premium` sólida (sem glass). Bolhas com sombra sutil. Indicador de presença pulsante (`.animate-pulse-sage`). Input sticky com `.input-focus-glow` + `ring-pulse` animado.

## 5.2 Desktop 1280px

```
┌────────┬─────────────────────────┬────────────────────────────────────────┐
│┌──────┐│┌───────────────────────┐│┌──────────────────────────────────────┐│
││ side ││ Conversas · 12 abertas │ ◐ Loja Sul Boutique  ● online        ││
││ ✧hi  ││ 🔍 buscar              │   ● WA · ◐ Vitor      [Detalhes ▾]   ││
││ prem ││└───────────────────────┘│└──────────────────────────────────────┘│
││▓Chat ││┌───────────────────────┐│                                        │
││      ││◐ Loja Sul     ●  2m   ││           Hoje, 14:23                  │
││      ││  Tá com 20% de        ││  ┌───────────────────────────────┐    │
││      ││  desconto? [active]   ││  │ Tá com 20% de desconto?       │    │
││      ││├──────────────────────┤│  │                       14:23 ✓ │    │
││      ││◐ Moda Mile    ●  15m  ││  └───────────────────────────────┘    │
││      ││  Vou fechar amanhã    ││         ← bolha recebida (sage-light) │
││      ││├──────────────────────┤│                                        │
││      ││◐ Atacadão     ●  1h   ││                ┌─────────────────────┐│
││      ││  Obrigado!            ││                │ Olá! Sim, no atacado││
││      ││├──────────────────────┤│                │ acima de 10 peças.  ││
││      ││◐ Boutique Bia   3h    ││                │            14:24 ✓✓ ││
││      ││  Visto                ││                └─────────────────────┘│
││      ││├──────────────────────┤│                  ← bolha enviada (ink)│
││      ││ ...                   ││                                        │
││      ││                       ││  ┌───────────────────────────────┐    │
││      ││└──────────────────────┘│  │ ◐ digitando... pulse-sage      │   │
││      ││                        │  └───────────────────────────────┘    │
││      ││                        │                                        │
││◐Vitor││                        │┌──────────────────────────────────────┐│
│└──────┘│                        │ surface-premium sticky                 ││
│        │                        │ {📎  Mensagem...           😀  ➤  }   ││
│        │                        │└──────────────────────────────────────┘│
└────────┴─────────────────────────┴────────────────────────────────────────┘
                                            ↑ input-focus-glow + ring-pulse
```

## 5.3 Mobile 375px

### Lista de conversas

```
┌────────────────────────────┐
│ ☰ Chat · 12        🔍     │  ← surface-premium sticky
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ ◐ Loja Sul     ● 2m    │ │
│ │   Tá com 20% de desco… │ │
│ │   ● WA                 │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ ◐ Moda Mile    ● 15m   │ │
│ │   Vou fechar amanhã    │ │
│ │   ● IG                 │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ ◐ Atacadão Roupas      │ │
│ │   Obrigado! Tudo certo │ │
│ │   ● WC          1h     │ │
│ └────────────────────────┘ │
│ ...                        │
└────────────────────────────┘
[Bottom nav]
```

### Conversa aberta

```
┌────────────────────────────┐
│ ← ◐ Loja Sul  ● online    │  ← surface-premium sticky
│   ● WA  ◐ Vitor    ⋯      │
├────────────────────────────┤
│        Hoje, 14:23         │
│                            │
│ ┌──────────────────────┐   │
│ │ Tá com 20% de descon-│   │
│ │ to no atacado?       │   │
│ │              14:23 ✓ │   │
│ └──────────────────────┘   │
│ ← sage-light, ink text     │
│                            │
│   ┌──────────────────────┐ │
│   │ Olá! Sim, no atacado │ │
│   │ acima de 10 peças.   │ │
│   │           14:24 ✓✓   │ │
│   └──────────────────────┘ │
│   → ink bg, paper text     │
│                            │
│ ┌──────────────────────┐   │
│ │ ◐ digitando…  pulse  │   │
│ └──────────────────────┘   │
│                            │
├────────────────────────────┤
│ ┌────────────────────────┐ │  ← surface-premium sticky
│ │ 📎 {Mensagem…    😀 ➤} │ │     input-focus-glow + ring-pulse
│ └────────────────────────┘ │
└────────────────────────────┘
```

## 5.4 Tokens usados

| Token | Onde |
|---|---|
| `.surface-premium` | Sidebar de conversas, header da conversa, input sticky |
| `--brand-sage-light` + `--brand-ink` text | Bolha **recebida** (cliente) |
| `--brand-ink` bg + `--brand-paper` text | Bolha **enviada** (vendedor) — afirma "esta é a marca falando" |
| `--channel-whatsapp` dot + `.animate-pulse-sage` | Indicador presence online |
| `.shadow-sm` em bolhas | Sombra muito sutil (legibilidade) |
| `.input-focus-glow` + `ring-pulse` | Input ao receber foco (gold halo + pulse 1×) |
| `--font-hind` 400 | Texto das bolhas |
| `--neutral-700` text-xs | Timestamps |

## 5.5 Microinterações

1. **Conversa nova chega:** item da lista pulse sage 800ms (badge dot gold +1 incrementa).
2. **Selecionar conversa:** background fade `--brand-sage-light` em 120ms, ChevronRight aparece.
3. **Bolha recebida (nova):** entra com `translateY 8px → 0` + `opacity` em 180ms.
4. **Presence dot:** `.animate-pulse-sage` (1.6s ease-in-out, infinite) com scale 1 → 1.15.
5. **"digitando..."** pulse de 3 dots, opacidade 0.4 → 1 escalonado.
6. **Input focus:** `.input-focus-glow` + `ring-pulse` 600ms (1×) — gold halo se materializa e estabiliza.
7. **Enviar mensagem:** botão ➤ pulse + bolha aparece com slide-up; checkmark muda de ✓ para ✓✓ quando entregue.

## 5.6 Estados

| Estado | Visual |
|---|---|
| Loading (lista) | 6 skeleton list items shimmer |
| Loading (mensagens) | 3 skeleton bolhas alternadas |
| Empty (sem conversa) | Sidebar com mensagem "Nenhuma conversa ativa" + sage illustration |
| Empty (conversa nova) | Mensagens area com "Comece a conversa enviando uma mensagem" |
| Error de envio | Bolha enviada fica com border terracota + ícone ⚠ + "Tocar para tentar novamente" |
| Offline | Banner sticky sage-light topo: "Você está offline — mensagens serão enviadas quando reconectar" |

---

# Anexos comuns a todas as telas

## A. Comportamento de Sidebar mobile

- Sidebar desktop = fixa 240px com `.surface-premium`.
- Sidebar mobile = drawer (`Sheet` shadcn side="left") com `.surface-premium-gold` que abre via hambúrguer. Backdrop `--neutral-overlay` sólido rgba(20,20,20, 0.60).

## B. Bottom navigation mobile (`< sm`)

```
┌──────────────────────────────────┐
│  📋    👥     💬     ✅     ➕   │  ← 5 ícones, primary ativo ink
│ Pipe  Lead  Chat  Tar.  Mais     │     inactive neutral-500
└──────────────────────────────────┘
```

- Altura 56px com `.surface-premium` + `border-t border-border/60`.
- Item ativo: ícone + label `--brand-ink`, com dot dourado sob o ícone.
- Touch target ≥ 44px (cada item ocupa 75px de largura em 375px = OK).

## C. Toaster (sonner) — posições

- Desktop: `bottom-right`
- Mobile: `top-center` (em mobile, bottom-right colide com bottom nav)
- Variants: success (sage tint), warning (gold tint), error (terracota tint), info (paper + ink)

## D. Logo Techmalhas — variantes

| Variante | Onde | SVG/PNG |
|---|---|---|
| Black | Sidebar light, login dark logo | Recriar como SVG inline |
| White | Sidebar dark mode, header dark | Mesmo SVG com `fill: currentColor` |
| Mark only | Avatar (1ª letra T se sem logo) | Fallback |

---

*Wireframes v4 — Davi Designer | CRM Techmalhas | 2026-05-25*
