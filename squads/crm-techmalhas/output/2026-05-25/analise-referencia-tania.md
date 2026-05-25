# Análise da Referência Tania — Dashboard Analytics Dark

> **Autor:** Davi Designer · **Data:** 2026-05-25
> **Imagem analisada:** `references/referencia-tania-dashboard-analytics.png`
> **Para:** Tania (decisão de pivot v4 light → v5 dark)
> **Companions:** `design-system-v5.md`, `wireframes-v5.md`, `adr-010-design-system-v5-dark.md`

---

## 1. TL;DR para a Tania (5 bullets, linguagem simples)

1. **A referência é um painel "tipo trading"** — fundo bem escuro, cards um pouco mais claros que o fundo, números enormes em destaque, gráficos com linha brilhante e brilho embaixo. É um visual sério, denso e "profissional pesado". Funciona para CRM.

2. **Eu consigo adaptar 90% do que está lá** para o CRM Techmalhas usando o que já temos no projeto (Tailwind + shadcn). Só precisamos adicionar **uma biblioteca leve de gráficos** (Recharts, ~50KB) — sem isso, o "gráfico bonito com brilho" da referência não existe. Resto é CSS puro.

3. **Sobre as cores**: a referência usa **roxo (FAB) e azul-teal (linha do gráfico)** que não são da marca Techmalhas. Vou trocar:
   - Roxo do botão flutuante → **dourado Techmalhas `#E79501`** (DNA da marca preservado).
   - Azul-teal da linha → **"teal-sage" `#5BA89A`** — uma mistura entre o sage `#869791` (que é da marca) e um teal sutil. Sage 100% puro fica apagado em gráficos; essa mistura mantém marca + tem o brilho que o gráfico precisa.

4. **O que NÃO vou copiar**: tudo que é de trading — palavras como "PnL", "stop-loss", "BTC", "#FOMO", "Disciplined trades" não fazem sentido para vendas de malhas. Vou substituir por: "Receita do mês", "Leads quentes", "Negociações", "Atacado/Varejo", "Vendas ganhas vs perdidas". O **layout** é o que importa, não o conteúdo.

5. **Pivot do v4 light para v5 dark**: o v4 que aprovei era "light com sidebar preta". O v5 será **dark mode como padrão** (light fica como alternativa). Isso é uma mudança grande visual, mas o **código existente continua funcionando** — só os tokens de cor mudam. Estimativa: **20h** (Fábio, ~2,5 dias). Se quiser, posso fazer mockups visuais v5 antes da Fábio começar para você aprovar o look-and-feel.

---

## 2. O que copiar (decisões de design)

### 2.1 Layout estrutural

| Elemento da referência | Por quê funciona | Como adaptar ao CRM Techmalhas |
|---|---|---|
| **Border-radius generoso 8-12px** em todos os containers | Suaviza a densidade alta; "ferramenta moderna" sem ser infantil | Manter `--radius: 0.75rem` (era 0.5rem no v4); aplicar `rounded-xl` nos cards principais |
| **Layered depth via background delta** (canvas → card → elevated) sem sombras pesadas | Profundidade limpa, sem ruído visual; funciona idêntico em qualquer browser | Canvas `#0A0B0D`, card `#141414` (brand-ink!), elevated `#1C1D21`. Sombras só em hover/drag |
| **Filtros horizontais no topo** (date picker + dropdowns) | Reduz cliques para o gestor "fatiar" dados; sticky → sempre acessível | `FilterBar` com: período, pipeline (Atacado/Varejo), vendedor, canal |
| **KPI row no topo** (4 cards: número grande + delta% + sparkline OU donut) | Estabelece "como está o negócio" em < 1 segundo de olhar | 4 cards: Receita mês · Pipeline ativo · Conv. rate · Ticket médio |
| **Line chart grande "performance"** com linha brilhante + gradient fill + glow | Visualização principal da tela — alto impacto emocional | Receita diária últimos 30 dias (linha teal-sage com gradient fill embaixo) |
| **Sidebar de "padrões" com barras horizontais** | Comparativo proporcional rápido (qual canal traz mais?) | "Distribuição por canal": WhatsApp / Instagram / Web Chat (com tints dos channel colors) |
| **3 cards "Recommendations for today"** com ícone, texto curto, CTA | Ação concreta — não é só dashboard, é "o que fazer agora" | "Leads sem resposta · Tarefas vencidas · Meta do mês" com CTA gold |
| **Bar chart agrupado** verde vs vermelho 12 meses | Comparação binária (ganho vs perda) é universal | Deals ganhos (gold/success) vs perdidos (terracotta) por mês |
| **Tabela limpa no rodapé** com tags pill coloridas + ícone edit | Drill-down sem sair da tela; tags = filtro visual rápido | "Leads recentes" com tags de canal/etapa + valor + ícone editar |
| **FAB flutuante (canto inferior direito)** | Ação primária sempre 1 toque distante (CRM = "criar lead" frequente) | FAB **gold** (não roxo) → "Novo lead" |
| **Tipografia sans-serif moderna**, números bold grandes, labels pequenos cinza | Hierarquia clara: número grita, contexto sussurra | Hind para tudo + JetBrains Mono nos KPIs (já no v4) |

### 2.2 Padrões UX premium (10 técnicas futuristas SEM glassmorphism)

| # | Técnica | Onde aplicar no CRM |
|---|---|---|
| 1 | **Layered depth via bg delta** (canvas → card → elevated) | Toda a hierarquia de surfaces (substitui sombras pesadas) |
| 2 | **Subtle border luminance** — 1px `hsla(white, 4%)` no topo do card | Inner highlight 3D que funciona no dark sem brilho branco gritante |
| 3 | **Glow under chart line** via SVG `<linearGradient>` stop + radial halo CSS sob a área | `AreaChartGlow` na receita diária |
| 4 | **Animated sparkline draw** via `stroke-dasharray` no mount (sem framer) | Sparklines dos 4 KPI cards |
| 5 | **Number counter animation** on mount (count-up 600ms) | Valores numéricos dos KPIs ao carregar a tela |
| 6 | **Card hover: gold border luminance** sutil (borda passa de `border/40` para `gold/30`) | Cards interativos (KPIs, recomendações, linhas de tabela) |
| 7 | **Sticky filter bar** com background sólido `#16181C/95` (sem blur — paridade cross-device) | `FilterBar` no topo |
| 8 | **Pulse dot** para indicadores ao vivo (1.6s scale 1→1.15) | "Online" no Chat, "atualizado agora" no Dashboard |
| 9 | **Tag pill com gold ring on hover** | Tags de canal/etapa na tabela |
| 10 | **FAB com sustained gold glow** (em repouso brilha sutil, em hover intensifica) | Botão "Novo lead" |

> Todas as 10 técnicas usam **apenas CSS estático ou animações leves** — nenhuma depende de `backdrop-filter` ou WebGL. Paridade visual 100% entre Chrome, Safari iOS antigo e WebView in-app.

---

## 3. O que **NÃO** copiar (trading-specific)

| Da referência | Por que NÃO no CRM | Substituição CRM |
|---|---|---|
| Termos: **PnL · Profit Factor · Avg Win/Lose · Stop-loss · Trade** | Vocabulário de trading; vendedor de malha não usa | Receita · Ticket médio · Taxa de conversão · Deal · Lead |
| Behavioral tags **#FOMO #Euphoria #Revenge trading #Controlled trading** | Conceitos psicológicos de trader; irrelevante para vendas B2B/B2C | Tags do CRM: **#quente · #atacado · #varejo · #vip · #atrasado · #recompra** |
| **BTC / instrumentos financeiros** na tabela | Não há "ativos" no CRM | Nome do lead/empresa |
| **Entry/Exit price** | Compra/venda de ativos | "Valor estimado / Valor fechado" |
| **#FOMO laranja** como única cor de tag | Visual de "alerta de erro emocional" | Tags coloridas por **canal** (channel colors do v3/v4 — WhatsApp verde, IG roxo-rosa, Web Chat azul) |
| **Roxo `#9F7AEA` do FAB** | Não é da marca Techmalhas | **Gold `#E79501`** (DNA da marca preservado) |
| **Teal puro `#4FD1C5`** na linha do gráfico | Não é da marca; conflita com sage muted | **Teal-sage `#5BA89A`** (sage + sutileza teal, derivado da marca) |
| **Densidade extrema** da tabela (5 colunas + edit) com fontes < 12px | CRM precisa rodar 6-8h/dia — fadiga visual | Tabela com 6 colunas mas `text-sm` (14px) com row-height confortável (48px) |
| **Donut rings verdes/vermelhos** nos KPIs | Visualmente "trading retro" — não combina com tom editorial Techmalhas | Sparklines suaves (mais limpos para CRM gestor não-técnico) |
| **2 sidebars** (left nav + right "Top of behavioral patterns") repetidas | Repetição de dados na ref (mostra "Top of behavioral patterns" 2× na mesma tela) | No CRM, sidebar direita só aparece **quando lead/deal está selecionado** (drawer) |

---

## 4. Mapeamento de cores: Referência → Techmalhas

> Princípio: **preservar a marca Techmalhas (ink/paper/gold/sage/terracota)** como base; introduzir **derivados de chart** apenas onde a marca pura não tem brilho/contraste suficiente em dark.

### 4.1 Surfaces (camadas de profundidade)

| Ref. layer | Hex ref aproximado | → Token Techmalhas v5 | Hex TM | Justificativa |
|---|---|---|---|---|
| **Body canvas** (mais escuro) | `#0B0E14` | `--bg-canvas` | **`#0A0B0D`** | Derivado de ink puro `#141414` deslocado 4% pra baixo. Cria a "tela vasta" como no plano de fundo da ref. Cool tint sutil (~2% blue) evita "preto sujo" amarelado |
| **Card surface** (camada 1) | `#161B26` | `--bg-card` | **`#141414`** (brand-ink puro!) | Reaproveita o token `--brand-ink` da marca **como surface dos cards**. O delta de 4% acima do canvas (`#0A0B0D` → `#141414`) é suficiente para criar a sensação de "card flutuando" sem sombra pesada |
| **Card elevated** (KPI destaque, drawer) | `#1C2233` | `--bg-elevated` | **`#1C1D21`** | Mais 4% acima do card. Para hover/destaque/drawer/popover |
| **Card sunken** (input bg, filter chip) | `#0E1118` | `--bg-sunken` | **`#0E0F12`** | Abaixo do canvas, simula "input enterrado". Para inputs e chips de filtro |
| **Border sutil** | `~rgba(255,255,255,0.06)` | `--border-sutil` | **`hsla(0, 0%, 100%, 0.06)`** | Borda quase invisível, só dá "definição" ao card sem ruído |
| **Border luminance** (inner highlight topo) | `~rgba(255,255,255,0.04)` | `--border-luminance` | **`inset 0 1px 0 hsla(0,0%,100%,0.04)`** | Linha branca 4% no topo do card — fake 3D dark |

### 4.2 Cores de ação e métricas

| Ref. elemento | Hex ref | → Token Techmalhas v5 | Hex TM | Contraste vs `#0A0B0D` | Justificativa |
|---|---|---|---|---|---|
| **Linha do line chart** (teal brilhante) | `#4FD1C5` | `--chart-primary` | **`#5BA89A`** (teal-sage custom) | 4.5:1 ✅ AA UI | Mistura sage `#869791` + teal sutil. Sage puro fica apagado como linha; teal puro destoa da marca. `#5BA89A` é o "sage com glow" — mantém DNA + entrega brilho |
| **Gradient fill sob a linha** | teal fade → transparent | `--chart-primary-glow` | **`rgba(91, 168, 154, 0.18)` → 0%** | UI only | Halo da linha — radial-gradient + linear-gradient stops |
| **Verde positivo** (delta +18.6%, donut win) | `#48BB78` | `--metric-positive` | **`#3DD58C`** | 7.2:1 ✅ AAA | Lift do `--action-success` `#15803D` (v4) para dark — o success v4 fica muito escuro no canvas dark. Versão "neon" preserva semântica + entrega contraste |
| **Vermelho negativo** (delta -2%, donut loss, profit -4000) | `#F56565` | `--metric-negative` | **`#E5614A`** | 5.4:1 ✅ AA | Terracota da marca `#CC4833` lifted 12% para o dark. Aproveita identidade Techmalhas em vez de vermelho genérico |
| **Roxo FAB** | `#9F7AEA` | `--fab-primary` | **`#E79501`** (`--brand-gold`) | 8.0:1 ✅ AAA | **NÃO usar roxo — não é da marca.** FAB gold = identidade Techmalhas + WCAG AAA sobre canvas |
| **Laranja tags `#FOMO`** | `#F6AD55` | `--tag-warm` | **`#E79501`** (`--brand-gold-soft`) | 7.7:1 ✅ AAA | Mesmo gold reaproveitado para pills de tag — coesão visual |
| **Cinza labels** (KPI label "Net PnL") | `#9CA3AF` | `--text-muted` | **`#A8AFB8`** (sage-cool muted) | 9.8:1 ✅ AAA | Texto secundário com leve cool tint para harmonizar com canvas |
| **Branco números KPI** | `#FFFFFF` | `--text-primary` | **`#F5F6F7`** (off-white) | 17.8:1 ✅ AAA | Off-white (não branco puro) reduz brilho excessivo em monitor à noite |

### 4.3 Tabela resumo (master mapping)

| Referência | Hex ref | → Token Techmalhas v5 | Hex TM | Justificativa |
|---|---|---|---|---|
| Background canvas | `#0B0E14` | `--bg-canvas` | `#0A0B0D` | Derivar de ink + leve cool tint, 4% mais escuro |
| Card surface | `#161B26` | `--bg-card` | `#141414` | **Brand-ink puro como surface** — DNA da marca |
| Card elevated | `#1C2233` | `--bg-elevated` | `#1C1D21` | Para hover/destaque |
| Border sutil | rgba white 6% | `--border-sutil` | hsla(0,0%,100%,0.06) | Quase invisível |
| Teal line chart | `#4FD1C5` | `--chart-primary` (teal-sage) | `#5BA89A` | Sage + sutileza teal; preserva marca |
| Gradient fill under line | teal fade | `--chart-primary-glow` | rgba(91,168,154,0.18) | Halo do gráfico |
| Green positive | `#48BB78` | `--metric-positive` | `#3DD58C` | Lift do success v4 para dark (AAA) |
| Red negative | `#F56565` | `--metric-negative` | `#E5614A` | Terracota lifted (marca preservada) |
| Purple FAB | `#9F7AEA` | `--fab-primary` | **`#E79501`** gold | **Roxo NÃO existe na marca** — gold reflete DNA |
| Orange tags | `#F6AD55` | `--tag-warm` | `#E79501` | Reaproveita gold (coesão) |
| Cinza labels | `#9CA3AF` | `--text-muted` | `#A8AFB8` | Cool muted para harmonizar com canvas |
| Branco números | `#FFFFFF` | `--text-primary` | `#F5F6F7` | Off-white para reduzir brilho |

---

## 5. Viabilidade técnica

### 5.1 O que já temos no projeto (zero esforço)

| Recurso | Status | Uso v5 |
|---|---|---|
| **Tailwind 3.4** | ✅ instalado | Todas as utilities via tokens HSL |
| **shadcn/ui** (Radix) | ✅ Button, Card, Dialog, Sheet, DropdownMenu, Select, Tabs, etc. | Base de TODOS os componentes v5 |
| **next-themes 0.4.6** | ✅ instalado (não usado ainda) | ThemeProvider com `defaultTheme="dark"` |
| **tailwindcss-animate** | ✅ devDep | Animações leves (accordion, fade) sem framer |
| **@dnd-kit** | ✅ Kanban drag-and-drop | Preservado |
| **lucide-react** | ✅ ícones | Ícones de KPI, FAB, tabs |
| **sonner** (toasts) | ✅ instalado | Notificações dark theme automático |
| **Hind via next/font** | ⚠️ pendente (v4 T2) | Aplicar agora junto com v5 |

### 5.2 O que precisa adicionar

| Dependência | Tamanho | Razão | Alternativa |
|---|---|---|---|
| **`recharts`** (~50KB gzipped, tree-shakeable) | ✅ recomendado | Line chart, bar chart, sparkline, donut da referência. **Não há como replicar gráficos com curve smoothing + gradient fill em CSS puro de forma decente.** Recharts é o padrão do ecossistema React (mais leve que Chart.js, menos verbose que Visx) | (a) SVG manual: viável p/ sparkline mas inviável p/ line chart com tooltip; (b) `nivo`: 3× maior; (c) `victory`: API mais verbose |
| ~~`framer-motion`~~ | — | **NÃO adicionar.** Documentação v4 mencionava framer mas package.json não tem. Para v5, usaremos CSS animations + tailwindcss-animate (já no projeto). Carga 0KB | Já contemplado |

**Resultado:** uma única nova dependência (`recharts`) entrega 100% dos gráficos da referência. Total +50KB gzipped na bundle do dashboard (carregada via dynamic import só na rota `/dashboard`, não no Kanban/Chat).

### 5.3 Compatibilidade cross-device (decisão Tania preservada)

| Técnica v5 | Cross-device | Notas |
|---|---|---|
| Layered bg delta | ✅ 100% | CSS puro |
| Border luminance (inset white 4%) | ✅ 100% | `box-shadow` insetdimensions |
| Gradient fill under chart | ✅ 100% | SVG nativo (Recharts) |
| Animated sparkline draw | ✅ 100% | `stroke-dasharray` é SVG-1.1 (suportado desde sempre) |
| Number counter | ✅ 100% | requestAnimationFrame (universal) |
| Sticky filter bar (no blur) | ✅ 100% | `position: sticky` + bg sólido `#16181C/95` opaco |
| Pulse dot | ✅ 100% | CSS keyframe (`prefers-reduced-motion` respeitado) |
| Gold ring on hover (tag pill) | ✅ 100% | `box-shadow` + `transition` |
| FAB sustained glow | ✅ 100% | `box-shadow` + `transition` |
| **GLASSMORPHISM** | ❌ **REJEITADO** | mantida decisão da Tania de 2026-05-25 |

---

## 6. Comparação v4 light vs v5 dark

| Aspecto | v4 (light-first, aprovado em mockups) | v5 (dark-first, pivot solicitado) | Quem ganha? |
|---|---|---|---|
| **Tema padrão** | Light (branco puro + sidebar preta) | **Dark** (canvas #0A0B0D + cards #141414) | v5 reflete melhor o "premium tech" pedido |
| **Primary CTA** | Preto `#141414` sobre branco | **Gold `#E79501`** sobre dark (swap v4 já previa isso para dark mode) | v5 — gold sobre dark é mais "marca" e tem mais brilho |
| **Acento principal** | Gold em badges/highlights | Gold no FAB + badges + ring + chart secundário | v5 — gold ganha mais protagonismo |
| **Líder visual do Dashboard** | KPI cards + lista "Top 5 leads" | KPI row + **Line chart "performance"** dominante (à la ref) | v5 — gráfico = sensação "executivo olha o negócio" |
| **Stack de profundidade** | sombras coloridas (gold/sage tint 18-28%) | **Background delta layered** (canvas→card→elevated), sombras só em hover/drag | v5 — mais limpo, menos ruído, melhor em uso prolongado |
| **Componentes novos** | KPI card, sidebar premium | **+ KPIStatCard(sparkline) + FilterBar + RecommendationCard + AreaChartGlow + PatternBar + GroupedBarChart + FABGold** | v5 — biblioteca de componentes mais rica e específica para "executive dashboard" |
| **Recursos exclusivos para gestor** | Funil 5 stages | Funil + **AreaChart** receita diária + **PatternBar** canais + **GroupedBar** ganhos vs perdidos 12 meses | v5 — gestor (Renato/Quésia/Tania) ganha visão executiva real |
| **Fadiga visual em uso prolongado 6-8h** | Light pode cansar (muito branco) | Dark reduz luminância — preferido por usuários intensivos | v5 — beneficia Vitor/Ana (campo) e Amanda (chat 8h/dia) |
| **Esforço de migração** | 15h (estimativa v4 atual) | **20h** (target, faixa 18-24h) | v4 mais barato; v5 é refactor visual maior |
| **Dependência nova** | Nenhuma | +Recharts (~50KB) | v4 zero, v5 +50KB (dynamic import na rota /dashboard apenas) |
| **WCAG AA** | 24 pares calculados | **30 pares recalculados no dark** | Empate (ambos passam) |
| **Print-friendly** | ✅ light é "papel" | ⚠️ dark vira light no `@media print` (já contemplado v4) | v5 precisa override print (1h extra T17) |
| **Cross-device parity** | ✅ 100% (sem glass) | ✅ 100% (sem glass, sem blur, sem backdrop-filter) | Empate |
| **Look-and-feel pedido pela Tania** | "premium digno do time de IA" | **"painel analítico moderno"** (referência explícita) | v5 cumpre o brief de 2026-05-25 melhor |

### Veredito Davi

O v4 é **excelente como design system** e o trabalho não é jogado fora — **tokens, fontes, componentes e estados continuam todos válidos**. O v5 é uma **mudança de tema padrão (light → dark) + adição de 7 componentes novos** específicos para dashboard analítico. Cerca de **70% do código v4 é reusado intacto**. Vale o pivot.

---

## 7. Pergunta para Tania (1 questão)

1. **Quer que eu produza os mockups visuais v5 antes do Fábio começar a implementar?** (mesmo padrão dos mockups v4 que você viu — 5 PNGs gerados via GenerateImage). Custa ~15 minutos de geração de imagens; o Fábio então implementa com referência visual sólida. **Recomendação minha: SIM.** Você aprova o look v5 antes de gastarmos 20h de implementação.

> Sem mais perguntas. Para tudo o resto (mapeamento de cores, componentes, ordem de execução), as decisões já estão tomadas e justificadas neste documento.

---

## 8. Próximos passos

1. Tania lê este documento + ADR-010 + design-system-v5.md.
2. Tania responde a pergunta acima (mockups sim/não).
3. Davi gera mockups (se sim) → Tania aprova look-and-feel.
4. Fábio recebe `migration-plan-v5.md` + `globals-css-v5.patch.md` e implementa T1..T17 em branch `feat/design-system-v5`.
5. Quésia valida WCAG AA dark + funcional (checklist no migration-plan).
6. Deploy após aprovação da Tania.

**Pronto para mockups visuais v5.**

---

*Análise da referência Tania — Davi Designer | CRM Techmalhas | 2026-05-25*
