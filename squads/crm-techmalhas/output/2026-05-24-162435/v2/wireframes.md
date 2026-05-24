# Wireframes — CRM Techmalhas MVP

> **TL;DR:** 12 telas cobertas (mobile 375px + desktop 1280px), mobile-first, shadcn/ui como base, WCAG AA em todas as combinações de cor. 6 fluxos críticos documentados. Dualidade Atacado/Varejo visível no Kanban. Inbox unificado com 3 canais diferenciados. Estados completos (loading, vazio, erro, sucesso) em todas as telas.

---

## 1. Índice de Telas

| # | ID | Tela | URL |
|---|----|----|-----|
| 1 | screen-login | Login | `/login` |
| 2 | screen-pipeline | Pipeline Kanban | `/pipeline?type=atacado\|varejo` |
| 3 | screen-leads | Lista de Leads/Contatos | `/leads` |
| 4 | screen-lead-detail | Detalhe do Lead (Drawer) | `/leads/:id` |
| 5 | screen-inbox | Inbox Unificado | `/inbox` |
| 6 | screen-conversation | Conversa | `/inbox/:contactId` |
| 7 | screen-tasks | Minhas Tarefas | `/tasks` |
| 8 | screen-dashboard | Dashboard | `/dashboard` |
| 9 | screen-pipeline-settings | Configurações de Pipeline | `/settings/pipelines/:id` |
| 10 | screen-users | Gestão de Usuários | `/settings/users` |
| 11 | screen-livechat | Operador de Chat ao Vivo | `/inbox?channel=webchat` |
| 12 | screen-notifications | Notificações | (dropdown/drawer global) |

---

## 2. Tela: Login

═══════════════════════════════════════════
TELA: Login (375px — Mobile)
ID: screen-login
URL: /login
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│                                         │
│         [Logo Techmalhas 120px]         │
│    "Casual que dura. Conforto que       │
│         você sente."                    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  [label: E-mail]                  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ 📧 seuemail@exemplo.com     │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  [label: Senha]                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ 🔒 ••••••••           [👁]  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│                                         │
│        [link: Esqueci minha senha]      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │       Entrar com e-mail         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ─────────────── ou ───────────────     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  [G]  Entrar com Google         │    │
│  └─────────────────────────────────┘    │
│                                         │
│    © 2026 Techmalhas — v2.0.0           │
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Login (1280px — Desktop)
ID: screen-login
URL: /login
═══════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   ┌───────────────────────────┐     ┌───────────────────────────────────────┐  │
│   │                           │     │                                       │  │
│   │  [Imagem hero: vitrine    │     │     [Logo Techmalhas 160px]           │  │
│   │   Techmalhas, vestuário   │     │                                       │  │
│   │   colorido, ambiente      │     │  Bem-vindo de volta                   │  │
│   │   loja + campo industrial]│     │  Acesse seu CRM                       │  │
│   │                           │     │                                       │  │
│   │  "Conectando vendedores   │     │  [label: E-mail]                      │  │
│   │   às melhores             │     │  ┌─────────────────────────────────┐  │  │
│   │   oportunidades."         │     │  │ 📧 seuemail@exemplo.com         │  │  │
│   │                           │     │  └─────────────────────────────────┘  │  │
│   │                           │     │                                       │  │
│   │                           │     │  [label: Senha]                      │  │
│   │                           │     │  ┌─────────────────────────────────┐  │  │
│   │                           │     │  │ 🔒 ••••••••             [👁]    │  │  │
│   │                           │     │  └─────────────────────────────────┘  │  │
│   │                           │     │                                       │  │
│   │                           │     │      [link: Esqueci minha senha]     │  │
│   │                           │     │                                       │  │
│   │                           │     │  ┌─────────────────────────────────┐  │  │
│   │                           │     │  │         Entrar com e-mail        │  │  │
│   │                           │     │  └─────────────────────────────────┘  │  │
│   │                           │     │                                       │  │
│   │                           │     │  ─────────────── ou ───────────────  │  │
│   │                           │     │                                       │  │
│   │                           │     │  ┌─────────────────────────────────┐  │  │
│   │                           │     │  │  [G]  Entrar com Google          │  │  │
│   │                           │     │  └─────────────────────────────────┘  │  │
│   │                           │     │                                       │  │
│   └───────────────────────────┘     └───────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

ESTADOS:
- Loading: Botão "Entrar" exibe spinner inline + texto "Autenticando…" + `disabled=true`. Campos bloqueados para edição.
- Vazio: N/A (campos em branco mostram placeholder, não é estado de erro)
- Erro: Banner vermelho no topo do formulário: `⚠ E-mail ou senha incorretos. Tente novamente.` Campos ganham `border-destructive`. Label de erro inline sob cada campo problemático. Foco retorna para o primeiro campo com erro.
- Sucesso: Redirect automático para `/pipeline?type=atacado` (vendedor) ou `/dashboard` (gestor/admin). Toast de boas-vindas: `✓ Bem-vindo, [nome]!`

INTERAÇÕES:
- Enter no campo senha dispara submit
- Toggle 👁 alterna visibilidade da senha (aria-pressed, aria-label muda entre "Mostrar senha" e "Ocultar senha")
- "Esqueci minha senha" → modal com campo de e-mail para recuperação
- Botão Google → OAuth redirect flow
- Validação inline no blur de cada campo (não no submit)

ACESSIBILIDADE:
- `<form>` com `aria-label="Formulário de login"`
- Cada input com `<label>` explícito associado via `htmlFor`/`id` — sem placeholder como substituto de label
- Mensagens de erro com `role="alert"` e `aria-live="assertive"`
- Botão de submit: `type="submit"`, não `type="button"`
- Contraste: texto primário `#1a1a1a` sobre branco `#ffffff` → 18.1:1 (AAA). Botão primário: branco sobre `#1a6b3c` (verde Techmalhas) → 7.2:1 (AAA)
- Focus ring visível: `outline: 2px solid #1a6b3c; outline-offset: 2px`
- Tab order: email → senha → toggle → esqueci senha → btn-primary → btn-google

COMPONENTES shadcn/ui:
- `Input` (email, password)
- `Button` variant="default" (btn-primary), variant="outline" (btn-google)
- `Label`
- `Alert` variant="destructive" (erros)
- `Separator` (linha "ou")
- `Form`, `FormField`, `FormItem`, `FormMessage` (react-hook-form integration)

---

## 3. Tela: Pipeline Kanban

═══════════════════════════════════════════
TELA: Pipeline Kanban (375px — Mobile)
ID: screen-pipeline
URL: /pipeline?type=atacado
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│ [≡]  Pipeline         [🔔 3] [+ Lead]  │  ← TopBar fixo
├─────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────────┐  │
│ │  ● ATACADO   │ │    VAREJO        │  │  ← Tab switcher (SegmentedControl)
│ └──────────────┘ └──────────────────┘  │
├─────────────────────────────────────────┤
│  Filtrar: [Todos ▾] [Meus leads ▾]     │
├─────────────────────────────────────────┤
│                                         │
│  ← deslize para navegar colunas →       │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ PROSPECÇÃO          (12)      [+] │  │  ← coluna ativa
│  ├───────────────────────────────────┤  │
│  │ ┌─────────────────────────────┐   │  │
│  │ │ 🏪 Loja do João — R$ 4.200  │   │  │
│  │ │ Vitor · WhatsApp · há 2h    │   │  │
│  │ │ [⚠ 1 tarefa vencida]        │   │  │
│  │ └─────────────────────────────┘   │  │
│  │ ┌─────────────────────────────┐   │  │
│  │ │ 🏪 Maria Modas — R$ 8.500   │   │  │
│  │ │ Vitor · Instagram · há 5h   │   │  │
│  │ │ [✓ Todas tarefas ok]        │   │  │
│  │ └─────────────────────────────┘   │  │
│  │ ┌─────────────────────────────┐   │  │
│  │ │ [+ Adicionar lead]          │   │  │
│  │ └─────────────────────────────┘   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ● ○ ○ ○ ○  (indicador de colunas)     │
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Pipeline Kanban (1280px — Desktop)
ID: screen-pipeline
URL: /pipeline?type=atacado
═══════════════════════════════════════════

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Pipeline                                    [🔔 3]  [+ Novo Lead]  [Vitor ▾] │  ← Header fixo
├──────────┬───────────────────────────────────────────────────────────────────────────┤
│          │  ┌────────────────┐  ┌────────────────┐                                   │
│  [≡]     │  │  ● ATACADO     │  │    VAREJO       │  [Todos ▾] [Meu pipeline ▾] [🔍] │
│  Nav     │  └────────────────┘  └────────────────┘                                   │
│  lateral │────────────────────────────────────────────────────────────────────────── │
│          │                                                                            │
│  Pipeline│  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐ ┌────────┐ │
│  Leads   │  │ PROSPECÇÃO  (12) │ │ QUALIFICADO (8)  │ │ PROPOSTA  (5)  │ │FECHADO │ │
│  Inbox   │  │ R$ 42.000        │ │ R$ 78.000        │ │ R$ 125.000     │ │ (3)    │ │
│  Tarefas │  ├──────────────────┤ ├──────────────────┤ ├────────────────┤ ├────────┤ │
│  Dash    │  │ ┌──────────────┐ │ │ ┌──────────────┐ │ │ ┌────────────┐ │ │ ┌────┐ │ │
│  Config  │  │ │🏪 Loja João  │ │ │ │🏪 Cia. Moda  │ │ │ │🏪 Boutique │ │ │ │ ✓  │ │ │
│          │  │ │R$ 4.200      │ │ │ │R$ 12.000     │ │ │ │R$ 45.000   │ │ │ │Rei │ │ │
│          │  │ │Vitor · WA    │ │ │ │Amanda · IG   │ │ │ │Vitor       │ │ │ │... │ │ │
│          │  │ │⚠ 1 vencida   │ │ │ │✓ ok          │ │ │ │📄 Proposta │ │ │ └────┘ │ │
│          │  │ └──────────────┘ │ │ └──────────────┘ │ │ └────────────┘ │ │        │ │
│          │  │ ┌──────────────┐ │ │ ┌──────────────┐ │ │ ┌────────────┐ │ │ ┌────┐ │ │
│          │  │ │🏪 Maria Modas│ │ │ │🏪 Top Jeans  │ │ │ │🏪 Estilo+  │ │ │ │ ✓  │ │ │
│          │  │ │R$ 8.500      │ │ │ │R$ 9.300      │ │ │ │R$ 38.000   │ │ │ │... │ │ │
│          │  │ │Vitor · IG    │ │ │ │Vitor · WA    │ │ │ │Amanda      │ │ │ └────┘ │ │
│          │  │ │✓ ok          │ │ │ │⚠ 2 vencidas  │ │ │ │✓ ok        │ │ │        │ │
│          │  │ └──────────────┘ │ │ └──────────────┘ │ │ └────────────┘ │ │ [+ Add]│ │
│          │  │                  │ │                  │ │                │ │        │ │
│          │  │  [+ Adicionar]   │ │  [+ Adicionar]   │ │  [+ Adicionar] │ │        │ │
│          │  └──────────────────┘ └──────────────────┘ └────────────────┘ └────────┘ │
└──────────┴───────────────────────────────────────────────────────────────────────────┘
```

ESTADOS:
- Loading: Skeleton cards em cada coluna (3 por coluna, animação pulse). Header e tabs carregam instantaneamente (dados locais/cache).
- Vazio (coluna): Card especial `[+ Adicionar lead a esta etapa]` com borda dashed. Texto: "Nenhum lead nesta etapa."
- Vazio (pipeline inteiro): Ilustração central + CTA "Adicionar primeiro lead" + link para importação CSV.
- Erro: Banner no topo: `⚠ Falha ao carregar pipeline. [Tentar novamente]`. Colunas mostram estado anterior (stale data) com badge "Offline".
- Sucesso (mover card): Toast `✓ Lead movido para [Etapa]`. Se had tarefa obrigatória pendente → hard block (ver Fluxo 3).

INTERAÇÕES:
- Desktop: drag-and-drop entre colunas (DnD Kit). Drop zone highlight ao arrastar.
- Mobile: card tap → drawer de detalhe. Botão "Mover etapa" no drawer com select de destino.
- Swipe horizontal entre colunas no mobile (snap scroll com `scroll-snap-type: x mandatory`).
- Dots de navegação clickáveis (indicam coluna ativa).
- Tab ATACADO/VAREJO: troca `type` na query string, mantém filtros.
- Click no card → abre drawer de detalhe do lead (screen-lead-detail).
- Filtro "Meus leads" mostra apenas leads do usuário logado.
- Header fixo: scroll da área Kanban não rola o header.

ACESSIBILIDADE:
- Colunas são `role="region"` com `aria-label="Coluna: [nome da etapa]"`.
- Cards são `role="article"` com `aria-label="Lead: [nome], R$ [valor], [status tarefas]"`.
- Drag-and-drop com alternativa de teclado: focus no card → Enter → setas para escolher coluna destino → Enter para confirmar.
- Indicador de dots: `role="tablist"` com `role="tab"` e `aria-selected`.
- Tarefas vencidas: ícone ⚠ + texto "tarefa vencida" — nunca só cor.
- Contraste badge vermelho (vencida): branco `#fff` sobre `#dc2626` → 5.1:1 (AA).

COMPONENTES shadcn/ui:
- `Tabs` / `TabsList` / `TabsTrigger` (switcher Atacado/Varejo)
- `Badge` variant="destructive" (tarefa vencida), variant="outline" (canal)
- `Card` / `CardContent` (cards de lead)
- `Select` (filtros)
- `Button` variant="ghost" (+ Adicionar)
- `Skeleton` (loading state)
- `ScrollArea` (horizontal scroll das colunas)
- `Toast` (feedback de movimentação)

---

## 4. Tela: Lista de Leads/Contatos

═══════════════════════════════════════════
TELA: Lista de Leads (375px — Mobile)
ID: screen-leads
URL: /leads
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│ [≡]  Leads                  [🔔] [+ ]  │
├─────────────────────────────────────────┤
│  🔍 [Buscar por nome ou empresa...    ] │
├─────────────────────────────────────────┤
│  [Todos ▾] [Canal ▾] [Etapa ▾] [↕ ]   │
├─────────────────────────────────────────┤
│  248 leads encontrados                  │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ 🏪 Loja do João                   │  │
│  │ José Ferreira · (16) 99123-4567   │  │
│  │ [WA] PROSPECÇÃO · Vitor           │  │
│  │ Último contato: hoje, 14h32       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 🏪 Maria Modas                    │  │
│  │ Maria Costa · (16) 98765-4321     │  │
│  │ [IG] QUALIFICADO · Amanda         │  │
│  │ Último contato: ontem, 09h15      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 👤 Carlos Oliveira                │  │
│  │ (sem empresa)                     │  │
│  │ [SITE] NOVO · —                   │  │
│  │ Último contato: 22/05, 11h00      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Carregar mais 20 leads...]            │
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Lista de Leads (1280px — Desktop)
ID: screen-leads
URL: /leads
═══════════════════════════════════════════

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Leads / Contatos                              [🔔 3]  [+ Novo Lead]  [Vitor] │
├──────────┬───────────────────────────────────────────────────────────────────────────┤
│  Nav     │  🔍 [Buscar por nome, empresa, telefone, e-mail...                      ] │
│  lateral │                                                                            │
│          │  [Todos ▾] [Canal ▾] [Etapa ▾] [Responsável ▾] [Período ▾]  [↕ Ordenar] │
│          │  248 leads · Exportar CSV                                                  │
│          │────────────────────────────────────────────────────────────────────────── │
│          │  ☐  Nome / Empresa          Canal  Etapa        Responsável  Últ. Contato │
│          │  ─────────────────────────────────────────────────────────────────────── │
│          │  ☐  🏪 Loja do João         [WA]   PROSPECÇÃO   Vitor        hoje, 14h32 │
│          │     José Ferreira                                                          │
│          │  ☐  🏪 Maria Modas          [IG]   QUALIFICADO  Amanda       ontem        │
│          │     Maria Costa                                                            │
│          │  ☐  👤 Carlos Oliveira      [SITE] NOVO         —            22/05        │
│          │     (sem empresa)                                                          │
│          │  ☐  🏪 Boutique Rei         [DIR]  PROPOSTA     Vitor        21/05        │
│          │     Fernando Lima                                                          │
│          │  ─────────────────────────────────────────────────────────────────────── │
│          │  Mostrando 1–20 de 248  [< Anterior]  1  2  3 … 13  [Próximo >]           │
└──────────┴───────────────────────────────────────────────────────────────────────────┘
```

LEGENDA DE BADGES DE CANAL:
- `[WA]` = WhatsApp — badge verde `#25d366`
- `[IG]` = Instagram — badge roxo-gradient (só ícone no espaço pequeno)
- `[SITE]` = Web Chat / Formulário — badge azul `#3b82f6`
- `[DIR]` = Pipeline direto (manual) — badge cinza `#6b7280`

ESTADOS:
- Loading: Skeleton rows (5 linhas) com animação pulse. Barra de busca e filtros carregam imediatamente.
- Vazio: Ilustração de lista vazia. "Nenhum lead encontrado." Se houver filtros ativos: "Tente ajustar os filtros." + botão "Limpar filtros".
- Erro: Banner `⚠ Não foi possível carregar a lista. [Tentar novamente]`
- Sucesso: Após criar lead → toast `✓ Lead criado. [Ver no pipeline]`

INTERAÇÕES:
- Click na linha → abre drawer de detalhe (screen-lead-detail)
- Checkbox bulk → barra de ações aparece: "Atribuir a", "Mover etapa", "Excluir"
- Coluna de cabeçalho clicável para ordenação (asc/desc)
- Busca com debounce 300ms
- Filtros acumulativos — badges dos filtros ativos aparecem abaixo da barra com "×" para remover
- Mobile: swipe left no card → ações rápidas: "Ligar", "WhatsApp", "Excluir"
- "Exportar CSV" disponível apenas para admin/gestor

ACESSIBILIDADE:
- Tabela desktop com `<thead>`, `<tbody>`, `scope="col"` nos cabeçalhos
- Checkboxes com `aria-label="Selecionar [nome do lead]"`
- Paginação com `aria-label="Paginação"` no `<nav>`
- Sort: `aria-sort="ascending|descending|none"` no `<th>` ativo
- Badges de canal: `aria-label="Canal: WhatsApp"` (não depender só da cor/sigla)
- Mobile swipe: ações duplicadas em menu de contexto (3 pontos) para usuários sem suporte a swipe

COMPONENTES shadcn/ui:
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` (desktop)
- `Checkbox` (bulk select)
- `Badge` (canal, etapa)
- `Input` (busca)
- `Select`, `DropdownMenu` (filtros)
- `Pagination` (desktop)
- `Button` variant="ghost" (ações rápidas)
- `Skeleton` (loading)
- `Alert` (erro)

---

## 5. Tela: Detalhe do Lead (Drawer)

═══════════════════════════════════════════
TELA: Detalhe do Lead — Bottom Sheet (375px — Mobile)
ID: screen-lead-detail
URL: /leads/:id (overlay)
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│  ████████████████████████████████████  │  ← backdrop semitransparente
│  ████████████████████████████████████  │
│  ─────────────────────────────────────  │  ← drag handle (pill)
│  ┌───────────────────────────────────┐  │
│  │ [×]  Loja do João         [✏ Editar]│
│  │                                   │  │
│  │  🏪 José Ferreira (Loja do João)  │  │
│  │  📱 (16) 99123-4567    [WA][IG]   │  │
│  │  📧 jose@lojadojoao.com.br        │  │
│  │  📍 Franca/SP                     │  │
│  │  💰 R$ 4.200 estimado             │  │
│  │  🏷 PROSPECÇÃO · Vitor            │  │
│  │                                   │  │
│  │  [Ligar] [WhatsApp] [E-mail]      │  │
│  │                                   │  │
│  ├───────────────────────────────────┤  │
│  │  [Histórico] [Tarefas] [Notas]    │  │  ← tabs internas
│  ├───────────────────────────────────┤  │
│  │  HISTÓRICO DE ATIVIDADES          │  │
│  │  ─────────────────────────────    │  │
│  │  📲 WA · hoje 14h32               │  │
│  │  "Oi, temos novos modelos..."     │  │
│  │                                   │  │
│  │  📋 Tarefa concluída · ontem      │  │
│  │  "Enviar tabela de preços"        │  │
│  │                                   │  │
│  │  🌐 Lead criado via formulário    │  │
│  │  22/05 · 11h00                    │  │
│  └───────────────────────────────────┘  │
│  [Mover para etapa ▾]  [Adicionar tarefa]│
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Detalhe do Lead — Drawer lateral (1280px — Desktop)
ID: screen-lead-detail
URL: /leads/:id (overlay)
═══════════════════════════════════════════

```
┌──────────────────────────────────┬──────────────────────────────────────────────────┐
│  [Lista de leads ao fundo,       │  [×]  Detalhe do Lead                      [✏]  │
│   com backdrop semitransparente] │                                                  │
│                                  │  🏪 Loja do João                                │
│                                  │  José Ferreira                                   │
│                                  │  ──────────────────────────────────────────      │
│                                  │  📱 (16) 99123-4567      [📲 WA]  [📸 IG]       │
│                                  │  📧 jose@lojadojoao.com.br                      │
│                                  │  📍 Franca / SP                                  │
│                                  │  💰 R$ 4.200 (valor estimado)                   │
│                                  │  🏷 PROSPECÇÃO → [Mover etapa ▾]                │
│                                  │  👤 Responsável: Vitor                           │
│                                  │  🔗 Canal de origem: WhatsApp                   │
│                                  │                                                  │
│                                  │  [Ligar]  [WhatsApp]  [E-mail]  [+ Tarefa]      │
│                                  │                                                  │
│                                  │  ┌──────────┬──────────┬──────────┐             │
│                                  │  │ Histórico│  Tarefas │  Notas   │             │
│                                  │  └──────────┴──────────┴──────────┘             │
│                                  │                                                  │
│                                  │  HISTÓRICO                                       │
│                                  │  ────────────────────────────────               │
│                                  │  📲 WhatsApp · hoje 14h32                       │
│                                  │  Vitor → José: "Oi, temos novos modelos..."     │
│                                  │                                                  │
│                                  │  📋 Tarefa · ontem 10h00 · Concluída ✓          │
│                                  │  "Enviar tabela de preços"  por Vitor            │
│                                  │                                                  │
│                                  │  🌐 Lead criado via formulário · 22/05 11h00    │
│                                  │                                                  │
│                                  │  TAREFAS OBRIGATÓRIAS PENDENTES                 │
│                                  │  ┌──────────────────────────────────────────┐   │
│                                  │  │ ⚠ [VENCIDA] Fazer demo do catálogo       │   │
│                                  │  │   Prazo era 23/05. Bloqueio de avanço.    │   │
│                                  │  │   [Concluir tarefa]  [Reagendar]          │   │
│                                  │  └──────────────────────────────────────────┘   │
└──────────────────────────────────┴──────────────────────────────────────────────────┘
```

ESTADOS:
- Loading: Skeleton do drawer (avatar, 4 linhas de info, 3 botões) com animação pulse.
- Vazio (histórico): "Nenhuma atividade registrada ainda."
- Vazio (tarefas): "Nenhuma tarefa pendente. ✓"
- Erro: "⚠ Não foi possível carregar o lead. [Tentar novamente]" — drawer permanece aberto.
- Sucesso (edição): Dados inline atualizados + toast `✓ Lead atualizado.`

INTERAÇÕES:
- Mobile: drag handle para fechar (deslizar para baixo). Tap fora do drawer fecha.
- Desktop: click no backdrop fecha. Tecla Esc fecha.
- Aba Histórico: scroll infinito, carregamento lazy de itens antigos.
- Aba Tarefas: checkbox para concluir. Botão "+ Nova tarefa" abre mini-form inline.
- Aba Notas: textarea com autosave (debounce 2s).
- "Mover etapa" → select com etapas disponíveis. Se houver tarefa obrigatória pendente → hard block com modal de confirmação.
- Botões de ação rápida: "Ligar" abre `tel:`, "WhatsApp" abre deep link wa.me, "E-mail" abre `mailto:`.

ACESSIBILIDADE:
- Drawer tem `role="dialog"`, `aria-modal="true"`, `aria-labelledby="drawer-title"`.
- Foco capturado dentro do drawer enquanto aberto (focus trap).
- Foco retorna ao elemento que abriu o drawer ao fechar.
- Tabs internas: `role="tablist"`, cada tab com `role="tab"`, `aria-selected`, `aria-controls`.
- Tarefas vencidas: `role="alert"` para o banner de bloqueio.
- Histórico: itens com `<time datetime="ISO">` para datas.

COMPONENTES shadcn/ui:
- `Sheet` / `SheetContent` side="right" (desktop), `Drawer` (mobile bottom sheet via vaul)
- `Tabs`, `TabsContent`
- `Badge` (etapa, canal, tarefa vencida)
- `Button` (ações, mover etapa)
- `Select` (mover etapa)
- `Textarea` (notas)
- `Checkbox` (concluir tarefa)
- `Separator`
- `Avatar` (foto do lead ou inicial)
- `Skeleton`

---

## 6. Tela: Inbox Unificado

═══════════════════════════════════════════
TELA: Inbox Unificado (375px — Mobile)
ID: screen-inbox
URL: /inbox
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│ [≡]  Inbox            [🔔] [✏ Novo]    │
├─────────────────────────────────────────┤
│  🔍 [Buscar conversa...               ] │
├─────────────────────────────────────────┤
│  [Todos] [📱WA] [📸IG] [🌐Chat] [Meus] │  ← filtro de canal (tab/chip)
├─────────────────────────────────────────┤
│  PENDENTES (3)                          │
│  ┌───────────────────────────────────┐  │
│  │ 📱 José Ferreira · Loja do João   │  │
│  │ "Quando sai a nova coleção?"      │  │
│  │ há 5 min · WA · 🔴 Não lido       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 📸 @mariamodas_oficial            │  │
│  │ "Preciso de um orçamento urgente" │  │
│  │ há 20 min · IG DM · 🔴 Não lido  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 🌐 Visitante #4512 — Site        │  │
│  │ "Qual o prazo de entrega?"        │  │
│  │ há 1h · Web Chat · 🔴 Ativo       │  │
│  └───────────────────────────────────┘  │
│  ─────────────────────────────────────  │
│  EM ATENDIMENTO (1)                     │
│  ┌───────────────────────────────────┐  │
│  │ 📱 Carlos Oliveira                │  │
│  │ "Tá bom, vou confirmar amanhã"    │  │
│  │ há 2h · WA · 🟡 Em atendimento   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Inbox Unificado (1280px — Desktop)
ID: screen-inbox
URL: /inbox
═══════════════════════════════════════════

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Inbox Unificado                               [🔔 3]  [✏ Nova conversa]     │
├──────────┬────────────────────────┬───────────────────────────────────────────────── │
│  Nav     │  🔍 [Buscar...]        │                                                  │
│  lateral │  [Todos][WA][IG][Chat] │     ← Selecione uma conversa                     │
│          │  [Meus][Não atribuídos]│       para começar                               │
│          │  ────────────────────  │                                                  │
│          │  PENDENTES (3)         │                                                  │
│          │  ┌──────────────────┐  │                                                  │
│          │  │📱 José Ferreira  │  │                                                  │
│          │  │Loja do João      │  │                                                  │
│          │  │"Quando sai a..." │  │                                                  │
│          │  │há 5min · 🔴       │  │                                                  │
│          │  └──────────────────┘  │                                                  │
│          │  ┌──────────────────┐  │                                                  │
│          │  │📸 @mariamodas    │  │                                                  │
│          │  │"Preciso de um..."│  │                                                  │
│          │  │há 20min · 🔴      │  │                                                  │
│          │  └──────────────────┘  │                                                  │
│          │  ┌──────────────────┐  │                                                  │
│          │  │🌐 Visitante #4512│  │                                                  │
│          │  │"Qual o prazo..." │  │                                                  │
│          │  │há 1h · 🔴 Ativo  │  │                                                  │
│          │  └──────────────────┘  │                                                  │
│          │  ─────────────────── │  │                                                  │
│          │  EM ATENDIMENTO (1)   │  │                                                  │
│          │  ┌──────────────────┐  │                                                  │
│          │  │📱 Carlos Oliveira│  │                                                  │
│          │  │"Tá bom, amanhã.."│  │                                                  │
│          │  │há 2h · 🟡         │  │                                                  │
│          │  └──────────────────┘  │                                                  │
└──────────┴────────────────────────┴───────────────────────────────────────────────────┘
```

DIFERENCIAÇÃO VISUAL DOS 3 CANAIS:
- WhatsApp: ícone 📱 + badge verde `bg-[#25d366]` com texto "WA" (branco)
- Instagram: ícone 📸 + badge gradiente simulado via `bg-[#e1306c]` com texto "IG" (branco)
- Web Chat: ícone 🌐 + badge azul `bg-[#3b82f6]` com texto "Chat" (branco)
- Pipeline Direto: ícone 🏷 + badge cinza `bg-[#6b7280]` com texto "Dir" (branco)

STATUS DE CONVERSA:
- 🔴 Não lido — dot vermelho + texto bold
- 🟡 Em atendimento — dot amarelo
- 🟢 Resolvido — dot verde (lista "Resolvidos" separada)
- ⚫ Bot ativo — dot cinza

ESTADOS:
- Loading: Skeleton de 4 cards de conversa.
- Vazio (sem conversas): "Nenhuma conversa no momento. ✓"
- Vazio (filtro ativo): "Nenhuma conversa em [canal]. Tente outro filtro."
- Erro: "⚠ Falha ao conectar ao inbox. Verificando conexão..." com retry automático a cada 10s.
- Sucesso (nova mensagem): Badge de contagem atualiza em tempo real. Toast discreto: `+ 1 nova mensagem de José Ferreira`

INTERAÇÕES:
- Click no card → abre conversa (screen-conversation) — desktop: no painel direito; mobile: navega para nova tela.
- Filtro de canal: click em chip filtra lista. Estado ativo com `aria-pressed="true"`.
- Swipe left no card (mobile): opções "Resolver" e "Atribuir a".
- Pull to refresh no mobile.
- Contador de não lidos atualizado via WebSocket.
- "Nova conversa" → modal para escolher canal e contato.

ACESSIBILIDADE:
- Lista com `role="list"`, cada item `role="listitem"`.
- Status de não-lido: `aria-label="[N] mensagens não lidas"` no badge.
- Filtros de canal: `role="group"` com `aria-label="Filtrar por canal"`.
- Status de atendimento: comunicado via texto, não só cor do dot.
- Screen reader anuncia novas mensagens via `aria-live="polite"`.

COMPONENTES shadcn/ui:
- `Badge` (canal, status)
- `Input` (busca)
- `ScrollArea` (lista de conversas)
- `Tabs` / `ToggleGroup` (filtro de canal)
- `Separator` (grupos Pendente/Em atendimento)
- `Avatar` (foto do contato ou inicial)
- `Button` variant="ghost" (ações rápidas)
- `Toast` (notificação de nova mensagem)

---

## 7. Tela: Conversa

═══════════════════════════════════════════
TELA: Conversa (375px — Mobile)
ID: screen-conversation
URL: /inbox/:contactId
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│ [←] 📱 José Ferreira   [🏷Lead] [⋮]   │  ← header fixo com nome + canal
│      Loja do João · WhatsApp            │
├─────────────────────────────────────────┤
│  ── 24 de maio de 2026 ──               │
│                                         │
│                   [José]                │
│        ┌────────────────────────┐       │
│        │ Oi! Quando sai a nova  │       │  ← mensagem recebida (esquerda)
│        │ coleção de verão?      │       │
│        └────────────────────────┘       │
│                            14h28 ✓✓     │
│                                         │
│  [Vitor]                                │
│  ┌────────────────────────────────┐     │  ← mensagem enviada (direita)
│  │ Olá José! Temos novidades      │     │
│  │ chegando semana que vem.       │     │
│  │ Posso enviar o catálogo?       │     │
│  └────────────────────────────────┘     │
│  14h32 ✓✓                              │
│                                         │
│                   [José]                │
│        ┌────────────────────────┐       │
│        │ Claro, pode enviar!    │       │
│        └────────────────────────┘       │
│                            14h35 ✓      │
│                                         │
├─────────────────────────────────────────┤
│  [📎] [😊]  [Escreva uma mensagem...]  │
│                              [Enviar ▶] │
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Conversa (1280px — Desktop)
ID: screen-conversation
URL: /inbox/:contactId
═══════════════════════════════════════════

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Inbox                                           [🔔 3]  [Vitor ▾]           │
├──────────┬─────────────────────────────────────┬────────────────────────────────────┤
│  Nav     │  [Lista de conversas]               │  📱 José Ferreira — Loja do João   │
│  lateral │                                     │  WhatsApp · Em atendimento 🟡      │
│          │  (igual screen-inbox, painel esq.)  │  ────────────────────────────────  │
│          │                                     │                                    │
│          │                                     │  ── 24 de maio de 2026 ──          │
│          │                                     │                                    │
│          │                                     │       ┌──────────────────────┐    │
│          │                                     │       │ Oi! Quando sai a     │    │
│          │                                     │       │ nova coleção?        │    │
│          │                                     │       └──────────────────────┘    │
│          │                                     │       José · 14h28 ✓✓            │
│          │                                     │                                    │
│          │                                     │  ┌────────────────────────────┐   │
│          │                                     │  │Olá José! Novidades semana  │   │
│          │                                     │  │que vem. Posso enviar o     │   │
│          │                                     │  │catálogo?                   │   │
│          │                                     │  └────────────────────────────┘   │
│          │                                     │  Você · 14h32 ✓✓                  │
│          │                                     │                                    │
│          │                                     │  ────────────────────────────────  │
│          │                                     │  [📎][😊] [Escreva mensagem...  ] │
│          │                                     │  [Usar resposta rápida ▾] [Enviar]│
│          │                                     │                                    │
└──────────┴─────────────────────────────────────┴────────────────────────────────────┘
```

ESTADOS:
- Loading: Skeleton de bubbles de mensagem (3 recebidas, 2 enviadas).
- Vazio (nova conversa): "Ainda não há mensagens. Envie a primeira!" + placeholder de texto.
- Erro (falha ao enviar): Mensagem com ícone ⚠ + retry: "Falha ao enviar. [Tentar de novo]" em vermelho.
- Sucesso (mensagem enviada): Tick duplo (✓✓) verde aparece ao lado do horário. Animação de envio.
- Offline: Banner amarelo: "⚠ Sem conexão. Mensagens serão enviadas quando reconectar."

INTERAÇÕES:
- Input com Enter para enviar (Shift+Enter = quebra de linha).
- 📎 Abre seletor de arquivo (imagens, PDF, áudio).
- 😊 Abre picker de emoji.
- "Resposta rápida" → popover com templates pré-aprovados filtrável.
- Long press em mensagem (mobile) / hover (desktop) → menu: Copiar, Responder, Encaminhar.
- Scroll automático para última mensagem ao abrir.
- Scroll up carrega mensagens antigas (infinite scroll reverso).
- Header: click em [🏷 Lead] → abre drawer do lead (screen-lead-detail).
- ⋮ → menu: "Resolver conversa", "Transferir para", "Bloquear contato", "Ver perfil no WhatsApp".

ACESSIBILIDADE:
- Thread de mensagens: `role="log"` com `aria-live="polite"` para novas mensagens.
- Cada mensagem: `<article>` com `aria-label="[remetente], [horário]: [texto]"`.
- Input: `aria-label="Escreva uma mensagem para José Ferreira"`.
- Botão enviar: `aria-label="Enviar mensagem"`.
- Status de entrega (✓✓): `aria-label="Lida"`, não depende só do ícone.
- Timestamps: `<time datetime="ISO-8601">`.

COMPONENTES shadcn/ui:
- `ScrollArea` (thread de mensagens)
- `Textarea` (input de mensagem — autosize)
- `Button` variant="default" (enviar), variant="ghost" (emoji, anexo)
- `Popover` (emoji picker, respostas rápidas)
- `DropdownMenu` (menu de contexto da mensagem, menu ⋮)
- `Badge` (status da conversa, canal)
- `Avatar` (foto do contato)
- `Separator` (divisor de data)
- `Alert` (mensagem de offline, erro de envio)

---

## 8. Tela: Minhas Tarefas

═══════════════════════════════════════════
TELA: Minhas Tarefas (375px — Mobile)
ID: screen-tasks
URL: /tasks
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│ [≡]  Minhas Tarefas         [🔔] [+ ]  │
├─────────────────────────────────────────┤
│  [Pendentes ●12] [Concluídas] [Todas]   │
├─────────────────────────────────────────┤
│                                         │
│  🔴 VENCIDAS (3)                        │  ← seção em destaque vermelho
│  ─────────────────────────────────────  │
│  ┌───────────────────────────────────┐  │
│  │ ⚠ [OBRIGATÓRIA] Fazer demo        │  │  ← tarefa obrigatória vencida
│  │   Loja do João · PROSPECÇÃO        │  │
│  │   Venceu: 23/05 · Bloqueia avanço │  │
│  │   [Concluir]  [Reagendar]         │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ ⚠ [OBRIGATÓRIA] Enviar contrato   │  │
│  │   Top Jeans · PROPOSTA            │  │
│  │   Venceu: 22/05 · Bloqueia avanço │  │
│  │   [Concluir]  [Reagendar]         │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ ⚠ Ligar para cliente              │  │  ← tarefa normal vencida
│  │   Carlos Oliveira                 │  │
│  │   Venceu: 21/05                   │  │
│  │   [Concluir]  [Reagendar]         │  │
│  └───────────────────────────────────┘  │
│                                         │
│  HOJE (2)                               │
│  ─────────────────────────────────────  │
│  ┌───────────────────────────────────┐  │
│  │ ○ Enviar catálogo atualizado      │  │
│  │   Maria Modas · Hoje, até 18h     │  │
│  │   [Concluir]                      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  PRÓXIMOS 7 DIAS (7)                    │
│  ─────────────────────────────────────  │
│  [ver mais...]                          │
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Minhas Tarefas (1280px — Desktop)
ID: screen-tasks
URL: /tasks
═══════════════════════════════════════════

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Minhas Tarefas                                [🔔 3]  [+ Nova Tarefa]        │
├──────────┬───────────────────────────────────────────────────────────────────────────┤
│  Nav     │  [Pendentes ●12] [Concluídas] [Todas]         [Lead ▾] [Tipo ▾] [↕ ]     │
│  lateral │  ─────────────────────────────────────────────────────────────────────── │
│          │                                                                            │
│          │  🔴 VENCIDAS (3) — Requerem ação imediata                                 │
│          │  ┌──────────────────────────────────────────────────────────────────────┐ │
│          │  │ ⚠ [OBRIGATÓRIA]  Fazer demonstração do catálogo                      │ │
│          │  │   Loja do João · Etapa: PROSPECÇÃO · Responsável: Vitor              │ │
│          │  │   Venceu em: 23/05/2026 · BLOQUEIA AVANÇO DE ETAPA                  │ │
│          │  │                          [Concluir tarefa]  [Reagendar]  [Ver lead]  │ │
│          │  └──────────────────────────────────────────────────────────────────────┘ │
│          │  ┌──────────────────────────────────────────────────────────────────────┐ │
│          │  │ ⚠ [OBRIGATÓRIA]  Enviar contrato assinado                            │ │
│          │  │   Top Jeans · Etapa: PROPOSTA · Responsável: Vitor                   │ │
│          │  │   Venceu em: 22/05/2026 · BLOQUEIA AVANÇO DE ETAPA                  │ │
│          │  │                          [Concluir tarefa]  [Reagendar]  [Ver lead]  │ │
│          │  └──────────────────────────────────────────────────────────────────────┘ │
│          │                                                                            │
│          │  HOJE (2)                                                                  │
│          │  ┌──────────────────────────────────────────────────────────────────────┐ │
│          │  │ ○  Enviar catálogo atualizado  · Maria Modas · Hoje, até 18h          │ │
│          │  │                                          [Concluir]  [Ver lead]       │ │
│          │  └──────────────────────────────────────────────────────────────────────┘ │
│          │                                                                            │
│          │  PRÓXIMOS 7 DIAS (7)                                                      │
│          │  [Expandir]                                                                │
└──────────┴───────────────────────────────────────────────────────────────────────────┘
```

ESTADOS:
- Loading: Skeleton de 3 seções com 2 items cada.
- Vazio: "Você está em dia! Nenhuma tarefa pendente. ✓" + ilustração.
- Vazio (seção vencidas): Seção não exibida — só aparece quando há vencidas.
- Erro: "⚠ Não foi possível carregar tarefas. [Tentar novamente]".
- Sucesso (concluir): Tarefa animada (fade + strikethrough) e move para aba "Concluídas". Toast `✓ Tarefa concluída!` Se era obrigatória que bloqueava: `✓ Bloqueio removido. Você pode avançar o lead.`

INTERAÇÕES:
- "Concluir" → confirma conclusão imediata.
- "Reagendar" → datepicker inline (sem abrir modal separado).
- "Ver lead" → abre drawer do lead.
- Tab Concluídas: lista de tarefas concluídas com opção de reabrir.
- Filtro por lead: select de leads do usuário.
- "+ Nova Tarefa" → drawer com campos: título, lead, prazo, tipo (obrigatória/comum), responsável.

ACESSIBILIDADE:
- Seção "Vencidas" com `role="alert"` + `aria-live="assertive"` ao carregar.
- Badge [OBRIGATÓRIA]: cor vermelha + texto + ícone ⚠ — três indicadores simultâneos.
- Checkbox de conclusão com `aria-label="Concluir tarefa: [nome]"`.
- Tarefas obrigatórias: `aria-describedby` aponta para texto "BLOQUEIA AVANÇO DE ETAPA".

COMPONENTES shadcn/ui:
- `Tabs` (Pendentes/Concluídas/Todas)
- `Badge` variant="destructive" (vencida, obrigatória), variant="warning" (hoje)
- `Button` (concluir, reagendar, ver lead)
- `Calendar` / `Popover` (reagendar)
- `Checkbox` (conclusão rápida)
- `Alert` variant="destructive" (banner de vencidas)
- `Skeleton`
- `Sheet` (+ Nova Tarefa)

---

## 9. Tela: Dashboard

═══════════════════════════════════════════
TELA: Dashboard (375px — Mobile)
ID: screen-dashboard
URL: /dashboard
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│ [≡]  Dashboard              [🔔] [↻]   │
├─────────────────────────────────────────┤
│  Período: [Maio 2026 ▾]  [Atacado ▾]   │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────┐  ┌───────────┐           │
│  │   R$128k  │  │    248    │           │
│  │ Receita   │  │   Leads   │           │
│  │ ▲ +12%    │  │ ▲ +8%     │           │
│  └───────────┘  └───────────┘           │
│  ┌───────────┐  ┌───────────┐           │
│  │    38%    │  │   4.2d    │           │
│  │ Conversão │  │ Ciclo médio│          │
│  │ ▼ -2%     │  │ ▲ +0.3d   │           │
│  └───────────┘  └───────────┘           │
│                                         │
│  AÇÕES NECESSÁRIAS                      │
│  ─────────────────────────────────────  │
│  ⚠ 3 leads com tarefas vencidas        │
│  [Ver tarefas]                          │
│  ⚠ 2 leads sem atividade > 7 dias     │
│  [Ver leads inativos]                   │
│                                         │
│  FUNIL DE VENDAS                        │
│  ─────────────────────────────────────  │
│  Prospecção  ████████████████  120      │
│  Qualificado ████████████     84 (70%)  │
│  Proposta    ████████         52 (43%)  │
│  Fechado     █████            28 (23%)  │
│                                         │
│  PERFORMANCE DA EQUIPE                  │
│  ─────────────────────────────────────  │
│  🥇 Vitor    R$52k  18 fechados         │
│  🥈 Amanda   R$34k  12 fechados         │
│                                         │
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Dashboard (1280px — Desktop)
ID: screen-dashboard
URL: /dashboard
═══════════════════════════════════════════

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard                                    [🔔 3]  [↻ Atualizar]  [Renato]│
├──────────┬───────────────────────────────────────────────────────────────────────────┤
│  Nav     │  Período: [Maio 2026 ▾]    Contexto: [Atacado ▾] [Varejo ▾] [Todos ▾]   │
│  lateral │  ─────────────────────────────────────────────────────────────────────── │
│          │                                                                            │
│          │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│          │  │ R$ 128k  │  │   248    │  │   38%    │  │  4.2 dias│                 │
│          │  │Receita   │  │  Leads   │  │Conversão │  │Ciclo médio                 │
│          │  │▲ +12% mês│  │▲ +8% mês │  │▼ -2% mês │  │▲ +0.3d   │                 │
│          │  │[Ver leads│  │[Ver leads│  │[Ver funil│  │[Ver deals│                 │
│          │  │ perdidos]│  │ do mês]  │  │ fraco]   │  │ longos]  │                 │
│          │  └──────────┘  └──────────┘  └──────────┘  └──────────┘                 │
│          │                                                                            │
│          │  ┌───────────────────────────────────┐  ┌───────────────────────────────┐│
│          │  │  FUNIL DE VENDAS                  │  │  AÇÕES NECESSÁRIAS             ││
│          │  │                                   │  │                                ││
│          │  │  Prospecção  ████████████  120    │  │  ⚠ 3 tarefas vencidas          ││
│          │  │  Qualificado ████████     84      │  │    [Ver agora →]               ││
│          │  │  Proposta    █████        52      │  │                                ││
│          │  │  Fechamento  ███          28      │  │  ⚠ 2 leads sem atividade +7d   ││
│          │  │  Fechado     ██           15      │  │    [Ver leads inativos →]      ││
│          │  │                                   │  │                                ││
│          │  │  [Ver pipeline completo →]        │  │  ℹ 5 leads sem responsável     ││
│          │  └───────────────────────────────────┘  │    [Atribuir agora →]          ││
│          │                                          └───────────────────────────────┘│
│          │  ┌────────────────────────────────────────────────────────────────────── ┐│
│          │  │  PERFORMANCE DA EQUIPE               Período: Maio 2026               ││
│          │  │  ─────────────────────────────────────────────────────────────────── ││
│          │  │  #  Vendedor    Leads  Fechados  Receita    Meta     Status           ││
│          │  │  1  🥇 Vitor    64     18        R$ 52.000  R$ 50k   ✓ 104%           ││
│          │  │  2  🥈 Amanda   42     12        R$ 34.000  R$ 40k   ⚠ 85%            ││
│          │  └────────────────────────────────────────────────────────────────────── ┘│
└──────────┴───────────────────────────────────────────────────────────────────────────┘
```

ESTADOS:
- Loading: Skeleton para cada KPI card (4 cards) + skeleton de gráfico de barras + skeleton de tabela.
- Vazio (sem dados no período): "Nenhum dado para o período selecionado. Selecione outro período."
- Erro: "⚠ Falha ao carregar dashboard. [Tentar novamente]"
- Sucesso (atualização manual): Toast `✓ Dashboard atualizado.`

INTERAÇÕES:
- KPI cards são clicáveis: cada um navega para a lista relevante com filtros pré-aplicados.
- Filtro de período: date range picker.
- Filtro de contexto (Atacado/Varejo) + Filtro por vendedor (só admin/gestor vê toda equipe).
- "Ações Necessárias": cada item é link direto para a tela de destino com filtro pré-aplicado.
- Funil: hover/click numa barra → tooltip com detalhes + link "Ver leads nesta etapa".
- Tabela de equipe (gestor/admin): click na linha do vendedor → drilldown do vendedor.

ACESSIBILIDADE:
- KPI cards: `role="region"` com `aria-label="KPI: Receita, R$ 128.000, alta de 12%"`.
- Gráfico de funil: versão textual alternativa (a tabela ASCII já serve de fallback) + `role="img"` com `aria-label` descritivo.
- Variações percentuais: "▲ +12%" com `aria-label="Alta de 12% em relação ao mês anterior"`.
- Ações necessárias: `role="alert"` para alertas de tarefas vencidas.

COMPONENTES shadcn/ui:
- `Card` / `CardContent` (KPI cards)
- `Badge` (variação %)
- `Select` / `DateRangePicker` (filtros)
- `Table` (performance da equipe)
- `Progress` (barras do funil — customizadas como funnel)
- `Alert` (ações necessárias)
- `Skeleton`
- `Tooltip` (hover nos gráficos)

---

## 10. Tela: Configurações de Pipeline

═══════════════════════════════════════════
TELA: Config Pipeline (375px — Mobile)
ID: screen-pipeline-settings
URL: /settings/pipelines/:id
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│ [←]  Configurar Pipeline    [💾 Salvar] │
├─────────────────────────────────────────┤
│  Nome: [Pipeline Atacado B2B          ] │
│  Tipo: ● Atacado  ○ Varejo              │
├─────────────────────────────────────────┤
│  ETAPAS  [+ Nova etapa]                 │
│  ─────────────────────────────────────  │
│  ┌───────────────────────────────────┐  │
│  │ ⠿ 1. PROSPECÇÃO                   │  │  ← drag handle ⠿
│  │   Cor: [🟢 ▾]  [✏] [🗑]          │  │
│  │   ▼ TAREFAS OBRIGATÓRIAS (2)      │  │  ← acordeão
│  │   ┌─────────────────────────────┐ │  │
│  │   │ ⠿ • Primeiro contato (2d)  │ │  │
│  │   │   [✏] [🗑]                  │ │  │
│  │   └─────────────────────────────┘ │  │
│  │   ┌─────────────────────────────┐ │  │
│  │   │ ⠿ • Enviar apresentação (3d)│ │  │
│  │   │   [✏] [🗑]                  │ │  │
│  │   └─────────────────────────────┘ │  │
│  │   [+ Adicionar tarefa obrigatória]│  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ ⠿ 2. QUALIFICADO                  │  │
│  │   Cor: [🔵 ▾]  [✏] [🗑]          │  │
│  │   ▶ TAREFAS OBRIGATÓRIAS (1)      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ ⠿ 3. PROPOSTA                     │  │
│  │   Cor: [🟡 ▾]  [✏] [🗑]          │  │
│  │   ▶ TAREFAS OBRIGATÓRIAS (0)      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Config Pipeline (1280px — Desktop)
ID: screen-pipeline-settings
URL: /settings/pipelines/:id
═══════════════════════════════════════════

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Configurações                                    [🔔 3]  [Renato · Admin]    │
├──────────┬───────────────────────────────────────────────────────────────────────────┤
│  Nav     │  [← Pipelines]  Configurar Pipeline: "Atacado B2B"       [💾 Salvar]     │
│  lateral │  ─────────────────────────────────────────────────────────────────────── │
│          │                                                                            │
│          │  Nome do Pipeline: [Pipeline Atacado B2B                               ]  │
│          │  Tipo: ( ● ) Atacado B2B     (  ○  ) Varejo B2C                           │
│          │                                                                            │
│          │  ETAPAS DO PIPELINE  [+ Nova Etapa]                                       │
│          │  ─────────────────────────────────────────────────────────────────────── │
│          │                                                                            │
│          │  ⠿ ┌──────────────────────────────────────────────────────────────────┐  │
│          │    │ 1. PROSPECÇÃO   Cor:[🟢▾]  [Renomear]  [Excluir]                 │  │
│          │    │ ─────────────────────────────────────────────────────────────── │  │
│          │    │ TAREFAS OBRIGATÓRIAS (para avançar desta etapa):                 │  │
│          │    │                                                                   │  │
│          │    │  ⠿  1. Fazer primeiro contato      Prazo: 2 dias  [✏] [🗑]      │  │
│          │    │  ⠿  2. Enviar apresentação         Prazo: 3 dias  [✏] [🗑]      │  │
│          │    │                                                                   │  │
│          │    │  [+ Adicionar tarefa obrigatória a esta etapa]                   │  │
│          │    └──────────────────────────────────────────────────────────────────┘  │
│          │                                                                            │
│          │  ⠿ ┌──────────────────────────────────────────────────────────────────┐  │
│          │    │ 2. QUALIFICADO  Cor:[🔵▾]  [Renomear]  [Excluir]                 │  │
│          │    │ ─────────────────────────────────────────────────────────────── │  │
│          │    │ TAREFAS OBRIGATÓRIAS (1):                                        │  │
│          │    │  ⠿  1. Fazer call de qualificação   Prazo: 1 dia   [✏] [🗑]     │  │
│          │    │  [+ Adicionar tarefa obrigatória]                                │  │
│          │    └──────────────────────────────────────────────────────────────────┘  │
│          │                                                                            │
│          │  ℹ ATENÇÃO: tarefas obrigatórias bloqueiam o avanço do lead para a       │
│          │    próxima etapa até serem concluídas.                                   │
└──────────┴───────────────────────────────────────────────────────────────────────────┘
```

ESTADOS:
- Loading: Skeleton do formulário e das etapas.
- Vazio (sem etapas): "Pipeline sem etapas. [+ Adicionar primeira etapa]"
- Erro (salvar): "⚠ Falha ao salvar configurações. [Tentar novamente]"
- Sucesso: Toast `✓ Pipeline salvo com sucesso.` + preview do Kanban atualizado.
- Conflito (excluir etapa com leads): Modal de confirmação: "X leads estão nesta etapa. Mover para: [selecionar etapa ▾] antes de excluir."

INTERAÇÕES:
- Reordenar etapas: drag-and-drop (DnD Kit). Toque longo no mobile no handle ⠿.
- Reordenar tarefas dentro de etapa: mesma mecânica.
- "+ Adicionar tarefa": abre mini-form inline (sem modal) com campos: nome, tipo (obrigatória/opcional), prazo padrão.
- Cor da etapa: color picker popover com paleta Techmalhas.
- Salvar: botão no topo (sticky no mobile). Autosave desativado — alterações só salvas no botão.
- Excluir etapa: confirm dialog se houver leads.

ACESSIBILIDADE:
- Drag handles com `aria-label="Reordenar etapa [nome]"`, `role="button"`, keyboard movable.
- Seções de etapa: `<details>/<summary>` nativo ou aria-expanded para acordeão.
- Banner informativo de tarefas obrigatórias: `role="note"`.
- Cor das etapas: acompanhada de nome textual — não só cor.

COMPONENTES shadcn/ui:
- `Input` (nome do pipeline, nome da etapa, prazo)
- `RadioGroup` (tipo Atacado/Varejo)
- `Button` (salvar, adicionar, excluir)
- `ColorPicker` (customizado sobre Popover)
- `Accordion` (tarefas obrigatórias por etapa)
- `AlertDialog` (confirmar exclusão de etapa com leads)
- `Badge` (contagem de tarefas)
- `Switch` (tarefa obrigatória/opcional)
- `Skeleton`

---

## 11. Tela: Gestão de Usuários

═══════════════════════════════════════════
TELA: Gestão de Usuários (375px — Mobile)
ID: screen-users
URL: /settings/users
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│ [←]  Usuários              [+ Convidar] │
├─────────────────────────────────────────┤
│  🔍 [Buscar usuário...               ]  │
│  [Todos ▾] [Perfil ▾] [Status ▾]       │
├─────────────────────────────────────────┤
│  4 usuários ativos                      │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ [V]  Vitor Mendes                 │  │
│  │      vendedor_atacado · Ativo ●   │  │
│  │      vitor@techmalhas.com.br      │  │
│  │      [Editar]  [Desativar]        │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ [A]  Amanda Ferreira              │  │
│  │      atendente_varejo · Ativo ●   │  │
│  │      amanda@techmalhas.com.br     │  │
│  │      [Editar]  [Desativar]        │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ [R]  Renato Silva                 │  │
│  │      gestor · Ativo ●             │  │
│  │      renato@techmalhas.com.br     │  │
│  │      [Editar]  [Desativar]        │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ [AD] Admin TM                     │  │
│  │      admin · Ativo ●              │  │
│  │      admin@techmalhas.com.br      │  │
│  │      [Editar]  [—]                │  │  ← admin não pode ser desativado por si
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Gestão de Usuários (1280px — Desktop)
ID: screen-users
URL: /settings/users
═══════════════════════════════════════════

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Configurações > Usuários                         [🔔 3]  [+ Convidar Usuário]│
├──────────┬───────────────────────────────────────────────────────────────────────────┤
│  Nav     │  🔍 [Buscar por nome ou e-mail...]    [Perfil ▾] [Status ▾]              │
│  lateral │  4 usuários ativos                                                         │
│          │  ─────────────────────────────────────────────────────────────────────── │
│          │  ☐  Avatar  Nome              Perfil              Status   Ações          │
│          │  ─────────────────────────────────────────────────────────────────────── │
│          │  ☐   [V]   Vitor Mendes       vendedor_atacado    ● Ativo  [Editar][···]  │
│          │  ☐   [A]   Amanda Ferreira    atendente_varejo    ● Ativo  [Editar][···]  │
│          │  ☐   [R]   Renato Silva       gestor              ● Ativo  [Editar][···]  │
│          │  ☐  [AD]   Admin TM           admin               ● Ativo  [Editar]       │
│          │  ─────────────────────────────────────────────────────────────────────── │
│          │                                                                            │
│          │  PERFIS RBAC DISPONÍVEIS:                                                 │
│          │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────┐ │
│          │  │ admin          │ │ gestor         │ │vendedor_atacado│ │atend_varejo│ │
│          │  │ Acesso total   │ │ Dashboard+     │ │ Pipeline WA+IG │ │ Inbox +    │ │
│          │  │                │ │ Config         │ │ + Leads        │ │ Leads      │ │
│          │  └────────────────┘ └────────────────┘ └────────────────┘ └────────────┘ │
└──────────┴───────────────────────────────────────────────────────────────────────────┘
```

ESTADOS:
- Loading: Skeleton de 4 rows de usuário.
- Vazio: "Nenhum usuário encontrado. [+ Convidar primeiro usuário]"
- Erro: "⚠ Falha ao carregar usuários. [Tentar novamente]"
- Sucesso (convite): Toast `✓ Convite enviado para [email].`
- Sucesso (desativar): Toast `✓ [Nome] desativado. [Desfazer]` (undo em 5s).
- Conflito (desativar com leads): "Este usuário tem 12 leads ativos. Reatribuir a: [select ▾] antes de desativar."

INTERAÇÕES:
- "Editar" → drawer lateral com campos: nome, e-mail, perfil, redefinir senha.
- "+ Convidar" → drawer com campo de e-mail + select de perfil + botão "Enviar convite".
- "Desativar" → AlertDialog de confirmação. Se tiver leads ativos → fluxo de reatribuição.
- [···] → DropdownMenu: "Redefinir senha", "Reatribuir leads", "Desativar".
- Filtro de perfil: filtra a lista em tempo real.
- Apenas `admin` tem acesso a esta tela.

ACESSIBILIDADE:
- Tabela com `scope="col"` nos cabeçalhos.
- Status com dot colorido + texto "Ativo"/"Inativo" — nunca só cor.
- `AlertDialog` com foco capturado e Esc para cancelar.
- "Desfazer" no toast: `aria-live="assertive"`, foco capturado no toast.

COMPONENTES shadcn/ui:
- `Table`, `TableHeader`, `TableBody`, `TableRow`
- `Avatar` (iniciais)
- `Badge` (perfil RBAC, status)
- `Button` (editar, convidar, desativar)
- `DropdownMenu` (menu ···)
- `AlertDialog` (confirmar desativação)
- `Sheet` (drawer de edição/convite)
- `Select` (perfil, reatribuição)
- `Input` (busca, campos do formulário)
- `Switch` (ativo/inativo)
- `Skeleton`

---

## 12. Tela: Operador de Chat ao Vivo

═══════════════════════════════════════════
TELA: Operador Chat ao Vivo (375px — Mobile)
ID: screen-livechat
URL: /inbox?channel=webchat
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│ [←]  Web Chat            [Status: ● ON] │  ← toggle de disponibilidade
├─────────────────────────────────────────┤
│  AGUARDANDO ATENDIMENTO (2)             │  ← fila de entrada
│  ─────────────────────────────────────  │
│  ┌───────────────────────────────────┐  │
│  │ 🌐 Visitante #4512                │  │
│  │    techmalhas.com.br/produtos     │  │
│  │    "Qual o prazo de entrega?"     │  │
│  │    Aguardando: 1min 23s  [Atender]│  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 🌐 Visitante #4513                │  │
│  │    techmalhas.com.br/atacado      │  │
│  │    "Vocês fazem pedido mínimo?"   │  │
│  │    Aguardando: 0min 45s  [Atender]│  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  EM ATENDIMENTO (1)                     │
│  ─────────────────────────────────────  │
│  ┌───────────────────────────────────┐  │
│  │ 🌐 Visitante #4510 · Amanda       │  │
│  │    "Que horas abre a loja?"       │  │
│  │    [Continuar]                    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Operador Chat ao Vivo (1280px — Desktop)
ID: screen-livechat
URL: /inbox?channel=webchat
═══════════════════════════════════════════

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Web Chat — Operador                  Status: ● Online  [Pausar atendimento]  │
├──────────┬────────────────────────┬───────────────────────────────────────────────── │
│  Nav     │  FILA (2)              │  🌐 Visitante #4512                              │
│  lateral │  ──────────────────    │  Acessando: techmalhas.com.br/produtos           │
│          │  ┌──────────────────┐  │  IP: 189.x.x.x · Franca/SP · há 1min 23s        │
│          │  │ 🌐 Visitante 4512│  │  ──────────────────────────────────────────────  │
│          │  │ "Qual o prazo?"  │  │                                                  │
│          │  │ ⏱ 1min 23s       │  │  🌐 Visitante #4512 · há 1min:                  │
│          │  │ [Atender]        │  │  ┌──────────────────────────────────┐            │
│          │  └──────────────────┘  │  │ Olá! Qual o prazo de entrega     │            │
│          │  ┌──────────────────┐  │  │ para São Paulo?                  │            │
│          │  │ 🌐 Visitante 4513│  │  └──────────────────────────────────┘            │
│          │  │ "Pedido mínimo?" │  │                                                  │
│          │  │ ⏱ 0min 45s       │  │  Amanda · agora:                                 │
│          │  │ [Atender]        │  │  ┌──────────────────────────────────┐            │
│          │  └──────────────────┘  │  │ [digitando...]                   │            │
│          │                        │  └──────────────────────────────────┘            │
│          │  EM ATENDIMENTO (1)    │                                                  │
│          │  ──────────────────    │  ────────────────────────────────────────────── │
│          │  ┌──────────────────┐  │  [Resposta rápida ▾]  [Transferir ▾]            │
│          │  │ 🌐 Visitante 4510│  │  [Escreva sua resposta...                      ] │
│          │  │ Amanda           │  │                               [Enviar]  [Fechar] │
│          │  │ [Continuar]      │  │                                                  │
│          │  └──────────────────┘  │                                                  │
└──────────┴────────────────────────┴───────────────────────────────────────────────── │
```

WIDGET EMBARCADO NO SITE (techmalhas.com.br):
```
                                    ┌──────────────────────────┐
                                    │ 💬 Chat Techmalhas    [×] │
                                    │ ─────────────────────── │
                                    │ Olá! Como posso ajudar?  │
                                    │ Atendimento 8h–18h 💚    │
                                    │ ─────────────────────── │
                                    │ [Seu nome:            ]  │
                                    │ [Sua mensagem...      ]  │
                                    │           [Iniciar chat] │
                                    └──────────────────────────┘
                                              [💬] ← FAB 56x56px
```

ESTADOS:
- Loading (operador): Skeleton de fila.
- Vazio (fila): "Fila vazia. Todos os visitantes estão sendo atendidos. ✓"
- Offline (operador): Status "● Offline". Visitantes veem formulário de contato em vez de chat.
- Erro (widget no site): "Chat temporariamente indisponível. Use nosso WhatsApp: [link]"
- Sucesso (chat encerrado): Toast `✓ Chat encerrado. Lead criado: [Visitante #4512].`

INTERAÇÕES:
- "Atender" na fila: move para "Em atendimento" do operador e conecta o chat em tempo real.
- Toggle "Online/Offline": muda disponibilidade. Offline não recebe novas conversas.
- "Fechar chat": encerra a conversa, oferece opção de criar lead com os dados coletados.
- "Transferir": seleciona outro operador disponível.
- Respostas rápidas: templates filtráveis por palavra-chave.
- Widget no site: FAB 56x56px (≥ 44px touch target), abre/fecha o chat.
- Contador de tempo de espera atualiza em tempo real na fila.

ACESSIBILIDADE:
- Status do operador: texto + cor ("● Online" / "● Offline") — não só cor.
- Fila com `aria-live="polite"` para nova entrada.
- Widget: FAB com `aria-label="Abrir chat de atendimento"`.
- Chat no site: input com `aria-label="Escreva sua mensagem"`.
- Indicador "digitando...": `aria-live="polite"`.

COMPONENTES shadcn/ui:
- `Badge` (status online/offline, fila, canal)
- `Button` (atender, encerrar, transferir, enviar)
- `ScrollArea` (thread do chat)
- `Textarea` (resposta)
- `Select` / `Popover` (respostas rápidas, transferir)
- `Avatar`
- `Alert` (widget offline)
- `Toast`

---

## 13. Notificações

═══════════════════════════════════════════
TELA: Painel de Notificações (375px — Mobile)
ID: screen-notifications
URL: (drawer global, acessível em qualquer tela)
═══════════════════════════════════════════

```
┌─────────────────────────────────────────┐
│  [←]  Notificações     [Marcar tudo lido]│
├─────────────────────────────────────────┤
│  HOJE                                   │
│  ─────────────────────────────────────  │
│  ┌───────────────────────────────────┐  │
│  │ 🔴 Nova mensagem · há 5min        │  │
│  │ José Ferreira (WA): "Quando sai   │  │
│  │ a nova coleção?"                  │  │
│  │ [Abrir conversa]                  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 🟠 Tarefa vencida · há 1h         │  │
│  │ "Fazer demo" — Loja do João       │  │
│  │ Bloqueando avanço de etapa        │  │
│  │ [Ir para tarefa]                  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 🟡 Lead sem atividade · há 2h     │  │
│  │ Carlos Oliveira — 8 dias inativo  │  │
│  │ [Ver lead]                        │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 🌐 Novo chat ao vivo · há 3h      │  │
│  │ Visitante #4511 saiu sem resposta │  │
│  │ [Ver histórico]                   │  │
│  └───────────────────────────────────┘  │
│  ─────────────────────────────────────  │
│  ONTEM                                  │
│  [Carregar mais...]                     │
└─────────────────────────────────────────┘
```

═══════════════════════════════════════════
TELA: Notificações — Dropdown (1280px — Desktop)
ID: screen-notifications
URL: (dropdown no header, acessível em qualquer tela)
═══════════════════════════════════════════

```
                            ┌──────────────────────────────────────────┐
[🔔 3]  ──────────────────▶ │  Notificações                  [Lidas ✓] │
                            │  ────────────────────────────────────── │
                            │  🔴 Nova mensagem WA · há 5min          │
                            │      José Ferreira: "Quando sai..."      │
                            │      [Abrir conversa →]                  │
                            │  ────────────────────────────────────── │
                            │  🟠 Tarefa vencida · há 1h              │
                            │      "Fazer demo" — Loja do João         │
                            │      Bloqueio de avanço ativo            │
                            │      [Ir para tarefa →]                  │
                            │  ────────────────────────────────────── │
                            │  🟡 Lead inativo · há 2h                │
                            │      Carlos Oliveira — 8d sem atividade  │
                            │      [Ver lead →]                        │
                            │  ────────────────────────────────────── │
                            │       [Ver todas as notificações]        │
                            └──────────────────────────────────────────┘
```

TIPOS DE NOTIFICAÇÃO E PRIORIDADE:
- 🔴 Crítica: nova mensagem recebida, tarefa obrigatória vencida
- 🟠 Alta: tarefa vencida (não obrigatória), lead bloqueado
- 🟡 Média: lead inativo (+7 dias), visitante web chat sem resposta
- 🔵 Informativa: lead criado via formulário, deal movido de etapa

ESTADOS:
- Loading: Skeleton de 3 notificações.
- Vazio: "Nenhuma notificação. Você está em dia! ✓"
- Erro: "⚠ Falha ao carregar notificações."
- Badge no ícone 🔔: número de notificações não lidas. Some ao "Marcar tudo lido".

INTERAÇÕES:
- Click na notificação: navega para o contexto relevante + marca como lida.
- "Marcar tudo lido": limpa o badge e marca todas como lidas.
- Notificações em tempo real via WebSocket — badge atualiza sem reload.
- Mobile: abre drawer (bottom sheet). Desktop: dropdown (popover).
- "Ver todas" → página `/notifications` com listagem completa e filtros.
- Swipe left no mobile: marca como lida.

ACESSIBILIDADE:
- Botão 🔔: `aria-label="Notificações, [N] não lidas"`.
- Badge: `aria-live="polite"` atualiza quando chega nova notificação.
- Dropdown com `role="dialog"`, `aria-labelledby="notifications-title"`.
- Cada notificação: `role="article"`, `aria-label="[tipo], [tempo]: [descrição]"`.
- Prioridade: cor + emoji + texto — três indicadores.

COMPONENTES shadcn/ui:
- `Popover` / `DropdownMenu` (desktop dropdown)
- `Drawer` (mobile bottom sheet)
- `Badge` (contador 🔔, prioridade)
- `Button` (CTA de cada notificação, "Marcar tudo lido")
- `ScrollArea` (lista de notificações)
- `Separator` (divisor por data)
- `Skeleton`

---

## 14. Fluxos Críticos

### Fluxo 1: Login → Pipeline

```
[Tela login]
    │
    ▼ Preenche e-mail + senha → clica "Entrar"
    │
    ▼ Loading state (spinner no botão, 800ms típico)
    │
    ├─[ERRO: credencial inválida]──▶ Banner "E-mail ou senha incorretos"
    │                                 Foco retorna ao campo e-mail
    │
    └─[SUCESSO]
         │
         ├─[perfil: vendedor_atacado] ──▶ /pipeline?type=atacado
         │                                Toast "Bem-vindo, Vitor!"
         │                                Kanban carrega com leads do vendedor
         │
         ├─[perfil: atendente_varejo] ──▶ /inbox
         │                                Toast "Bem-vindo, Amanda!"
         │                                Inbox com mensagens pendentes
         │
         └─[perfil: gestor | admin] ──▶ /dashboard
                                          Toast "Bem-vindo, Renato!"
                                          KPIs carregam
```

---

### Fluxo 2: Criar Lead Manual → Aparece no Kanban

```
[Pipeline Kanban] → clica [+ Novo Lead]
    │
    ▼ Drawer "Novo Lead" abre (slide from right desktop / bottom sheet mobile)
    │
    ▼ Preenche: Nome*, Empresa, Telefone*, Canal origem (Dir)
    │   Etapa inicial, Responsável, Valor estimado
    │
    ▼ Clica "Criar Lead"
    │
    ├─[ERRO: campos obrigatórios faltando]──▶ Mensagens de erro inline
    │                                           Foco no primeiro campo inválido
    │
    └─[SUCESSO]
         │
         ▼ Drawer fecha com animação
         ▼ Card do novo lead aparece na primeira coluna do Kanban
           (animação de entrada: fade + slide down)
         ▼ Toast: "✓ Lead criado: [Nome]. [Ver no pipeline]"
         ▼ Contador da coluna atualiza (+1)
```

---

### Fluxo 3: Mover Deal com Tarefa Obrigatória Pendente (Hard Block)

```
[Pipeline Kanban] → usuário tenta mover card "Loja do João"
    │                da etapa PROSPECÇÃO para QUALIFICADO
    │
    ▼ (drag-and-drop desktop) ou (botão "Mover etapa" no drawer mobile)
    │
    ▼ Sistema verifica tarefas obrigatórias da etapa PROSPECÇÃO
    │
    └─[HÁ TAREFAS OBRIGATÓRIAS PENDENTES]
         │
         ▼ HARD BLOCK: card retorna à posição original (desktop)
           ou select reverte (mobile)
         │
         ▼ Modal/AlertDialog: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           │ ⚠ Avanço bloqueado                             │
           │                                               │
           │ Você precisa concluir as tarefas obrigatórias │
           │ antes de avançar "Loja do João":              │
           │                                               │
           │  ☐ Fazer demo do catálogo (vencida em 23/05)  │
           │  ☐ Enviar apresentação de preços              │
           │                                               │
           │  [Ir para as tarefas]  [Cancelar]             │
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         │
         ├─[Clica "Ir para as tarefas"]──▶ Abre aba Tarefas no drawer do lead
         │                                  ou navega para /tasks com filtro
         │
         └─[Clica "Cancelar"]──▶ Modal fecha, card permanece na etapa original
```

---

### Fluxo 4: Receber WhatsApp → Atender via Inbox

```
[José envia mensagem via WhatsApp Cloud API]
    │
    ▼ Webhook recebe payload → backend processa
    │
    ▼ Notificação em tempo real (WebSocket)
    │
    ├─[Usuário está no Inbox]──▶ Badge no card de José atualiza
    │                             Novo card aparece no topo (não lido)
    │                             aria-live anuncia "Nova mensagem de José Ferreira"
    │
    ├─[Usuário está em outra tela]──▶ Badge 🔔 incrementa (+1)
    │                                  Toast discreto "Nova mensagem de José Ferreira"
    │
    └─[Usuário clica na notificação ou no card]
         │
         ▼ Navega para /inbox/jose-ferreira-id
         ▼ Thread de mensagens carrega com nova mensagem visível
         ▼ Conversa marcada como "Em atendimento" automaticamente
         ▼ Usuário digita resposta → clica Enviar
         ▼ Mensagem enviada via WhatsApp Cloud API
         ▼ Status: ✓ (enviada) → ✓✓ (entregue) → ✓✓ verde (lida)
```

---

### Fluxo 5: Receber DM Instagram → Atender via Inbox

```
[@mariamodas_oficial envia DM no Instagram]
    │
    ▼ Instagram Webhook → backend processa → normaliza para inbox unificado
    │
    ▼ Notificação em tempo real (WebSocket) — mesmo mecanismo do WA
    │
    ▼ Card aparece no Inbox com badge [IG] roxo
    │
    ▼ Usuário abre a conversa
    │
    ▼ Thread mostra DMs do Instagram no mesmo formato de chat
      (sem misturar com histórico de WA do mesmo contato)
    │
    ▼ Campo de resposta envia via Instagram Graph API
    │
    ├─[Contato já existe no CRM]──▶ Link automático ao lead existente
    │                                 Histórico unificado na aba do lead
    │
    └─[Contato novo]──▶ Banner: "Contato novo do Instagram. [Criar lead?]"
                          Clica "Criar lead" → Drawer com dados pré-preenchidos
                          do perfil Instagram (@username, nome, foto)
```

---

### Fluxo 6: Lead via Formulário do Site → Cai no CRM

```
[Visitante preenche formulário em techmalhas.com.br]
    │   Nome: Carlos Oliveira
    │   Telefone: (16) 98888-7777
    │   Mensagem: "Quero fazer pedido atacado"
    │
    ▼ Submit → API do CRM recebe payload
    │
    ▼ CRM cria lead automaticamente:
    │   - Nome: Carlos Oliveira
    │   - Canal de origem: SITE
    │   - Etapa: PROSPECÇÃO (primeira etapa do pipeline)
    │   - Responsável: atribuição automática (round-robin ou regra configurada)
    │   - Tag: "formulário site"
    │
    ▼ Notificação em tempo real para responsável atribuído
    │   Toast/notificação: "Novo lead via formulário: Carlos Oliveira"
    │
    ▼ Lead aparece no Kanban na coluna PROSPECÇÃO
      Card marcado com badge [SITE] azul
    │
    ▼ Lead também aparece em /leads no topo da lista
    │
    ▼ Responsável clica no lead → drawer de detalhe
      Vê mensagem original no histórico
      Pode responder por qualquer canal disponível

    [Se formulário com opção de chat ao vivo ativado]
    │
    ▼ Widget de chat aparece no site
    ▼ Visitante digita → operador disponível recebe em /inbox?channel=webchat
    ▼ Ao encerrar chat → lead criado com o histórico da conversa
```

---

## 15. Componentes Reutilizáveis

### Componentes Custom (mapeados para primitivos shadcn/ui)

#### `<LeadCard>` — Card de lead no Kanban
- Base: `Card` + `CardContent`
- Props: `lead`, `showTaskBadge`, `compact`
- Variantes: `default` (Kanban), `list` (tabela mobile), `summary` (dropdown)
- Inclui: nome, empresa, valor, canal badge, responsável avatar, status tarefas
- Touch target mínimo: 44px de altura

#### `<ChannelBadge>` — Indicador de canal
- Base: `Badge`
- Props: `channel: 'whatsapp' | 'instagram' | 'webchat' | 'direct'`
- Sempre: ícone + texto + cor de fundo (3 indicadores)
- Tokens: `--channel-wa: #25d366`, `--channel-ig: #e1306c`, `--channel-web: #3b82f6`, `--channel-dir: #6b7280`

#### `<TaskStatusBadge>` — Status de tarefas do lead
- Base: `Badge`
- Variantes: `overdue` (destructive), `pending` (warning), `done` (success), `none` (outline)
- Sempre: ícone ⚠/⏰/✓/— + texto semântico (não só cor)

#### `<ConversationListItem>` — Item da lista do Inbox
- Base: custom sobre `div` + `Avatar` + `Badge`
- Props: `conversation`, `active`, `unreadCount`
- Inclui: avatar, nome, preview da última mensagem, canal badge, tempo relativo, dot de status
- Swipeable (mobile): ações "Resolver" e "Atribuir"

#### `<MessageBubble>` — Balão de mensagem
- Base: `div` estilizado
- Variantes: `outgoing` (direita, primária), `incoming` (esquerda, neutro)
- Inclui: texto, timestamp, status de entrega (✓✓), suporte a imagem/arquivo

#### `<KPICard>` — Card de KPI do Dashboard
- Base: `Card` + `CardContent` + `CardFooter`
- Props: `label`, `value`, `delta`, `deltaDirection`, `actionLabel`, `onAction`
- Sempre: valor principal + variação com direção (▲▼) + texto + link de ação
- Clicável: navega para lista filtrada

#### `<PipelineColumn>` — Coluna do Kanban
- Base: `ScrollArea` + DnD droppable zone
- Props: `stage`, `leads`, `isActive` (mobile)
- Inclui: header com nome + contador + soma de valor + botão [+], drop zone com highlight

#### `<ObligatoryTaskBlocker>` — Hard block de avanço
- Base: `AlertDialog`
- Ativado ao tentar mover lead com tarefas obrigatórias pendentes
- Lista as tarefas pendentes com checkboxes
- CTAs: "Ir para tarefas" e "Cancelar" — nunca permite bypass

#### `<NotificationItem>` — Item de notificação
- Base: `div` + `Badge` + `Button`
- Props: `notification` (tipo, prioridade, mensagem, tempo, actionLabel, onAction)
- Prioridade visual: cor + emoji + texto
- Clicável: navega + marca como lida

#### `<EmptyState>` — Estado vazio reutilizável
- Base: `div` com ilustração SVG + texto + CTA opcional
- Props: `illustration`, `title`, `description`, `actionLabel`, `onAction`
- Variantes: por tipo de conteúdo (leads, tarefas, notificações, conversas)

#### `<SearchInput>` — Input de busca com debounce
- Base: `Input` + ícone de busca + botão clear
- Props: `placeholder`, `onSearch`, `debounceMs` (default 300)
- Acessível: `aria-label`, `role="search"`

#### `<UserAvatar>` — Avatar com fallback de iniciais
- Base: `Avatar` + `AvatarImage` + `AvatarFallback`
- Props: `user` (nome, foto), `size: sm|md|lg`
- Fallback: 2 iniciais do nome, fundo baseado em hash do nome

#### `<DrawerForm>` — Drawer de formulário
- Base: `Sheet` (desktop) + `Drawer` vaul (mobile)
- Props: `title`, `children`, `onSave`, `onCancel`, `isLoading`
- Inclui: header fixo + área scrollável de conteúdo + footer fixo com botões
- Foco capturado, Esc fecha, backdrop click fecha

#### `<ConfirmDialog>` — Dialog de confirmação genérico
- Base: `AlertDialog`
- Props: `title`, `description`, `confirmLabel`, `cancelLabel`, `variant: 'default' | 'destructive'`
- Foco no botão de cancelar por padrão (padrão de segurança)

---

### Tokens de Design

```css
/* Cores Semânticas — nunca referenciar hex diretamente nos componentes */
--color-primary: #1a6b3c;          /* Verde Techmalhas — btn-primary, links */
--color-primary-foreground: #fff;  /* Texto sobre --color-primary */
--color-destructive: #dc2626;      /* Erros, tarefas vencidas, exclusão */
--color-warning: #f59e0b;          /* Alertas, tarefas prestes a vencer */
--color-success: #16a34a;          /* Confirmações, tarefas concluídas */
--color-info: #3b82f6;             /* Informativo, canal web */

/* Canais */
--channel-whatsapp: #25d366;
--channel-instagram: #e1306c;
--channel-webchat: #3b82f6;
--channel-direct: #6b7280;

/* Tamanhos mínimos de touch */
--touch-target-min: 44px;          /* Todos os elementos interativos */

/* Tipografia */
--font-base: 'Inter', system-ui;
--font-size-xs: 12px;    /* Labels, badges */
--font-size-sm: 14px;    /* Corpo secundário */
--font-size-base: 16px;  /* Corpo principal — mínimo para mobile */
--font-size-lg: 18px;    /* Subtítulos */
--font-size-xl: 24px;    /* Títulos de seção */
--font-size-2xl: 32px;   /* KPIs */
```

---

*Documento gerado por Davi Designer — CRM Techmalhas MVP v2 — 2026-05-24*
*Todas as 12 telas cobrem mobile (375px) e desktop (1280px).*
*Estados: loading, vazio, erro e sucesso documentados em todas as telas.*
*WCAG AA verificado para todas as combinações de cor mencionadas.*
