# Wireframes v5 — Telas-Chave do CRM Techmalhas (Dark-First)

> **Autor:** Davi Designer · **Data:** 2026-05-25
> **Companion de:** `design-system-v5.md`
> **Inspirado em:** `references/referencia-tania-dashboard-analytics.png`
> **Substitui:** `wireframes-v4.md` (light-first)
> **Telas cobertas:** Login · Dashboard · Pipeline Kanban · Leads (lista) · Chat (Amanda)
> **Breakpoints:** mobile 375px, desktop 1280px
> **Tema:** dark (canvas `#0A0B0D`), light é opt-in

---

## Convenções de notação v5

```
▒▒▒  bg-canvas      (#0A0B0D — fundo do app)
░░░  bg-sunken      (#0E0F12 — input, filter chip)
▓▓▓  bg-card        (#141414 — card padrão)
███  bg-elevated    (#1C1D21 — drawer, popover, KPI feature)
···  border-sutil   (hsla white 6% — quase invisível)
═══  border-gold-soft (hover de card interativo)
✦    gold glow      (FAB, KPI hover, ring focus)
●    pulse-live dot (online, ao vivo)
◐    avatar (gradient ink → gold sutil)
↑    delta positivo (--metric-positive #3DD58C)
↓    delta negativo (--metric-negative #E5614A)
╱╲   sparkline      (linha teal-sage #5BA89A)
▁▂▃▅▆▇ bar chart
○    donut ring
▓▒░  skeleton shimmer (com tint gold sutil)
```

---

# Tela 1 — Login (dark hero)

## 1.1 Intenção UX

O login do v5 mantém o tom premium do v4 mas em dark mode. Em vez de bg branco com mesh sutil, agora é **canvas dark com mesh muito discreto + card sólido elevated com gold luminance**. CTA "Entrar" é gold (não mais ink, porque ink sobre canvas dark some). Mesma estrutura (email → senha → CTA → "ou Google") — só muda o tema.

## 1.2 Desktop 1280px

```
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒  ⊙ mesh-gold (top-left 12%)                                                ▒
▒                                                                            ▒
▒                                                                            ▒
▒                                                                            ▒
▒                                                                            ▒
▒              ═══════════════════════════════════════════                   ▒
▒              ███ bg-elevated #1C1D21 + inner-light    ███                  ▒
▒              ███                                       ███                 ▒
▒              ███   ✦ TM ✦ CRM  ← BrandMark hero (40px gold+glow)███         ▒
▒              ███      Hind 700 letter-spacing -0.04em  ███                  ▒
▒              ███                                       ███                 ▒
▒              ███  CRM Techmalhas              (h1)     ███                 ▒
▒              ███  Entre para continuar       (muted)   ███                 ▒
▒              ███                                       ███                 ▒
▒              ███  E-mail                               ███                 ▒
▒              ███  ┌──────────────────────────────┐    ███                  ▒
▒              ███  │ ░░ bg-sunken    vitor@…    │     ███                   ▒
▒              ███  └──────────────────────────────┘    ███                  ▒
▒              ███                                       ███                 ▒
▒              ███  Senha                                ███                 ▒
▒              ███  ┌──────────────────────────────┐    ███                  ▒
▒              ███  │ ░░ ••••••••••••       👁    │     ███                  ▒
▒              ███  └──────────────────────────────┘    ███                  ▒
▒              ███                                       ███                 ▒
▒              ███  ┌──────────────────────────────┐    ███                  ▒
▒              ███  │ ✦ ENTRAR (gold) ✦            │     ███                 ▒
▒              ███  └──────────────────────────────┘    ███                  ▒
▒              ███                                       ███                 ▒
▒              ███  ────  ou continue com  ────         ███                  ▒
▒              ███                                       ███                 ▒
▒              ███  ┌──────────────────────────────┐    ███                  ▒
▒              ███  │ G  Continuar com Google      │    ███                  ▒
▒              ███  │    (outline, hover gold ring) │   ███                  ▒
▒              ███  └──────────────────────────────┘    ███                  ▒
▒              ███                                       ███                 ▒
▒              ███  Esqueceu a senha?  Recuperar         ███                 ▒
▒              ═══════════════════════════════════════════                   ▒
▒                                                                            ▒
▒                                                ⊙ mesh-sage (bottom-right) ▒
▒                                                                            ▒
▒      Techmalhas · há 30 anos no varejo de moda íntima brasileira          ▒
▒                                                                            ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

## 1.3 Mobile 375px

```
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒  ⊙ mesh-gold top                ▒
▒                                 ▒
▒                                 ▒
▒        ✦ TM ✦ CRM ← BrandMark   ▒
▒        hero gold+glow Hind 700  ▒
▒                                 ▒
▒        CRM Techmalhas           ▒
▒        Entre para continuar     ▒
▒                                 ▒
▒  █████████████████████████████  ▒
▒  ███ bg-elevated #1C1D21    ███ ▒
▒  ███ E-mail                ███  ▒
▒  ███ ░░░░░░░░░░░░░░░░░░░░  ███  ▒
▒  ███                       ███  ▒
▒  ███ Senha                 ███  ▒
▒  ███ ░░░░░░░░░░░░░░░░  👁 ███  ▒
▒  ███                       ███  ▒
▒  ███ ✦ ENTRAR (gold) ✦   ███   ▒
▒  ███                       ███  ▒
▒  ███ ── ou continue com ── ███  ▒
▒  ███                       ███  ▒
▒  ███ G  Continuar Google  ███   ▒
▒  ███                       ███  ▒
▒  ███ Esqueceu a senha?    ███   ▒
▒  █████████████████████████████  ▒
▒                                 ▒
▒  ⊙ mesh-sage bottom            ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

## 1.4 Tokens usados

| Token | Onde |
|---|---|
| `bg-canvas` | `<main>` |
| `bg-elevated` + `inner-light` shadow | Card do form |
| `border-sutil` (hsla white 6%) | Borda do card |
| Mesh gradient sutil (gold 8% top-left, sage 10% bottom-right) | Background do `<main>` |
| `bg-sunken` | Inputs |
| `input-focus-glow` + `ring-pulse` | Inputs ao focar (mantido v4) |
| `--action-primary` (gold no dark) + `--action-primary-foreground` (ink) | Botão "Entrar" |
| `shadow-gold` em repouso, `shadow-gold-lift` em hover | Botão "Entrar" |
| Variant `outline` + hover gold ring | Botão Google |
| `--font-hind` 700 | "CRM Techmalhas" headline |
| Logo SVG white variant | Sidebar dark |

## 1.5 Microinterações

1. **Mount:** mesh gradient entra com fade `0 → 1` em 600ms; card sólido entra com fade + `translateY 12px → 0` em 250ms.
2. **Input focus:** `.input-focus-glow` aplica ring gold + pulse 1× (600ms ring-pulse).
3. **Botão "Entrar" hover:** `shadow-gold-lift` + `translateY(-2px)` em 150ms.
4. **Loading:** botão troca texto por spinner + "Entrando…"; altura mantida.
5. **Erro:** shake horizontal 200ms + border `--metric-negative` no input + mensagem inline.

## 1.6 Estados

| Estado | Visual |
|---|---|
| Default | Conforme acima |
| Loading | "Entrando…" + spinner; inputs disabled opacity 50% |
| Error | Toast top-right + shake input |
| Success | Redirect imediato para `/pipeline` |

---

# Tela 2 — Dashboard (réplica estrutural da referência Tania)

## 2.1 Intenção UX

**Esta é a tela onde a referência da Tania mais impacta.** Replicamos a estrutura da ref (filtros → KPI row → AreaChart + PatternBar → Recommendations → GroupedBar + DataTable) **adaptada para métricas de CRM B2B/B2C**. Sidebar dark, FAB gold flutuante. Stagger de entrada por seção (50ms entre cards). Em mobile, vira stack vertical com swipe horizontal nas Recommendations.

## 2.2 Desktop 1280px

```
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒┌────────┬─────────────────────────────────────────────────────────────────┐▒
▒│▓▓▓▓▓▓▓▓│                                                                 │▒
▒│▓ side ▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│▓ bg-  ▓│ ▓ Dashboard                              [Hist. conversas]   ▓ │▒
▒│▓ card ▓│ ▓ ··· filter-bar-sticky #16181C/96 ··············••••••••••• ▓ │▒
▒│▓      ▓│ ▓ [📅 25/04 – 25/05][Pipeline: Atacado ▾][Vend: Todos ▾][Canal▾]▓│▒
▒│▓✦TM ✦▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│▓echma- ▓│   ← BrandMark sidebar (TM 28px gold+glow Hind 700, "echmalhas" 14px muted) │▒
▒│▓lhas   ▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│▓      ▓│ ▓ Resultados de vendas                                       ▓ │▒
▒│▓ ●Dash▓│ ▓┌──────────┐┌──────────┐┌──────────┐╔══════════╗            ▓│▒
▒│▓  Pipe▓│ ▓│RECEITA   ││TICKET MD ││CONV. RATE││PIPELINE  ║ ← elevated ▓│▒
▒│▓  Lead▓│ ▓│MÊS       ││          ││          ║│ATIVO     ║   feature  ▓│▒
▒│▓  Chat▓│ ▓│R$ 67.500 ││R$ 1.420  ││  50%  ○ ║│R$ 182k   ║   border-  ▓│▒
▒│▓  Tare▓│ ▓│↑+18.6%   ││↑+8%      ││↓-2%     ║│↑+34%     ║   gold-soft▓│▒
▒│▓  Conf▓│ ▓│vs mês pas││vs mês pas││vs mês pas││vs mês pas║            ▓│▒
▒│▓      ▓│ ▓│╱╲╱╲╱─    ││─╱─╱─╱─   ││ donut    ║│╱╲╱╲╱─    ║            ▓│▒
▒│▓      ▓│ ▓│sparkline ││sparkline ││ 50% green║│sparkline ║            ▓│▒
▒│▓      ▓│ ▓└──────────┘└──────────┘└──────────┘╚══════════╝            ▓│▒
▒│▓      ▓│                                                                 │▒
▒│▓      ▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│▓      ▓│ ▓ Performance da receita (30 dias)   ▓ ▓ Distribuição canais  ▓ │▒
▒│▓      ▓│ ▓ R$ 67.5k    ↑+18.6%                ▓ ▓                      ▓ │▒
▒│▓      ▓│ ▓                                    ▓ ▓ WhatsApp ████████ 64%▓│▒
▒│▓      ▓│ ▓ ─────────────────────────────────  ▓ ▓ Instagram ████   22% ▓│▒
▒│▓      ▓│ ▓ 100%┤                       ╱╲    ▓ ▓ Web Chat  ██      9% ▓│▒
▒│▓      ▓│ ▓  80%┤              ╱╲    ╱╱   ╲  ▓ ▓ Outros    █       5% ▓│▒
▒│▓      ▓│ ▓  60%┤        ╱╲   ╱  ╲╱╲╱       ▓ ▓                       ▓ │▒
▒│▓      ▓│ ▓  40%┤     ╱╲╱  ╲╱            chart-primary  ─────────────  ▓ │▒
▒│▓      ▓│ ▓  20%┤  ╱╲╱       teal-sage  +glow           Top 3 leads   ▓ │▒
▒│▓ ◐Vitor▓│ ▓   0%└─────────────────────────             quentes (link)▓│▒
▒│▓      ▓│ ▓     1   5   10  15  20  25  30   ▓ ▓                       ▓ │▒
▒│▓      ▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│       │                                                                 │▒
▒│       │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│       │ ▓ Ações sugeridas hoje                                        ▓ │▒
▒│       │ ▓┌─────────────┐┌─────────────┐┌─────────────┐               ▓│▒
▒│       │ ▓│📨 gold icon ││⏰ gold icon ││🎯 gold icon ││               ▓│▒
▒│       │ ▓│             ││             ││             ││               ▓│▒
▒│       │ ▓│3 leads sem  ││5 tarefas    ││Meta do mês: ││               ▓│▒
▒│       │ ▓│resposta há  ││vencidas     ││62% concluída││               ▓│▒
▒│       │ ▓│+24h         ││             ││             ││               ▓│▒
▒│       │ ▓│             ││             ││R$ 67.5k de  ││               ▓│▒
▒│       │ ▓│Você pode    ││Reagendar    ││R$ 110k      ││               ▓│▒
▒│       │ ▓│perdê-los    ││antes que    ││Faltam 8 dias││               ▓│▒
▒│       │ ▓│             ││cliente      ││             ││               ▓│▒
▒│       │ ▓│             ││reclame      ││             ││               ▓│▒
▒│       │ ▓│             ││             ││             ││               ▓│▒
▒│       │ ▓│[VER LEADS →]││[REAGENDAR →]││[VER PIPE →] ││               ▓│▒
▒│       │ ▓│   gold      ││   gold      ││   gold      ││               ▓│▒
▒│       │ ▓└─────────────┘└─────────────┘└─────────────┘               ▓│▒
▒│       │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│       │                                                                 │▒
▒│       │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│       │ ▓ Deals ganhos vs perdidos (12 meses)                         ▓ │▒
▒│       │ ▓ R$ 2.180  Ganhos ↑+18.6%   920   Perdidos +5%   42 evitados▓│▒
▒│       │ ▓                                                              ▓ │▒
▒│       │ ▓ 100%┤                                                       ▓ │▒
▒│       │ ▓  80%┤   ▆▃   ▅▂  ▆▃   ▇▂  ▆▁  ▇▂  ▇▃  ▇▂   ▇▃  ▆▂  ▆▁  ▇▂ ▓│▒
▒│       │ ▓  60%┤   ▆▃   ▅▂  ▆▃   ▇▂  ▆▁  ▇▂  ▇▃  ▇▂   ▇▃  ▆▂  ▆▁  ▇▂ ▓│▒
▒│       │ ▓  40%┤   ▆▃   ▅▂  ▆▃   ▇▂  ▆▁  ▇▂  ▇▃  ▇▂   ▇▃  ▆▂  ▆▁  ▇▂ ▓│▒
▒│       │ ▓  20%┤   ▆▃   ▅▂  ▆▃   ▇▂  ▆▁  ▇▂  ▇▃  ▇▂   ▇▃  ▆▂  ▆▁  ▇▂ ▓│▒
▒│       │ ▓   0%└──────────────────────────────────────────────────────  ▓ │▒
▒│       │ ▓     Jan Fev Mar Abr Mai Jun Jul Ago Set Out Nov Dez         ▓ │▒
▒│       │ ▓     ● Ganhos (green #3DD58C)   ● Perdidos (red #E5614A)     ▓ │▒
▒│       │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│       │                                                                 │▒
▒│       │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│       │ ▓ Leads recentes                            [Ver todos →]   ▓ │▒
▒│       │ ▓ ··· text-muted uppercase tracking-wide header  ······    ▓ │▒
▒│       │ ▓ LEAD          CRIADO       VALOR EST   FECHADO  RESULT  ETAPA  CANAL ✎▓│▒
▒│       │ ▓ Loja Sul     25/05 10:33  R$ 4.500   R$ 4.200  -R$300 [Neg][WA] ✎▓│▒
▒│       │ ▓ Moda Mile    24/05 14:22  R$ 5.890   —         —     [Pro][IG] ✎▓│▒
▒│       │ ▓ Atacadão R.  24/05 09:15  R$ 1.890   R$ 1.890  +R$0  [Gan][WC] ✎▓│▒
▒│       │ ▓ Boutique Bia 23/05 16:10  R$12.000   R$12.450  +R$450[Gan][WA] ✎▓│▒
▒│       │ ▓ Centro Moda  23/05 11:00  R$ 3.200   —         —     [Con][WA] ✎▓│▒
▒│       │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│       │                                                                 │▒
▒│       │                                                       ✦●FAB●✦  │▒  ← FAB gold
▒│       │                                                       (Plus 24px) │
▒└───────┴─────────────────────────────────────────────────────────────────┘▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

## 2.3 Mobile 375px

```
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒ ☰  Dashboard       🔔 ◐       ▒  ← bg-card sticky
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒ ··· filter-bar-sticky ········▒
▒ [📅 25/04–25/05] [Atacado ▾] ▒
▒ [Vendedor: Todos ▾] [Canal ▾] ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒                                ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ RECEITA DO MÊS         ⓘ ▓ ▒  ← KPI default
▒ ▓                            ▓ ▒
▒ ▓ R$ 67.500  ↑+18.6%        ▓ ▒
▒ ▓ ╱╲╱╲╱─                    ▓ ▒
▒ ▓ vs R$56.900 mês passado   ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒                                ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ TICKET MÉDIO              ▓ ▒
▒ ▓ R$ 1.420   ↑+8%           ▓ ▒
▒ ▓ ─╱─╱─                     ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒                                ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ CONV. RATE          ○ 50% ▓ ▒  ← donut
▒ ▓ 50%        ↓-2%            ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒                                ▒
▒ ═══════════════════════════ ▒
▒ ███ PIPELINE ATIVO ✦ feature███▒
▒ ███ R$ 182.000   ↑+34%   ███ ▒
▒ ███ ╱╲╱╲╱─ sparkline maior ███▒
▒ ═══════════════════════════ ▒
▒                                ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ Receita 30 dias            ▓ ▒
▒ ▓ R$ 67.5k  ↑+18.6%          ▓ ▒
▒ ▓                            ▓ ▒
▒ ▓        ╱╲                  ▓ ▒
▒ ▓     ╱╲╱  ╲  ╱╲╱─          ▓ ▒
▒ ▓ ╱╲╱       ╲╱   chart-     ▓ ▒
▒ ▓ ─────────────  primary    ▓ ▒
▒ ▓ +glow under                ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒                                ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ Distribuição por canal    ▓ ▒
▒ ▓ WhatsApp ████████ 64%    ▓ ▒
▒ ▓ Instagram ████      22%   ▓ ▒
▒ ▓ Web Chat  ██         9%   ▓ ▒
▒ ▓ Outros    █          5%   ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒                                ▒
▒ Ações sugeridas hoje          ▒  ← swipe horizontal
▒ ←──────────────────────────→  ▒
▒ ┌──────────┐┌──────────┐    ▒
▒ │📨 3 sem  ││⏰ 5 tar  │ →  ▒
▒ │  resp 24h││  venc    │    ▒
▒ │[VER →]   ││[REAG →]  │    ▒
▒ └──────────┘└──────────┘    ▒
▒                                ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ Ganhos vs Perdidos 12m    ▓ ▒
▒ ▓ ▆▃ ▅▂ ▆▃ ▇▂ ▆▁ ▇▂ ▇▃ ▇▂  ▓ ▒
▒ ▓ ▆▃ ▅▂ ▆▃ ▇▂ ▆▁ ▇▂ ▇▃ ▇▂  ▓ ▒
▒ ▓ J F M A M J J A S O N D   ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒                                ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ Leads recentes  [Ver →]   ▓ ▒
▒ ▓ ◐ Loja Sul   R$4.5k [WA] ▓ ▒
▒ ▓ ◐ Moda Mile  R$5.9k [IG] ▓ ▒
▒ ▓ ◐ Atacadão   R$1.9k [WC] ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒                                ▒
▒                          ✦●FAB●✦  ← FAB gold
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
[Bottom nav: Pipe Lead Chat Tar ⋯]
```

## 2.4 Tokens usados (Dashboard)

| Token | Onde |
|---|---|
| `bg-canvas` | `<body>` |
| `bg-card` + `border-sutil` + `inner-light` | Sidebar, header, todos os cards padrão (KPI 1-3, PatternBar, Recommendations, GroupedBar, DataTable) |
| `bg-elevated` + `border-gold-soft` | **KPI feature** (Pipeline ativo) |
| `filter-bar-sticky` (`bg-card/96`) | FilterBar sticky |
| `chart-primary` `#5BA89A` + gradient fill + drop-shadow glow | AreaChart linha + halo |
| `metric-positive` `#3DD58C` | Delta ↑, ganhos bars, donut win |
| `metric-negative` `#E5614A` | Delta ↓, perdidos bars |
| `channel-whatsapp/instagram/webchat` | PatternBar bars + DataTable canal pill |
| `tag-pill` por stage (`stage-*` color) | DataTable etapa pill |
| `fab-gold` | FAB "Novo lead" bottom-right |
| `font-kpi` mono + tabular-nums | Valores R$, percentuais |
| Sparkline `stroke-dasharray` animation | KPI cards |
| Number counter useCountUp 600ms | KPI values ao montar |
| Pulse-live dot | "atualizado agora" (next to filtros) |

## 2.5 Microinterações

1. **Mount stagger:** seções entram com fade + `translateY 12px → 0` em 220ms, stagger 80ms entre seções (filter → KPIs → AreaChart+PatternBar → Recommendations → GroupedBar → DataTable).
2. **KPI cards stagger:** 4 cards entram com stagger 50ms; valor "conta" de 0 ao final (600ms `useCountUp`); sparkline desenha com `stroke-dasharray` 800ms; delay 200ms.
3. **KPI hover:** border passa de `--border-sutil` para `--border-gold-soft` em 150ms (sem translate na default; KPI feature ganha `translateY(-2px)` + `shadow-gold-lift`).
4. **AreaChart:** linha desenha em 800ms via Recharts `isAnimationActive`; tooltip aparece sob hover do ponto com fade 100ms.
5. **PatternBar:** barras crescem `scaleX 0 → 1` (transformOrigin left) em 400ms com stagger 80ms.
6. **RecommendationCard hover:** border-gold-soft + CTA gold pulsa 1× (200ms).
7. **GroupedBar:** barras crescem `scaleY 0 → 1` em 400ms; legenda fade-in 200ms.
8. **DataTable row hover:** bg passa para `--bg-elevated/50`; ícone ✎ aparece com fade.
9. **FAB:** sustained gold-glow em repouso (`box-shadow` constante); hover → `scale(1.04) translateY(-2px)` + glow intensifica.
10. **FAB click:** abre Drawer "Novo lead" do lado direito (`bg-elevated`).

## 2.6 Estados

| Estado | Visual |
|---|---|
| Loading | Skeletons shimmer-dark em todas as 6 seções; FAB renderiza direto (não bloqueia ação) |
| Empty (sem dados no período) | KPI mostra "0" + "Sem dados no período"; AreaChart vira ilustração "Selecione outro período"; CTA gold "[Mudar filtro]" |
| Error fetch | Banner sticky topo `metric-negative-soft` + "[Tentar novamente]" |
| Refetching | Indicador "atualizando…" pulse no header (canto direito), conteúdo fica com opacity 0.7 |

---

# Tela 3 — Pipeline Kanban (dark adaptado)

## 3.1 Intenção UX

Pipeline é a tela de **uso mais intensivo** (Vitor/Ana 6-8h/dia). Densidade alta — sidebar dark, header sticky, FAB gold sempre acessível. **Stage colors preservados** mas adaptados para dark (cabeçalho com tint colorido 18% + texto colorido). Cards opacos `bg-card` + border-sutil; hover → border-gold-soft. Drawer abre `bg-elevated` com toda informação do lead.

## 3.2 Desktop 1280px

```
▒┌────────┬─────────────────────────────────────────────────────────────────┐▒
▒│▓▓▓▓▓▓▓▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│▓ side ▓│ ▓ Pipeline · Atacado ▾  Buscar lead 🔍              ▓ │▒
▒│▓ bg-  ▓│ ▓ ··· filter-bar-sticky #16181C/96 ················         ▓ │▒
▒│▓ card ▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│▓      ▓│                                                                 │▒
▒│▓ ●Pipe▓│ ┌─────────┬─────────┬─────────┬─────────┬─────────┬───────────┐│▒
▒│▓      ▓│ │ NOVO    │ CONTATO │PROPOSTA │NEGOCIAÇÃO│  GANHO  │ PERDIDO   ││▒
▒│▓      ▓│ │ (12)    │  (8)    │  (5)    │  (3)    │  (2)    │  (1)      ││▒
▒│▓      ▓│ │ muted   │ blue 16%│ amber 16│ orange16│ green16 │ red 16    ││▒
▒│▓      ▓│ │ chip    │  chip   │  chip   │  chip   │  chip   │  chip     ││▒
▒│▓      ▓│ ├─────────┼─────────┼─────────┼─────────┼─────────┼───────────┤│▒
▒│▓      ▓│ │▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓▓▓││▒
▒│▓      ▓│ │▓Loja Sul▓│▓Atacadã│▓Moda Mi│▓Bouti.. │▓Maxima │▓Lojas Z   ││▒
▒│▓      ▓│ │▓R$2.4k  │▓R$1.8k │▓R$5.9k │▓R$12k   │▓R$8k   │▓R$3k      ││▒
▒│▓      ▓│ │▓◐Vitor  │▓◐Ana   │▓◐Vitor │▓◐Vitor  │▓◐Ana ✓ │▓◐Vitor ✗  ││▒
▒│▓      ▓│ │▓[WA] ★g│▓[WC]   │▓[IG]   │▓[WA]⚠hoje│▓[WA] ↑gold▓[IG]    ││▒
▒│▓      ▓│ │▓ hover ═│▓       │▓       │▓        │▓       │▓          ││▒
▒│▓      ▓│ │▓ gold   │▓       │▓       │▓        │▓       │▓          ││▒
▒│▓      ▓│ │▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓▓▓││▒
▒│▓      ▓│ │▓Centro  │▓Modas   │▓Magia   │▓Vintage │         │           ││▒
▒│▓      ▓│ │▓R$3.2k  │▓R$890   │▓R$4.5k  │▓R$2.8k  │         │           ││▒
▒│▓      ▓│ │▓◐Vitor  │▓◐Ana    │▓◐Vitor  │▓◐Ana    │         │           ││▒
▒│▓      ▓│ │▓[WA]    │▓[IG]    │▓[WA]    │▓[WC]    │         │           ││▒
▒│▓      ▓│ │▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓│         │           ││▒
▒│▓      ▓│ │  ...    │   ...   │         │         │         │           ││▒
▒│▓◐Vitor▓│ │ ▓▒░     │ ▓▒░     │         │         │         │           ││▒
▒│▓      ▓│ │skeleton │skeleton │         │         │         │           ││▒
▒│▓      ▓│ └─────────┴─────────┴─────────┴─────────┴─────────┴───────────┘│▒
▒│       │                                                       ✦●FAB●✦   │▒
▒└───────┴─────────────────────────────────────────────────────────────────┘▒
                                                              ← drawer slide
                                                           ┌──────────────┐
                                                           │██████████████│
                                                           │█ bg-elevated█│
                                                           │█ + inner-lite█│
                                                           │█ + border-  █│
                                                           │█ gold-soft  █│
                                                           │█            █│
                                                           │█ Loja Sul   █│
                                                           │█ Boutique   █│
                                                           │█            █│
                                                           │█ R$ 2.450   █│
                                                           │█ Negociação █│
                                                           │█            █│
                                                           │█ ◐Vitor●WA  █│
                                                           │█            █│
                                                           │█ Timeline:  █│
                                                           │█ • Criado…  █│
                                                           │█ • Mens…    █│
                                                           │█            █│
                                                           │█ Tarefas    █│
                                                           │█ ☑ Ligar 14h│
                                                           │█ ☐ Enviar…  █│
                                                           │█            █│
                                                           │█[Marcar    █│
                                                           │█ ganho   ✦]│
                                                           │██████████████│
                                                           └──────────────┘
```

## 3.3 Mobile 375px

```
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒ ☰  Pipeline [Atacado ▾]    ▒  ← bg-card sticky
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒ 🔍 Buscar                  ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒ ◀ NEGOCIAÇÃO (3) orange chip ▶▒  ← swipe horizontal
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒                                ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ Loja Sul Boutique   ★ gold▓ ▒  ← card opaco
▒ ▓ R$ 2.450 (mono)           ▓ ▒  hover → border-gold-soft
▒ ▓ ◐ Vitor   [WA]    2d      ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ Centro Atacado            ▓ ▒
▒ ▓ R$ 3.200                  ▓ ▒
▒ ▓ ◐ Vitor   [WA]    1d      ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ Moda Sul         ⚠ vencida▓ ▒  ← warning chip
▒ ▓ R$ 4.100                  ▓ ▒
▒ ▓ ◐ Ana     [IG]    5h      ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒                                ▒
▒ ▓▒░ shimmer (carregando) ▒░▓  ▒
▒                                ▒
▒                       ✦●FAB●✦  ▒  ← FAB gold
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
[Bottom nav]
```

## 3.4 Tokens usados (Kanban)

| Token | Onde |
|---|---|
| `bg-canvas` | `<body>` |
| `bg-card` + `border-sutil` | Sidebar, header sticky, cards Kanban |
| `bg-elevated` + `inner-light` + `border-gold-soft` | Drawer de lead (slide-in right) |
| Stage chips (dark): bg cor stage 16% + texto cor stage | Cabeçalho de cada coluna |
| `--brand-gold` ★ | Star de lead destacado/quente |
| `--action-warning` chip | Badge "⚠ vencida" |
| `border-gold-soft` no hover | Card em hover |
| `shadow-card-hover` (gold 20%) + `translateY(-2px)` | Card hover (mais sutil que v4) |
| `shadow-ink-glow` + scale 1.03 + rotate 1deg | Card sendo arrastado |
| `fab-gold` | FAB "Novo lead" |
| `skeleton-shimmer-dark` | Loading inicial cards |
| `font-kpi` mono | Valor R$ no card |

## 3.5 Microinterações

1. **Card hover:** border passa de `--border-sutil` para `--border-gold-soft` em 150ms + `translateY(-2px)` + `shadow-card-hover`.
2. **Drag start:** card eleva com sombra ink + scale 1.03 + rotate 1°; cursor `grabbing`.
3. **Drag over column:** outline 2px gold pulsante na coluna alvo (1s ease).
4. **Drop:** card aterrissa com spring easing (`--easing-spring`); dnd-kit handle layout.
5. **Tap card mobile:** Drawer entra `slide-in-right 250ms` com `bg-elevated`.
6. **Swipe coluna mobile:** indicador `◀▶` fade da seta inativa.
7. **Mount inicial:** colunas entram com stagger 80ms; primeiros 8 cards visíveis por coluna entram com stagger 30ms.

## 3.6 Estados

| Estado | Visual |
|---|---|
| Loading inicial | 3 skeleton-shimmer-dark cards por coluna |
| Empty (coluna sem deals) | Ícone lucide outline `--text-muted` + "Nenhum deal aqui" + `[+ Criar lead]` gold |
| Drag rejected | Card volta com spring reverso + toast "Não é possível mover para Ganho sem tarefas concluídas" `metric-negative-soft` |
| Error save | Card pisca `metric-negative` 2× + toast retry |

---

# Tela 4 — Leads (lista — DataTableDark)

## 4.1 Intenção UX

Consulta densa em formato tabular. **Aplica o padrão de tabela da referência** (header text-muted uppercase, row hover sutil bg-elevated, tags pill coloridas, ícone edit no fim). Avatar com gradient ink → gold sutil. Sidebar dark. FAB gold para criar lead.

## 4.2 Desktop 1280px

```
▒┌────────┬─────────────────────────────────────────────────────────────────┐▒
▒│▓▓▓▓▓▓▓▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│▓ side ▓│ ▓ Leads · 247 ativos  🔍 buscar   [Filtros ▾]  [Ordenar ▾]   ▓ │▒
▒│▓      ▓│ ▓ ··· bg-card sticky ······································ ▓ │▒
▒│▓      ▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│▓ ●Lead▓│                                                                 │▒
▒│▓      ▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│▓      ▓│ ▓ ☐ LEAD ↕    CRIADO        VALOR    VENDEDOR  ETAPA   CANAL  ▓│▒
▒│▓      ▓│ ▓ ··· header text-muted uppercase tracking-wide ············▓ │▒
▒│▓      ▓│ ▓                                                              ▓ │▒
▒│▓      ▓│ ▓ ☐ ◐ Loja Sul Bout. 25/05 10:33 R$ 2.450 ◐ Vitor [Negoc][WA]✎▓│▒
▒│▓      ▓│ ▓                       hover row → bg-elevated/50            ▓│▒
▒│▓      ▓│ ▓ ☐ ◐ Moda da Mile   25/05 09:12 R$ 5.890 ◐ Vitor [Prop][IG] ✎▓│▒
▒│▓      ▓│ ▓ ☐ ◐ Atacadão R.    24/05 16:45 R$ 1.890 ◐ Ana   [Novo][WC]✎▓│▒
▒│▓      ▓│ ▓ ☐ ◐ Boutique Bia★ 23/05 16:10 R$12.450 ◐ Vitor [Gan ][WA]✎▓│▒
▒│▓      ▓│ ▓                gold star                green pill          ▓│▒
▒│▓      ▓│ ▓ ☐ ◐ Modas Centro  23/05 11:00 R$ 3.200 ◐ Ana   [Cont][WA]✎▓│▒
▒│▓      ▓│ ▓ ☐ ◐ Top Atac.     22/05 14:30 R$ 7.600 ◐ Vitor [Neg ][WA]✎▓│▒
▒│▓      ▓│ ▓ ☐ ◐ Glamour ME    22/05 10:15 R$ 4.200 ◐ Ana   [Prop][IG]✎▓│▒
▒│▓ ◐Vitor│ ▓ ☐ ◐ Estilo Bra.   21/05 17:00 R$ 1.500 ◐ Vitor [Cont][WC]✎▓│▒
▒│▓      ▓│ ▓                                                              ▓ │▒
▒│▓      ▓│ ▓ ▓▒░ skeleton-shimmer-dark row ▓▒░                          ▓│▒
▒│▓      ▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│       │ ····························································  │▒
▒│       │  Mostrando 1–25 de 247   ◐ ◑ ◒                  ◀ 1 2 3 … ▶  │▒
▒│       │                                                       ✦●FAB●✦  │▒
▒└───────┴─────────────────────────────────────────────────────────────────┘▒
```

## 4.3 Mobile 375px

```
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒ ☰  Leads · 247    🔍         ▒  ← bg-card sticky
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒ [Filtros: WA, Negoc.   ▾]    ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒                                ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ ◐ Loja Sul Boutique       ▓ ▒  ← LeadCard mobile
▒ ▓    [WA]  [Negociação]     ▓ ▒
▒ ▓    ◐ Vitor    R$ 2.450    ▓ ▒  (mono)
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ ◐ Moda da Mile     ★      ▓ ▒
▒ ▓    [IG]  [Proposta]       ▓ ▒
▒ ▓    ◐ Vitor    R$ 5.890    ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ ◐ Atacadão Roupas         ▓ ▒
▒ ▓    [WC]  [Novo Lead]      ▓ ▒
▒ ▓    ◐ Ana      R$ 1.890    ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒                                ▒
▒ ▓▒░ shimmer ▒░                ▒
▒                                ▒
▒ [Mostrar mais (224)        ↓]▒
▒                                ▒
▒                       ✦●FAB●✦  ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
[Bottom nav]
```

## 4.4 Tokens usados (Leads)

| Token | Onde |
|---|---|
| `bg-canvas` | `<body>` |
| `bg-card` + `border-sutil` | Sidebar, header sticky, LeadCards mobile |
| `bg-elevated/50` no hover row | Hover row desktop |
| `tag-pill` por stage/canal | Coluna ETAPA / CANAL |
| Avatar gradient ink → gold 30% | Círculo com iniciais |
| `font-kpi` mono tabular-nums | Coluna VALOR |
| `fab-gold` | FAB "Novo lead" |
| `skeleton-shimmer-dark` | Loading rows |
| Ícone `Edit2` lucide gold no hover | Coluna ✎ |

## 4.5 Microinterações

1. **Row hover:** bg fade para `--bg-elevated/50` em 120ms; ícone ✎ aparece com fade.
2. **Click row:** drawer slide-in-right 250ms com `bg-elevated`.
3. **Sort column:** seta ↕ rotaciona suavemente; header pisca gold 200ms.
4. **Bulk select:** todos os checks animam em cascata 30ms cada.
5. **Filtro popover:** abertura com fade + slide 200ms.

## 4.6 Estados

| Estado | Visual |
|---|---|
| Loading | 8 skeleton rows shimmer-dark |
| Empty (sem filtro) | Ícone outline + "Nenhum lead ainda" + `[+ Criar primeiro lead]` gold |
| Empty (com filtro) | "Nenhum resultado. [Limpar filtros]" |
| Error | Banner `metric-negative-soft` topo + retry |

---

# Tela 5 — Chat (Amanda WhatsApp Inbox, dark)

## 5.1 Intenção UX

Comunicação ao vivo. **3-panel layout** (sidebar nav esquerda + lista conversas meio + conversa direita). Tudo em dark. Bolhas: recebida `bg-elevated` + text-primary; enviada `bg-gold` + text-ink (afirma "a marca falando"). Presence pulse `metric-positive` (green). Input sticky com `input-focus-glow` + ring-pulse gold (mantido v4).

## 5.2 Desktop 1280px

```
▒┌────────┬─────────────────────────┬────────────────────────────────────────┐▒
▒│▓▓▓▓▓▓▓▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│▓ side ▓│ ▓ Conversas · 12 abert▓ │ ▓ ◐ Loja Sul ● online (pulse-live) ▓ │▒
▒│▓      ▓│ ▓ 🔍 buscar           ▓ │ ▓ [WA] · ◐ Vitor  [Detalhes ▾]    ▓ │▒
▒│▓      ▓│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│▓ ●Chat▓│ ▓ ◐ Loja Sul  ● 2m   ▓ │                                        │▒
▒│▓      ▓│ ▓ Tá com 20% de des… ▓ │            Hoje, 14:23                 │▒
▒│▓      ▓│ ▓ ═════════════════  ▓ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         │▒
▒│▓      ▓│ ▓ ACTIVE bg-elevated▓│ │ ▓█ Tá com 20% de desconto?  ▓         │▒
▒│▓      ▓│ ▓ ◐ Moda Mile ● 15m ▓│ │ ▓█ bg-elevated +inner-light  ▓         │▒
▒│▓      ▓│ ▓ Vou fechar amanhã ▓│ │ ▓█             14:23 ✓       ▓         │▒
▒│▓      ▓│ ▓                   ▓│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         │▒
▒│▓      ▓│ ▓ ◐ Atacadão  ● 1h ▓│ │           ← bolha recebida             │▒
▒│▓      ▓│ ▓ Obrigado!         ▓│ │                                        │▒
▒│▓      ▓│ ▓                   ▓│ │                  ┌─────────────────┐  │▒
▒│▓      ▓│ ▓ ◐ Bia      ◯ 3h  ▓│ │                  │█████████████████│  │▒
▒│▓      ▓│ ▓ Visto             ▓│ │                  │█ Olá! Sim, no  █│  │▒
▒│▓      ▓│ ▓                   ▓│ │                  │█ atacado acima █│  │▒
▒│▓      ▓│ ▓ ...               ▓│ │                  │█ de 10 peças.  █│  │▒
▒│▓ ◐Vitor│ ▓                   ▓│ │                  │█    14:24 ✓✓   █│  │▒
▒│▓      ▓│ ▓                   ▓│ │                  │█  bg-gold ink  █│  │▒
▒│▓      ▓│ ▓                   ▓│ │                  └─────────────────┘  │▒
▒│       │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │       ← bolha enviada (gold + ink)     │▒
▒│       │                          │                                        │▒
▒│       │                          │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        │▒
▒│       │                          │ ▓◐ digitando ●●● (pulse-live) ▓        │▒
▒│       │                          │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        │▒
▒│       │                          │                                        │▒
▒│       │                          │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒│       │                          │ ▓ ░ bg-sunken input sticky       ▓ │▒
▒│       │                          │ ▓ 📎 {Mensagem…       😀  ➤}     ▓ │▒
▒│       │                          │ ▓ ↑ input-focus-glow + ring-pulse  ▓ │▒
▒│       │                          │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │▒
▒└───────┴─────────────────────────┴────────────────────────────────────────┘▒
```

## 5.3 Mobile 375px

### Lista de conversas

```
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒ ☰ Chat · 12      🔍          ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒                                ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ ◐ Loja Sul    ● 2m         ▓ ▒
▒ ▓   Tá com 20% de descon…    ▓ ▒
▒ ▓   [WA]                     ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ ◐ Moda Mile   ● 15m        ▓ ▒
▒ ▓   Vou fechar amanhã        ▓ ▒
▒ ▓   [IG]                     ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ▓ ◐ Atacadão Roupas          ▓ ▒
▒ ▓   Obrigado! Tudo certo     ▓ ▒
▒ ▓   [WC]            1h       ▓ ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒
▒ ...                            ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
[Bottom nav]
```

### Conversa aberta

```
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒ ← ◐ Loja Sul ● online   ⋯   ▒  ← bg-card sticky
▒   [WA]  ◐ Vitor              ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒        Hoje, 14:23            ▒
▒                                ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        ▒
▒ ▓█ Tá com 20% de    ▓█        ▒  ← recebida bg-elevated
▒ ▓█ desconto?        ▓█        ▒    text-primary
▒ ▓█           14:23 ✓▓█        ▒
▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        ▒
▒                                ▒
▒                ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒
▒                █Olá! Sim, no █  ▒  ← enviada bg-gold
▒                █atacado acima█  ▒    text-ink
▒                █de 10 peças. █  ▒
▒                █     14:24 ✓✓█  ▒
▒                ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒
▒                                ▒
▒ ▓ ◐ digitando ●●● pulse ▓     ▒
▒                                ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒ ░░░░░░░░░░░░░░░░░░░░░░░░░░░ ▒  ← bg-sunken input sticky
▒ 📎 {Mensagem…    😀   ➤}     ▒  ← input-focus-glow + ring-pulse
▒ ░░░░░░░░░░░░░░░░░░░░░░░░░░░ ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

## 5.4 Tokens usados (Chat)

| Token | Onde |
|---|---|
| `bg-canvas` | `<body>` |
| `bg-card` + `border-sutil` | Sidebar nav, sidebar conversas, header da conversa |
| `bg-elevated` + `inner-light` | **Bolha recebida** (cliente) |
| `bg-elevated` em conversa ativa na lista | Conversa selecionada |
| `--brand-gold` bg + `--brand-ink` text | **Bolha enviada** (vendedor — "a marca falando") |
| `--metric-positive` `#3DD58C` + `pulse-live` | Dot online + "digitando" |
| `bg-sunken` | Input sticky |
| `input-focus-glow` + `ring-pulse` | Input ao focar (mantido v4) |
| `--font-hind` 400 | Texto das bolhas |
| `--text-muted` text-xs | Timestamps |
| Channel pill `[WA]` color | Header da conversa |

## 5.5 Microinterações

1. **Conversa nova chega:** item da lista pulse-live 800ms; badge dot count incrementa.
2. **Selecionar conversa:** bg fade para `--bg-elevated` em 120ms; chevron `›` aparece.
3. **Bolha recebida (nova):** entra com `translateY 8px → 0` + opacity em 180ms.
4. **Presence dot:** `pulse-live` 1.6s ease infinite.
5. **"digitando…":** 3 dots opacity 0.4 → 1 escalonado.
6. **Input focus:** `input-focus-glow` + `ring-pulse` 1×.
7. **Enviar mensagem:** botão ➤ pulse + bolha aparece slide-up; check muda ✓ → ✓✓ quando entregue.

## 5.6 Estados

| Estado | Visual |
|---|---|
| Loading (lista) | 6 skeleton list items shimmer-dark |
| Loading (mensagens) | 3 skeleton bolhas alternadas |
| Empty (sem conversa) | "Nenhuma conversa ativa" + ícone outline |
| Empty (conversa nova) | "Comece a conversa enviando uma mensagem" |
| Error envio | Bolha com border `--metric-negative` + ⚠ + "Tocar para tentar novamente" |
| Offline | Banner sticky `metric-warning-soft` "Você está offline — mensagens serão enviadas ao reconectar" |

---

# Anexos comuns a todas as telas (v5)

## A. Sidebar (dark)

- Desktop: fixa 240px com `bg-card` + `border-sutil` à direita.
- Mobile: drawer `Sheet` shadcn side="left" com `bg-elevated`. Overlay `bg-overlay` sólido 72%.
- Item ativo: `bg-elevated` + dot gold à esquerda + texto `--text-primary`.
- Item inativo: text `--text-muted`, hover → text `--text-primary` + bg `bg-elevated/40`.

## B. Bottom navigation mobile (`< sm`)

```
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒  📋    👥     💬    ✅    ⋯  ▒  ← bg-card + border-sutil
▒ Pipe  Lead  Chat  Tar   Mais  ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

- Altura 56px.
- Item ativo: ícone + label `--brand-gold` + dot gold sob o ícone.
- Item inativo: `--text-muted`.
- Touch target ≥ 44px (375 / 5 = 75px por item).

## C. FAB (Floating Action Button) — em todas as telas exceto Login

- Posição: `fixed bottom-6 right-6` (24px from edges) desktop; em mobile, `bottom-20 right-4` (acima do bottom nav).
- Conteúdo: ícone `Plus` lucide 24px centralizado.
- Tooltip "Novo lead (N)" no hover desktop.
- Atalho de teclado: **N** (não conflita).
- Em **Chat**: FAB vira `Edit3` "Nova conversa"; em **Tarefas**: vira `CheckSquare` "Nova tarefa". Contexto-aware.

## D. Toaster (sonner) — posições e variants

- Desktop: `bottom-left` (porque `bottom-right` é onde está o FAB).
- Mobile: `top-center` (não colide com bottom nav).
- Variants dark: success (left border `--metric-positive`), warning (`--action-warning`), error (`--metric-negative`), info (`--chart-primary`).

## E. BrandMark — monograma TM tipográfico (decisão Tania 2026-05-25)

> **Especificação completa:** ver `design-system-v5.md` §5.9 `BrandMark` / `TechmalhasLogo`.
> **Decisão:** monograma deixa de ser "T" em quadrado e passa a ser **"TM" em Hind 700** (fonte real do site, 2125× uso dominante). Cor: **gold `#E79501`** (acento real da marca, AAA contraste no dark, amarra TM com FAB + primary CTA + ring focus). Glow `text-shadow` 24px gold 35% no dark; sem glow no light/print/avatar.

| Variante | Onde aparece | Tipografia | Cor | Glow | Sufixo |
|---|---|---|---|---|---|
| **`hero`** | Login centro do card (40px) | Hind 700 letter-spacing -0.04em | gold `#E79501` | ✅ sim | "CRM" 12px uppercase tracking-wide |
| **`sidebar`** | Sidebar expanded 240px (28px) | Hind 700 letter-spacing -0.04em | gold `#E79501` | ✅ sim | "echmalhas" 14px `--text-muted` |
| **`sidebar-collapsed`** | Sidebar collapsed 64px (32px) | Hind 700 letter-spacing -0.04em | gold `#E79501` | ✅ sim | — |
| **`mark`** | Favicon, ícone PWA (32px SVG) | Hind 700 (SVG `<text>` ou path) | gold `#E79501` sobre canvas `#0A0B0D` rounded 6px | ❌ não (raster pequeno) | — |
| **`avatar`** | Avatar fallback (LeadCard sem foto, 20px em círculo `bg-elevated`) | Hind 700 letter-spacing -0.04em | `--text-primary` off-white | ❌ não (não competir com avatares reais de clientes) | — |
| **`print`** | Relatórios impressos do dashboard | Hind 700 | ink `#141414` | ❌ não | "echmalhas" `#666666` |

### Anatomia visual do BrandMark

```
hero (login):                sidebar expanded:           sidebar collapsed:
┌─────────────────┐         ┌──────────────────┐        ┌──────┐
│                 │         │                  │        │      │
│  ✦ TM ✦         │         │ ✦TM ✦echmalhas   │        │ ✦TM✦ │
│       CRM       │         │ 28px gold  14px  │        │ 32px │
│   12px muted    │         │ +glow     muted  │        │ +glow│
│                 │         └──────────────────┘        └──────┘
└─────────────────┘
40px gold +glow

avatar fallback (LeadCard sem foto):     favicon (32×32 SVG):
┌────────┐                              ┌────┐
│ ╭────╮ │                              │TM  │  ← gold sobre rounded-square dark
│ │ TM │ │  ← 20px off-white,            │ TM │     16px, sem glow (raster)
│ ╰────╯ │     SEM glow                   │    │
│ círculo │     (não rouba foco           └────┘
│ bg-elev │      em listas)
└────────┘
```

### Por quê gold (e não teal-sage ou gradiente)

Davi avaliou 3 opções com WCAG e contexto de marca:
- **Gold `#E79501` ✅ escolhida** — 8.0:1 AAA, **é** o acento real do site (estrelas, "mais vendidos"), amarra TM ao sistema visual (FAB, primary, ring).
- Teal-sage `#5BA89A` — 5.2:1 AA, mas é **derivado** para charts; sage no site é **muted** por intenção, contradiz semântica.
- Gradiente gold→teal-sage — viraria visual "tech startup AI"; Techmalhas é editorial/atemporal.

Decisão registrada em `design-system-v5.md` §5.9.1 e `adr-010-design-system-v5-dark.md` D8.

## F. ThemeToggle (UserMenu)

Item de menu no `UserMenu` (DropdownMenu):

```
[ Sun icon ]  Tema: Escuro  ✓
[ Moon icon ] Tema: Claro
```

- Persiste em localStorage via next-themes.
- Default: **dark** (decisão Tania 2026-05-25, pivot v5).
- Switch < 100ms (CSS class change).

---

*Wireframes v5 — Davi Designer | CRM Techmalhas | 2026-05-25*
