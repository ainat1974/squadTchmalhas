# Wireframes v4 — Telas-Chave do CRM Techmalhas

> **Autor:** Davi Designer · **Data:** 2026-05-25
> **Companion de:** `design-system-v4.md`
> **Telas cobertas:** Login · Dashboard · Pipeline Kanban · Leads (lista) · Chat (Amanda)
> **Breakpoints:** mobile 375px, desktop 1280px

---

## Convenções de notação

```
┌─┐  contorno de surface (card, drawer)
╔═╗  contorno de surface com .glass (backdrop-filter)
┃    sidebar / divider vertical
░░   gradient mesh / orb glow
▓▓   skeleton shimmer
●    dot indicador (canal, presence)
◐    avatar (gradient sage→gold)
─    border / divider
[XX] botão / chip
{XX} input / select
↑    micro-interação hover (translate-y)
✦    sombra colorida (gold/sage/ink-glow)
```

---

# Tela 1 — Login

## 1.1 Intenção UX

O login é a única tela em que o usuário entra "frio" no produto. É onde a marca deve dar boas-vindas e estabelecer **competência**. A camada futurista (mesh + orbs + glass card) trabalha aqui, mas a hierarquia funcional permanece: campo email → senha → CTA → "ou Google".

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
| `.glass` + `.shadow-gold` | Card do form |
| `--brand-ink` + `--brand-paper` | Botão "Entrar" (bg ink, text paper) |
| `.shadow-ink-glow` | Hover do botão "Entrar" |
| `.input-focus-glow` | Inputs ao receber foco |
| `.animate-orb-drift` | 2 orbs gold + 1 orb sage + 1 orb terracota (15% opacidade) |
| `--font-hind` weight 700 | "CRM Techmalhas" headline |
| `--brand-sage` outline | Botão Google (variant outline com hover sage-light) |

## 1.5 Microinterações

1. **Mount:** orbs entram com `opacity 0 → 0.3` em 600ms; card glass entra com fade + `translateY 12px → 0` em 280ms.
2. **Input focus:** ring gold com glow se expande em 160ms (ease-out).
3. **Botão "Entrar" hover:** `translateY(-2px)` + `.shadow-ink-glow` em 150ms.
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

Primeira tela após login (para gestores). KPIs com peso visual; gráfico de funil claro; lista "Top 5 leads quentes" abaixo. Stagger de entrada cria sensação de "carregamento orgânico" sem ser teatral.

## 2.2 Desktop 1280px

```
┌────────┬──────────────────────────────────────────────────────────────────┐
│╔══════╗│  ┌─────────────────────────────────────────────────────────────┐│
│║ glass║│  │ Dashboard                              [Filtro: 7 dias  ▾] ││
│║ side ║│  └─────────────────────────────────────────────────────────────┘│
│║      ║│                                                                  │
│║ T    ║│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│║      ║│  │ ↑ stagger│ │ +50ms    │ │ +100ms   │ │ +150ms   │            │
│║▓Dash ║│  │ Leads    │ │ Pipeline │ │ Conv.    │ │ Receita  │            │
│║ Pipe ║│  │ novos    │ │ ativo    │ │ rate     │ │ no mês   │            │
│║ Lead ║│  │          │ │          │ │          │ │ ✦ gold   │            │
│║ Chat ║│  │  47      │ │  R$182k  │ │  18.4%   │ │ R$ 67.5k │            │
│║ Tasks║│  │  ↑12%    │ │  ↑8%     │ │  ↓2%     │ │  ↑34%    │            │
│║ Conf ║│  │  font-   │ │  font-   │ │  font-   │ │ feature  │            │
│║      ║│  │  mono    │ │  mono    │ │  mono    │ │ gradient │            │
│║      ║│  │ sage glow│ │ sage glow│ │sage glow │ │  +gold   │            │
│║      ║│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│║      ║│                                                                  │
│║      ║│  ┌─────────────────────────────┐  ┌────────────────────────────┐│
│║      ║│  │ Funil de conversão          │  │ Top 5 leads quentes        ││
│║      ║│  │                             │  │                            ││
│║◐Vitor║│  │  Novo     ▓▓▓▓▓▓▓▓▓▓▓ 240   │  │ ◐ Loja Sul Boutique        ││
│╚══════╝│  │  Contato  ▓▓▓▓▓▓▓▓ 175      │  │   R$ 2.450 · ● WA · 2d     ││
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
│ ☰  Dashboard       🔔 ◐   │  ← header glass sticky
├────────────────────────────┤
│ [Filtro: 7 dias        ▾] │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ Leads novos      ↑12%  │ │  ← KPI card com sage glow
│ │ 47                     │ │     font-mono no número
│ │ font-mono semibold     │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Pipeline ativo    ↑8%  │ │
│ │ R$ 182k                │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Conv. rate       ↓2%   │ │
│ │ 18.4%                  │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Receita no mês  ↑34%   │ │  ← feature gradient + gold
│ │ R$ 67.5k    ✦          │ │
│ └────────────────────────┘ │
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
| `.glass` | Sidebar desktop, header sticky mobile |
| `.shadow-sage` | KPI cards 1–3 (leitura/operação) |
| `.bg-kpi-feature` + `.shadow-gold` | KPI 4 (Receita = destaque emocional) |
| `--font-mono` 600 + `tabular-nums` | Valores numéricos dos KPIs |
| `--brand-gold` | Stage "Ganho" no funil, indicador ↑ positivo |
| `--brand-terracotta` | Indicador ↓ negativo (Conv. rate -2%) |
| `--action-success` | Indicador ↑ neutro/positivo |
| `--brand-sage-light` | Hover de linha em "Top 5" |
| Framer Motion `staggerChildren: 50ms` | Entrada dos KPI cards |

## 2.5 Microinterações

1. **Mount:** KPI cards entram com stagger 50ms (4 cards = 200ms total).
2. **KPI hover:** card translate-y `-2px` + sombra intensifica em 150ms.
3. **Funil bars:** entrada com `scaleX 0 → 1` em 400ms (transformOrigin left), uma a uma.
4. **Top 5 row hover:** background fade para `--brand-sage-light` em 120ms.
5. **Filtro (Popover):** abertura com fade + slide 200ms.

## 2.6 Estados

| Estado | Visual |
|---|---|
| Loading | Skeletons shimmer nos 4 KPI cards (mesma altura), barras do funil cinza, lista com 5 skeletons |
| Empty | KPI mostra "0" + texto "Sem dados no período"; funil colapsado mostra mensagem |
| Error | Banner sage-light no topo: "Erro ao carregar. Retentar →" |

---

# Tela 3 — Pipeline Kanban

## 3.1 Intenção UX

Tela de uso mais intensivo. Densidade alta, glassmorphism apenas no header e drawer (cards Kanban precisam ser **opacos** para legibilidade rápida). Drag-and-drop ainda é a ação primária; micro-interações reforçam affordance sem distrair.

## 3.2 Desktop 1280px

```
┌────────┬──────────────────────────────────────────────────────────────────┐
│║ side  ║│ ╔═══════════════════════════════════════════════════════════╗  │
│║ glass ║│ ║ Pipeline · Atacado ▾    Buscar lead 🔍    [+ Novo lead]✦ ║  │
│║       ║│ ╚═══════════════════════════════════════════════════════════╝  │
│║       ║│                                                                 │
│║▓Pipe  ║│ ┌──────────┬──────────┬──────────┬──────────┬─────────┬───────┐│
│║       ║│ │ NOVO     │ CONTATO  │ PROPOSTA │ NEGOC.   │ GANHO   │PERDIDO││
│║       ║│ │ (12)     │ (8)      │ (5)      │ (3)      │ (2)     │ (1)   ││
│║       ║│ │ gray bg  │ blue bg  │ amber bg │ orange bg│ green   │ red   ││
│║       ║│ │  v3      │  v3      │   v3     │  v3      │  v3     │  v3   ││
│║       ║│ ├──────────┼──────────┼──────────┼──────────┼─────────┼───────┤│
│║       ║│ │┌────────┐│┌────────┐│┌────────┐│┌────────┐│┌──────┐ │┌─────┐││
│║       ║│ ││Loja Sul││Atacadão││Moda Mile││Boutique││Maxima│ ││Lojas│││
│║       ║│ ││R$ 2.4k ││R$ 1.8k ││R$ 5.9k ││R$ 12k  ││R$ 8k │ ││R$3k │││
│║       ║│ ││◐ Vitor ││◐ Ana   ││◐ Vitor ││◐ Vitor ││◐ Ana │ ││◐ Vi │││
│║       ║│ ││● WA    ││● WC    ││● IG    ││● WA    ││● WA  │ ││● IG │││
│║       ║│ ││★ gold  ││        ││        ││⚠ task  ││✓ won │ ││✗ los│││
│║       ║│ ││ hover  ││        ││        ││ today  ││ gold │ ││      │││
│║       ║│ ││ ↑shdw  ││        ││        ││        ││shadow│ ││      │││
│║       ║│ │└────────┘│└────────┘│└────────┘│└────────┘│└──────┘ │└─────┘││
│║       ║│ │┌────────┐│┌────────┐│┌────────┐│┌────────┐│         │       ││
│║       ║│ ││Centro  ││...     ││...     ││...     ││         │       ││
│║       ║│ ││R$ 3.2k ││        ││        ││        ││         │       ││
│║       ║│ │└────────┘│└────────┘│└────────┘│└────────┘│         │       ││
│║◐Vitor ║│ │   ...    │   ...    │   ...    │          │         │       ││
│╚══════ ║│ └──────────┴──────────┴──────────┴──────────┴─────────┴───────┘│
└────────┴──────────────────────────────────────────────────────────────────┘
                                                              ← drawer slide
                                                              ╔════════════╗
                                                              ║ glass+blur ║
                                                              ║ Loja Sul   ║
                                                              ║ ...        ║
                                                              ╚════════════╝
```

## 3.3 Mobile 375px

```
┌────────────────────────────┐
│ ☰  Pipeline  [Atacado ▾]  │
├────────────────────────────┤
│ 🔍 Buscar           [+]   │
├────────────────────────────┤
│ ◀  NOVO (12)        ▶     │  ← swipe horizontal entre colunas
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ Loja Sul Boutique  ★   │ │  ← card opaco, sem glass
│ │ R$ 2.450               │ │     font-mono no valor
│ │ ◐ Vitor   ● WA   2d    │ │
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
| `.glass` | Header sticky com filtro + busca, drawer de lead detail |
| **`--card` opaco** (sólido) | KanbanCards (densidade > delight) |
| `bg-stage-*-bg` (v3) | Cabeçalho de cada coluna (preservado) |
| `--brand-gold` ★ | Star de "lead destacado/quente" (substitui v3) |
| `--action-warning` | Badge "⚠ tarefa vencida" |
| `.shadow-sage` (hover) | Card em hover ganha sombra suave |
| `.shadow-ink-glow` (drag) | Card sendo arrastado tem sombra forte |
| Framer Motion layout animation | Card mudando de coluna após drop |
| `--font-mono` 600 | Valor R$ no card |

## 3.5 Microinterações

1. **Card hover (desktop):** `translateY -2px` + `.shadow-sage` em 150ms.
2. **Drag start:** card eleva com `.shadow-ink-glow`, escala 1.02, cursor `grabbing`.
3. **Drag over column:** coluna alvo recebe outline 2px gold pulsante (1s ease).
4. **Drop:** card aterrissa com Framer Motion `layout` + spring easing.
5. **Tap card mobile:** drawer entra `slide-in-right 250ms` com `.glass`.
6. **Swipe coluna mobile:** indicador `◀▶` dá feedback de scroll com fade da seta inativa.
7. **Skeleton scroll infinito:** 3 shimmer cards aparecem no fim da coluna ao chegar a 80% do scroll.

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

Vista "tabular" para consulta densa. Linhas alternadas? **Não** — usar hover row + dividers sage-light. Avatar circular com gradient gold→sage para visualidade sem ruído.

## 4.2 Desktop 1280px

```
┌────────┬──────────────────────────────────────────────────────────────────┐
│║ side  ║│ ╔═══════════════════════════════════════════════════════════╗  │
│║ glass ║│ ║ Leads · 247 ativos   🔍 buscar   [Filtros ▾]  [+ Novo]   ║  │
│║       ║│ ╚═══════════════════════════════════════════════════════════╝  │
│║▓Leads ║│                                                                 │
│║       ║│ ┌──────────────────────────────────────────────────────────────┐│
│║       ║│ │ □ NOME ↕            CANAL    STAGE         VENDEDOR    VALOR ││
│║       ║│ ├──────────────────────────────────────────────────────────────┤│
│║       ║│ │ □ ◐ Loja Sul       ● WA     [Negociação]  ◐ Vitor    R$ 2.4k││
│║       ║│ │   hover sage-light row                          font-mono    ││
│║       ║│ ├──────────────────────────────────────────────────────────────┤│
│║       ║│ │ □ ◐ Moda da Mile   ● IG     [Proposta  ]  ◐ Vitor    R$ 5.9k││
│║       ║│ ├──────────────────────────────────────────────────────────────┤│
│║       ║│ │ □ ◐ Atacadão R.    ● WC     [Novo Lead ]  ◐ Ana      R$ 1.9k││
│║       ║│ ├──────────────────────────────────────────────────────────────┤│
│║       ║│ │ □ ◐ Boutique Bia   ● WA     [Ganho     ]  ◐ Vitor    R$  12k││
│║       ║│ │     ★ gold                                       ↑ ganho     ││
│║       ║│ ├──────────────────────────────────────────────────────────────┤│
│║       ║│ │ □ ◐ Modas Centro   ● WA     [Contato   ]  ◐ Ana      R$ 3.2k││
│║       ║│ ├──────────────────────────────────────────────────────────────┤│
│║       ║│ │ ▓▓▓▓▓▓▓▓▓▓▓ skeleton row (scroll infinito) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││
│║◐Vitor ║│ └──────────────────────────────────────────────────────────────┘│
│╚══════ ║│ ────────────────────────────────────────────────────────────────│
│        │ Mostrando 1–25 de 247         [◀ Anterior] [Próxima ▶]            │
└────────┴──────────────────────────────────────────────────────────────────┘
```

## 4.3 Mobile 375px

```
┌────────────────────────────┐
│ ☰  Leads · 247       🔍   │
├────────────────────────────┤
│ [Filtros: WA, Negoc.   ▾] │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ ◐ Loja Sul Boutique    │ │  ← card no mobile (não tabela)
│ │   ● WA  [Negociação]   │ │
│ │   ◐ Vitor    R$ 2.4k   │ │
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
| `.glass` | Header sticky com filtros |
| `--brand-sage-light` | Hover row |
| `--brand-gold` ★ | Estrela de "lead quente" |
| Avatar gradient `from-gold-light to-sage` | Circulo com iniciais |
| Badge `stage-*` (v3 preservado) | Coluna STAGE |
| Badge `channel-*` dot (v3) | Coluna CANAL |
| `--font-mono` 500 | Coluna VALOR (alinhamento tabular) |
| `--brand-paper` | Background da tabela (limpo) |

## 4.5 Microinterações

1. **Row hover:** background fade para sage-light em 120ms; chevron `›` aparece no fim da row.
2. **Click row:** drawer slide-in-right 250ms com glass.
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

Tela de **comunicação ao vivo**. Glass na sidebar e header. Bolhas com sombra sutil (não glassmorphism — perde legibilidade). Indicador de presença pulsante. Input sticky com focus ring animado.

## 5.2 Desktop 1280px

```
┌────────┬─────────────────────────┬────────────────────────────────────────┐
│║ side  ║│╔═══════════════════════╗│╔══════════════════════════════════════╗│
│║ glass ║│║ Conversas · 12 abertas║│║ ◐ Loja Sul Boutique  ● online      ║│
│║       ║│║ 🔍 buscar             ║│║   ● WA · ◐ Vitor      [Detalhes ▾] ║│
│║       ║│╚═══════════════════════╝│╚══════════════════════════════════════╝│
│║▓Chat  ║│┌───────────────────────┐│                                        │
│║       ║││◐ Loja Sul     ●  2m   ││           Hoje, 14:23                  │
│║       ║││  Tá com 20% de        ││  ┌───────────────────────────────┐    │
│║       ║││  desconto? [active]   ││  │ Tá com 20% de desconto?       │    │
│║       ║│├───────────────────────┤│  │                       14:23 ✓ │    │
│║       ║││◐ Moda Mile    ●  15m  ││  └───────────────────────────────┘    │
│║       ║││  Vou fechar amanhã    ││         ← bolha recebida (sage-light) │
│║       ║│├───────────────────────┤│                                        │
│║       ║││◐ Atacadão     ●  1h   ││                ┌─────────────────────┐│
│║       ║││  Obrigado!            ││                │ Olá! Sim, no atacado││
│║       ║│├───────────────────────┤│                │ acima de 10 peças.  ││
│║       ║││◐ Boutique Bia   3h    ││                │            14:24 ✓✓ ││
│║       ║││  Visto                ││                └─────────────────────┘│
│║       ║│├───────────────────────┤│                  ← bolha enviada (ink)│
│║       ║││ ...                   ││                                        │
│║       ║││                       ││  ┌───────────────────────────────┐    │
│║       ║│└───────────────────────┘│  │ ◐ digitando... pulse-sage      │   │
│║       ║│                         │  └───────────────────────────────┘    │
│║       ║│                         │                                        │
│║◐Vitor ║│                         │╔══════════════════════════════════════╗│
│╚══════ ║│                         │║ {📎  Mensagem...           😀  ➤  }║│
│        │                         │╚══════════════════════════════════════╝│
└────────┴─────────────────────────┴────────────────────────────────────────┘
                                            ↑ input sticky com focus-glow
```

## 5.3 Mobile 375px

### Lista de conversas

```
┌────────────────────────────┐
│ ☰ Chat · 12        🔍     │  ← header glass
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
│ ← ◐ Loja Sul  ● online    │  ← header glass sticky
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
│ ╔════════════════════════╗ │  ← input glass sticky
│ ║ 📎 {Mensagem…    😀 ➤}║ │
│ ╚════════════════════════╝ │
└────────────────────────────┘
```

## 5.4 Tokens usados

| Token | Onde |
|---|---|
| `.glass` | Sidebar de conversas, header da conversa, input sticky |
| `--brand-sage-light` + `--brand-ink` text | Bolha **recebida** (cliente) |
| `--brand-ink` bg + `--brand-paper` text | Bolha **enviada** (vendedor) — afirma "esta é a marca falando" |
| `--channel-whatsapp` dot pulsante | Indicador presence online |
| `.shadow-sm` em bolhas | Sombra muito sutil (legibilidade) |
| `.input-focus-glow` | Input ao receber foco |
| `--font-hind` 400 | Texto das bolhas |
| `--neutral-700` text-xs | Timestamps |

## 5.5 Microinterações

1. **Conversa nova chega:** item da lista pulse sage 800ms (badge dot gold +1 incrementa).
2. **Selecionar conversa:** background fade ink-light em 120ms, ChevronRight aparece.
3. **Bolha recebida (nova):** entra com `translateY 8px → 0` + `opacity` em 180ms.
4. **Presence dot:** `animate-pulse-sage` (1.6s ease-in-out, infinite) com scale 0.95 → 1.05.
5. **"digitando..."** pulse de 3 dots, opacidade 0.4 → 1 escalonado.
6. **Input focus:** glow gold ao redor do container do input em 160ms.
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

- Sidebar desktop = fixa 240px com `.glass`.
- Sidebar mobile = drawer (`Sheet` shadcn side="left") que abre via hambúrguer. Backdrop `--neutral-overlay` (rgba 20,20,20, 0.55).

## B. Bottom navigation mobile (`< sm`)

```
┌──────────────────────────────────┐
│  📋    👥     💬     ✅     ➕   │  ← 5 ícones, primary ativo ink
│ Pipe  Lead  Chat  Tar.  Mais     │     inactive neutral-500
└──────────────────────────────────┘
```

- Altura 56px com `.glass`.
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
