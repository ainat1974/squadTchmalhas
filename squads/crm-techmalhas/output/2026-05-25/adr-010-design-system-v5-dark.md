# ADR-010: Pivot v4 Light-First → v5 Dark-First Inspirado em Painel Analítico

**Data:** 2026-05-25
**Status:** Proposto, aguardando go/no-go da Tania
**Decisor:** Davi Designer (UX/UI do squad)
**Aprovador:** Tania (Techmalhas, PO)
**Referência visual:** `references/referencia-tania-dashboard-analytics.png`
**Inputs:** `brand-audit-techmalhas-site.md`, `adr-009-design-system-v4.md`
**Companions:** `analise-referencia-tania.md`, `design-system-v5.md`, `wireframes-v5.md`, `globals-css-v5.patch.md`, `migration-plan-v5.md`
**Implementação:** Fábio Fullstack (estimativa **20h target**, faixa 18-24h, branch `feat/design-system-v5`)

---

## Contexto

A v4 do design system (`adr-009-design-system-v4.md`) entregou:
- Paleta literal da marca Techmalhas (ink/paper/gold/sage/terracota) extraída ao vivo do site.
- Camada premium sólida (sem glassmorphism — decisão Tania de 2026-05-25).
- Light mode como padrão; dark como toggle opt-in.
- 5 mockups visuais (`mockups/mockup-v4-*.png`) que a Tania revisou.

Após ver os mockups v4 light, a Tania **mudou de direção** e forneceu uma nova referência visual (`references/referencia-tania-dashboard-analytics.png`) — um **painel analítico dark mode estilo trading/fintech** (canvas `~#0B0E14`, cards layered, KPI row com sparklines, line chart com gradient fill e glow teal brilhante, sidebar de "padrões" com barras horizontais, recommendations row, bar chart grouped, tabela com tags pill, FAB roxo).

A Tania pediu para que o CRM **seja inspirado nessa referência** — preservando:
- A marca Techmalhas (ink/paper/gold/sage/terracota — sem roxo).
- A decisão anti-glassmorphism (paridade cross-device).
- O trabalho v4 onde for reutilizável (tokens, fontes, channel/stage colors).
- Adaptações para o domínio de vendas B2B/B2C (não trading).

---

## Forças (constraints)

| # | Restrição | Implicação |
|---|---|---|
| F1 | Referência visual é dark-first com layered surfaces | Tema padrão do v5 deve ser dark; light vira opt-in |
| F2 | Marca Techmalhas não tem roxo | FAB roxo da ref → gold Techmalhas |
| F3 | Marca Techmalhas usa sage muted, não teal puro | Linha de chart vira "teal-sage" `#5BA89A` (sage + sutileza teal) |
| F4 | Glassmorphism continua rejeitado pela Tania (decisão 2026-05-25 mantida) | Todas as técnicas v5 devem ser CSS estático + animações leves; sem `backdrop-filter` |
| F5 | Vocabulário é vendas B2B/B2C, não trading | "PnL/Stop-loss/BTC/#FOMO" → "Receita/Tarefas/Lead/canal" |
| F6 | Vitor/Ana usam o CRM 6-8h/dia em campo (mobile) | Dark mode reduz fadiga visual; FAB para "novo lead" 1 toque |
| F7 | Stack atual: Next 16 + React 19 + Tailwind 3 + shadcn + dnd-kit + next-themes (já instalado) | Reuso ~70% do v4; adicionar apenas Recharts |
| F8 | WCAG AA não-negociável | Recalcular 24+ pares no dark theme |
| F9 | Tania não tolera inconsistência cross-device (rejeição do glass foi por isso) | v5 deve renderizar idêntico em Chrome desktop / Safari iOS antigo / WebView in-app |
| F10 | Tempo de Fábio é limitado | Estimativa precisa caber em 2-3 dias úteis (target 20h) |
| F11 | Mockups v4 light JÁ foram gerados e Tania revisou (esforço sunk) | Não rejeitar v4 totalmente — light fica como opt-in |
| F12 | Renato (gestor) precisa de visão executiva real | Dashboard ganha gráficos reais (AreaChart, GroupedBar) — não só KPI cards |

---

## Alternativas consideradas

### Opção A — Manter v4 light-first como aprovado

- ✅ **Prós:** zero retrabalho; mockups v4 já validados; sem nova dependência.
- ❌ **Contras:** ignora a referência explícita da Tania de 2026-05-25; CRM continua "site de produto" em vez de "ferramenta executiva premium"; dashboard sem gráficos reais (Renato/Quésia/Tania olham métricas mas não veem evolução temporal).
- ⚠️ **Risco:** Tania perde confiança no squad por não atender à direção dada.
- ⏱️ **Tempo:** 0h (mas resultado: insatisfação da PO).

### Opção B — Adotar referência literalmente (com roxo, teal puro, trading vocabulary)

- ✅ **Prós:** "fiel à referência".
- ❌ **Contras:** **quebra a marca Techmalhas** (roxo não existe); confunde Vitor (vocabulário de trading); estética destoa do site (`techmalhas.com.br`).
- ⚠️ **Risco:** Tania olha o CRM ao lado do site e vê duas marcas diferentes.
- ⏱️ **Tempo:** ~15h (menos análise de adaptação, mas inutilizável).

### Opção C — Adotar referência com adaptação para marca + vocabulário Techmalhas (PIVOT v5) ✅ **ESCOLHIDA**

- ✅ **Prós:**
  - Atende à direção da Tania ("inspirado na referência").
  - Preserva 100% da marca Techmalhas (sem roxo, sem teal puro).
  - Reutiliza ~70% do v4 (tokens, fontes, channel/stage colors, anti-glass).
  - Adiciona valor real para Renato/Quésia/Tania (gráficos executivos: AreaChart + GroupedBar).
  - FAB gold = mais 1 ponto de DNA da marca + UX ganha "novo lead" 1-tap.
  - Dark mode reduz fadiga para Vitor/Ana em uso prolongado.
  - Mantém light mode como opt-in (mockups v4 não são jogados fora).
- ❌ **Contras:**
  - 20h de Fábio (era 0h se mantivesse v4).
  - +50KB de Recharts no bundle do `/dashboard` (mitigado por dynamic import).
  - WCAG AA precisa ser recalculado para o dark theme.
- ⚠️ **Risco baixo:** todas as decisões são reversíveis (toggle light mode preservado).
- ⏱️ **Tempo:** **20h target** (faixa 18-24h).

### Opção D — Dark mode obrigatório (sem opção de light)

- ✅ **Prós:** simplifica codebase; menos QA (1 tema só).
- ❌ **Contras:** Renato pode preferir light em monitor externo na sala de reunião; print stylesheet força light de qualquer jeito; o trabalho dos mockups v4 light vira lixo.
- ⏱️ **Tempo:** 19h (−1h de QA do light).

**Veredito:** **Opção C** vence. Atende a referência, preserva marca, reutiliza trabalho, é reversível.

---

## Decisão

**Adotar Design System v5 dark-first inspirado na referência analítica da Tania**, com as seguintes regras:

1. **Tema padrão é DARK** (canvas `#0A0B0D`, card `#141414` = brand-ink puro, elevated `#1C1D21`).
2. **Light mode disponível como opt-in** via toggle no `UserMenu` (mockups v4 light continuam válidos para light theme).
3. **FAB e CTAs primários no dark = GOLD `#E79501`** (DNA Techmalhas, NÃO roxo).
4. **Linha principal de chart = teal-sage `#5BA89A`** (derivado de sage `#869791` + sutileza teal — preserva marca, ganha brilho).
5. **Métricas positivo/negativo no dark = `#3DD58C` / `#E5614A`** (lift do success/terracota v4 para AAA contraste).
6. **Adicionar Recharts** (~50KB gzipped, dynamic import na rota `/dashboard`) para AreaChartGlow e GroupedBarChart. Sparkline é SVG puro (não usa Recharts).
7. **+7 componentes novos:** `KPIStatCard`, `FilterBar`, `RecommendationCard`, `AreaChartGlow`, `PatternBar`, `GroupedBarChart`, `DataTableDark`, `FABGold`.
8. **Glassmorphism continua REJEITADO** (decisão Tania 2026-05-25 preservada).
9. **Vocabulário trading da referência (PnL, stop-loss, #FOMO) NÃO é copiado** — adaptado para vendas (Receita, Tarefas, Tags de canal).
10. **WCAG AA recalculado** para 24+ pares no dark theme; light mantém os 24 pares do v4.
11. **Channel colors e stage colors do v3/v4 são PRESERVADOS** (com lifts para dark) — Vitor/Ana não precisam reaprender.
12. **Print stylesheet força light** (papel) — relatórios impressos da Tania mantêm legibilidade.

---

## Consequências

### Positivas

- ✅ **Atende à direção da Tania** explicitamente formulada via referência visual.
- ✅ **Posiciona o CRM como "ferramenta executiva premium"** — Renato/Quésia/Tania ganham visão real de evolução temporal (AreaChart 30d, GroupedBar 12m).
- ✅ **Dark reduz fadiga visual** em uso prolongado (Vitor/Ana 6-8h/dia em campo; Amanda 8h/dia no chat).
- ✅ **FAB gold** acelera o fluxo mais frequente do Vitor ("criar novo lead").
- ✅ **DNA Techmalhas reforçado** — gold aparece mais (FAB + primary + ring + sparkline secundário).
- ✅ **Reuso ~70% do v4** — tokens, fontes, channel/stage colors, anti-glass, accessibility patterns todos mantidos.
- ✅ **Light continua disponível** — mockups v4 não são jogados fora; toggle no UserMenu.
- ✅ **Paridade cross-device 100%** mantida (sem `backdrop-filter`, sem `mask-image` custom).
- ✅ **Visão executiva real** com `AreaChartGlow` (receita 30d) + `GroupedBarChart` (ganhos vs perdidos 12m).

### Negativas (mitigações)

- ❌ **20h de Fábio** (era 0h se mantivesse v4 puro).
  - **Mitigação:** plano detalhado em `migration-plan-v5.md`; T1-T3 são bloqueantes mas baratos (4h); T5-T12 são componentes independentes que podem rodar em paralelo se houver bandwidth.
- ❌ **+50KB Recharts** no bundle.
  - **Mitigação:** dynamic import via `lazy()`; Recharts entra apenas em `/dashboard`; bundle de `/pipeline`, `/leads`, `/chat` permanece igual.
- ❌ **Risco de FOUC** light → dark no first paint.
  - **Mitigação:** `next-themes` com `<script>` inline (default behavior) + `suppressHydrationWarning` no `<html>`. Testar em throttling 3G.
- ❌ **WCAG AA precisa ser recalculado para dark** (24+ pares).
  - **Mitigação:** já feito em `design-system-v5.md` §7; QA Quésia valida com axe DevTools em T17.
- ❌ **Mudança visual grande** vs v3 deployed (verde floresta).
  - **Mitigação:** Tania já viu os mockups v4 e aceitou a mudança de paleta; pivot v5 é incremento sobre a mudança v4, não uma terceira reviravolta.
- ❌ **Light mode opt-in pode ser confuso** ("o app abre dark, mas eu prefiro light").
  - **Mitigação:** toggle no UserMenu (Sun/Moon icon óbvio); persiste em localStorage; documentar no onboarding "default dark, mas você pode trocar".
- ❌ **Stage colors em dark podem ter contraste reduzido se usados como texto puro.**
  - **Mitigação:** já modelado no `globals.css` v5 — sempre `chip bg 16% + texto cor pura`, nunca texto sobre canvas.

### Reversibilidade

**Alta.** Se a Tania decidir voltar para v4 light-first:
1. Trocar `defaultTheme="dark"` para `"light"` no `ThemeProvider.tsx` (1 linha).
2. Os componentes novos (`KPIStatCard`, `AreaChartGlow`, etc.) continuam funcionando em light (Recharts respeita tokens HSL via classe `.light`).
3. Custo de reversão: ~30 minutos.

**Total reversibilidade:** se a Tania quiser jogar fora 100% o v5 e voltar ao v4:
1. `git revert` da branch `feat/design-system-v5` antes do merge.
2. Custo: 0h (rollback git).

---

## Métricas de sucesso (revisar 2 semanas pós-deploy)

| Métrica | Baseline (v3 atual) | Meta v5 | Como medir |
|---|---|---|---|
| **Tempo médio para Vitor criar 1 lead** | ~25s | < 15s (FAB sempre acessível) | Telemetria backend (timestamp lead.createdAt vs login session) |
| **Cliques médios para Renato ver "evolução de receita mensal"** | ∞ (não tem feature) | 1 clique (entra no Dashboard) | UX research session |
| **Fadiga visual subjetiva** (Vitor/Ana) | "cansa em ~4h" (anedotal) | "sem queixas após 8h" | Survey 2 semanas pós-deploy |
| **Toggle light/dark uso** | n/a | < 10% dos usuários ativam light (valida que dark default é preferido) | localStorage telemetria |
| **Bundle size /dashboard** | ~180KB | ≤ 240KB (gzip) | `pnpm build` analyze |
| **Lighthouse Accessibility /dashboard** | 100 | 100 (mantido) | CI check |
| **axe DevTools violations** | 0 (light) | 0 (dark + light) | Quésia QA |

---

## Plano de comunicação

- **Pré-merge:** Davi apresenta este ADR + mockups v5 (se Tania pedir) para Tania → Tania aprova ou pede ajustes.
- **Pré-deploy:** Davi escreve release notes em PT-BR no chat do squad: "CRM v5 chegou — fundo escuro + gráficos novos + botão flutuante. Toggle ☀/🌙 no menu do usuário se quiser voltar para fundo claro."
- **Pós-deploy:** Davi acompanha primeiros 3 dias para coletar feedback Vitor/Ana/Amanda/Renato. Se >2 reclamações sobre dark padrão, considera reverter default para light (toggle preservado).

---

## Decisões adjacentes (informacionais — não bloqueiam ADR-010)

| # | Decisão | Status |
|---|---|---|
| D1 | Adicionar Recharts vs Visx/nivo/Chart.js | ✅ Recharts (tree-shakeable, padrão React, 50KB) |
| D2 | Adicionar Framer Motion vs CSS animations | ❌ Não adicionar Framer (não está no package.json); usar CSS keyframes + tailwindcss-animate (já instalado) |
| D3 | Toggle light na UserMenu vs settings page | ✅ UserMenu (1-click, padrão da indústria) |
| D4 | Default dark vs auto-detect prefers-color-scheme | ✅ Default dark (decisão Tania explícita); `enableSystem={false}` |
| D5 | Light invertido fiel ao v4 vs light "simplificado" | ✅ Light = v4 invertido (preserva trabalho dos mockups) |
| D6 | Print = sempre light vs print = current theme | ✅ Print sempre light (papel não é dark) |
| D7 | FAB atalho de teclado | ✅ **N** para "Novo" (não conflita com nada existente) |
| D8 | Monograma TM + wordmark stacked (Tania 2026-05-25 pós-mockups v5, refinado 18:00) | ✅ **"TM" em Hind 700 gold `#E79501` destacado** com **"CRM Techmalhas" empilhado logo abaixo** (lockup vertical, não inline) conforme feedback Tania 2026-05-25. Davi avaliou gold vs teal-sage vs gradiente para o TM; gold venceu por (1) ser o acento real da marca no site, (2) WCAG AAA 8.0:1 no dark, (3) amarrar TM com FAB+primary+ring. Para o wordmark "CRM Techmalhas", Davi avaliou monocromático off-white vs bicolor "CRM" gold + "Techmalhas" branco; **monocromático off-white venceu** por (1) preservar hierarquia símbolo > wordmark, (2) respeitar regra "1 acento gold por composição local", (3) leitura unitária do wordmark. Glow text-shadow 24px gold 35% só no TM e só no dark; wordmark sem glow, Hind 500 tracking-wider (`0.14em` hero / `0.08em` sidebar). Sidebar collapsed e favicon mostram só TM (sem wordmark). **Spec completa:** `design-system-v5.md` §5.9 (.1 cor TM, .3 escala, .5 React, .6 tratamento wordmark, .9 variantes light/dark/print); **CSS:** `globals-css-v5.patch.md` utilities §14b (`.brand-tm`, `.brand-tm-glow`, `.brand-wordmark-stack`, `.brand-tm-avatar`); **wireframes:** todas as 5 telas atualizadas em `wireframes-v5.md` Anexo E. **Impacto no plano:** +1h em T14 (Fábio cria componente `BrandMark.tsx` com 5 variants + favicon SVG durante refactor do Login). |

---

## Próximos passos (sequência sugerida)

1. **Tania revisa este ADR + analise-referencia-tania.md + design-system-v5.md** (15min de leitura).
2. **Tania responde** à pergunta única em `analise-referencia-tania.md` §7: gerar mockups visuais v5 antes do Fábio implementar?
3. **Se sim:** Davi gera 5 mockups via GenerateImage (~15min); Tania aprova look-and-feel; → step 4.
4. **Tania dá go/no-go ao ADR-010.**
5. **Se go:** Fábio inicia implementação seguindo `migration-plan-v5.md` (T1..T17, ~20h, branch `feat/design-system-v5`).
6. **Quésia valida** com checklist completo do plano de migração (WCAG AA dark, axe DevTools, browser matrix).
7. **Tania aprova preview Vercel** → merge → deploy produção.
8. **Davi monitora** primeiros 3 dias para feedback de Vitor/Ana/Amanda/Renato; ajustes pontuais via patches v5.1.

---

*ADR-010 — Davi Designer | CRM Techmalhas | 2026-05-25*
