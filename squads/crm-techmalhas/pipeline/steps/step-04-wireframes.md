---
execution: subagent
agent: ux-designer
inputFile: squads/crm-techmalhas/output/requirements.md
outputFile: squads/crm-techmalhas/output/wireframes.md
model_tier: powerful
---

# Step 04: Wireframes das Telas-Chave

## Context Loading

Load these files before executing:
- `squads/crm-techmalhas/output/requirements.md` — user stories aprovadas
- `squads/crm-techmalhas/output/scope-decision.md` — ajustes do Checkpoint 1
- `_opensquad/_memory/company.md` — identidade Techmalhas (cores, tom)
- `squads/crm-techmalhas/pipeline/data/domain-framework.md` — padrões UI de CRM
- `squads/crm-techmalhas/pipeline/data/output-examples.md` — exemplo de wireframe
- `squads/crm-techmalhas/pipeline/data/anti-patterns.md` — evitar "só desktop"

## Instructions

### Process

1. **Listar todas as telas necessárias** a partir das user stories. Agrupar stories por tela. Cobertura mínima obrigatória: Login, Pipeline Kanban, Lista de Leads, Detalhe de Lead (drawer), Chat WhatsApp Inbox, Conversa WhatsApp, Minhas Tarefas, Dashboard de Indicadores, Configurações de Pipeline, Gestão de Usuários (admin).
2. **Desenhar cada tela em mobile (375px) e desktop (1280px)** usando ASCII art. Nomear cada região e componente com ID semântico (`btn-create-lead`, `kanban-column-novo-lead`).
3. **Anotar estados** ao lado de cada tela: loading, vazio, erro, sucesso, intermediário.
4. **Anotar interações** — drag&drop, tap, swipe, keyboard nav. Para mobile, considerar alternativas ao drag (long press → menu).
5. **Anotar acessibilidade** — contraste, foco, ARIA, screen reader, touch targets.
6. **Mapear componentes shadcn/ui** que serão usados — Card, Sheet, Dialog, Form, etc.
7. **Documentar fluxos críticos** como sequência de telas:
   - Fluxo 1: Login → Pipeline
   - Fluxo 2: Criar Lead (manual) → Card aparece no Kanban
   - Fluxo 3: Mover Deal entre stages
   - Fluxo 4: Receber WhatsApp → Atender via Chat
   - Fluxo 5: Completar Tarefa Obrigatória → Liberar movimentação
8. **Produzir documento** seguindo Output Format, salvar em `squads/crm-techmalhas/output/wireframes.md`.

## Output Format

```markdown
# Wireframes — CRM Techmalhas MVP

> **TL;DR:** [N] telas, todas com versão mobile + desktop, mapeadas para shadcn/ui.

## 1. Telas (índice)
[Lista numerada com IDs e URLs]

## 2. Tela: Login
### ID: screen-login
### URL: /login

#### Mobile (375px)
[ASCII wireframe]

#### Desktop (1280px)
[ASCII wireframe]

#### Estados
- Loading: ...
- Vazio: N/A
- Erro: ...
- Sucesso: ...

#### Interações
- ...

#### Acessibilidade
- ...

#### Componentes shadcn
- Form, Input, Button, Card

[Repete para TODAS as telas]

## N. Fluxos Críticos

### Fluxo 1: Login → Pipeline
1. screen-login → preenche credenciais
2. POST /api/auth/login
3. Redirect → screen-pipeline-kanban
4. ...

[Repete para os 5 fluxos]

## N+1. Componentes Reutilizáveis
[Lista de componentes custom que serão criados, com base shadcn]
```

## Output Example

```markdown
# Wireframes — CRM Techmalhas MVP

> **TL;DR:** 10 telas principais + 5 fluxos críticos documentados. Mobile-first.

## 1. Telas

1. screen-login (`/login`)
2. screen-pipeline-kanban (`/pipeline?type=atacado|varejo`)
3. screen-leads-list (`/leads`)
4. screen-lead-detail (drawer aberto via /leads/:id)
5. screen-chat-inbox (`/chat`)
6. screen-chat-conversation (`/chat/:contactId`)
7. screen-my-tasks (`/tasks`)
8. screen-dashboard (`/dashboard`)
9. screen-settings-pipeline (`/settings/pipelines/:id`)
10. screen-settings-users (`/settings/users`)

## 2. Tela: Login
### ID: screen-login
### URL: /login

#### Mobile (375px)
\`\`\`
┌─────────────────────┐
│                     │
│   [Techmalhas]      │
│                     │
│   Bem-vinda(o)      │
│                     │
│  ┌───────────────┐  │
│  │ E-mail        │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Senha    👁️   │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │   Entrar      │  │
│  └───────────────┘  │
│                     │
│  Esqueci a senha    │
└─────────────────────┘
\`\`\`

#### Desktop (1280px)
\`\`\`
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│          ┌──────────────────────────┐                      │
│          │   [Logo Techmalhas]      │                      │
│          │                          │                      │
│          │   Bem-vinda(o) ao CRM    │                      │
│          │                          │                      │
│          │   ┌────────────────────┐ │                      │
│          │   │ E-mail             │ │                      │
│          │   └────────────────────┘ │                      │
│          │   ┌────────────────────┐ │                      │
│          │   │ Senha          👁️ │ │                      │
│          │   └────────────────────┘ │                      │
│          │   ┌────────────────────┐ │                      │
│          │   │       Entrar       │ │                      │
│          │   └────────────────────┘ │                      │
│          │   Esqueci a senha       │                      │
│          └──────────────────────────┘                      │
│                                                            │
│           "Casual que dura. Conforto que você sente."     │
└────────────────────────────────────────────────────────────┘
\`\`\`

#### Estados
- Loading: botão "Entrando..." com spinner, inputs desabilitados
- Erro: toast vermelho "E-mail ou senha incorretos" (sem dizer qual)
- Sucesso: redirect imediato

#### Interações
- Submit por Enter
- Toggle de visualização de senha (👁️)
- Esqueci senha → screen-forgot-password (fora do MVP, link disabled com tooltip)

#### Acessibilidade
- Labels semânticos nos inputs
- Foco visível ao tabar
- Anúncio de erro para screen reader
- Contraste do botão primário: ✅ AA

#### Componentes shadcn
- Form, FormField, Input, Button, Card, Label, Toast

[Repete para as outras 9 telas...]
```

## Veto Conditions

Reject and redo if ANY are true:
1. Alguma tela documentada apenas em desktop (sem versão mobile)
2. Tela sem documentação de estados (loading, vazio, erro)
3. Pipeline Kanban sem indicação clara de drag&drop (desktop) e alternativa (mobile)
4. Faltam fluxos críticos para tarefas obrigatórias bloqueantes
5. Componentes nomeados por cor ou hex (ex: `btn-blue`) em vez de semântica

## Quality Criteria

- [ ] 10 telas principais cobertas
- [ ] Cada tela com versão mobile (375px) E desktop (1280px)
- [ ] Estados documentados (loading, vazio, erro, sucesso)
- [ ] 5 fluxos críticos documentados como sequência
- [ ] Cada componente custom mapeado para um primitive shadcn/ui
- [ ] IDs semânticos (kebab-case, descritivos)
- [ ] Acessibilidade WCAG AA verificada
