---
execution: subagent
agent: product-strategist
inputFile: squads/crm-techmalhas/output/audit-report.md
outputFile: squads/crm-techmalhas/output/requirements.md
model_tier: powerful
---

# Step 02: Requisitos e User Stories do MVP

## Context Loading

Load these files before executing:
- `squads/crm-techmalhas/output/audit-report.md` — auditoria do Step 01 (features mapeadas)
- `_opensquad/_memory/company.md` — perfil Techmalhas
- `squads/crm-techmalhas/_build/discovery.yaml` — escopo MVP declarado pela Tania
- `squads/crm-techmalhas/pipeline/data/domain-framework.md` — padrões de CRM SaaS
- `squads/crm-techmalhas/pipeline/data/quality-criteria.md` — critérios universais
- `squads/crm-techmalhas/pipeline/data/output-examples.md` — exemplo de user story bem feita
- `squads/crm-techmalhas/pipeline/data/anti-patterns.md` — evitar over-engineering

## Instructions

### Process

1. **Mapear features do MVP** a partir de discovery.yaml + audit-report, agrupando em épicos: Autenticação & Usuários, Pipeline & Deals, Contatos & Leads, Atividades & Tarefas Obrigatórias, WhatsApp Cloud API, Dashboard & Relatórios, Configurações.
2. **Definir personas finais** com nome, contexto, jornada e necessidades-chave: Vitor (vendedor atacado), Amanda (atendente varejo), Renato (gestor), José (cliente lojista).
3. **Escrever user stories** — uma por funcionalidade. Formato `Como [persona], quero [ação] para [benefício]`. Cada story: prioridade (🔴/🟡/🟢), esforço (P/M/G/GG), dependências, observações técnicas, critérios de aceitação Given/When/Then.
4. **Priorizar e ordenar o backlog** — primeiro tudo que Tania pediu explicitamente. Depois dependências técnicas. Por último, nice-to-haves.
5. **Identificar riscos e perguntas em aberto** marcadas como `⚠️ Decisão necessária no Checkpoint 1`.
6. **Produzir documento** seguindo Output Format, salvando em `squads/crm-techmalhas/output/requirements.md`.

## Output Format

```markdown
# Requisitos e User Stories — MVP CRM Techmalhas

> **TL;DR:** [escopo MVP em 2-3 frases]
> **Total de stories:** [N essenciais 🔴 + N importantes 🟡 + N nice-to-have 🟢]
> **Esforço estimado:** [soma de P/M/G/GG]

## 1. Personas
[Tabela com Vitor, Amanda, Renato, José — papel, contexto, dores principais]

## 2. Visão do MVP
[Parágrafo: o que está dentro, o que está fora, por quê]

## 3. Épicos
[Lista de épicos com N stories cada]

## 4. Backlog Priorizado

### Épico A: [nome]
#### US-001 — [título curto]
**Como** [persona]...
**Prioridade:** 🔴 Essencial
**Esforço:** M
**Critérios de Aceitação:**
GIVEN... WHEN... THEN...

[repete para cada story]

## 5. Matriz de Dependências
[Lista de stories que dependem de outras]

## 6. Riscos e Perguntas em Aberto
[Lista marcada com ⚠️ — questões a serem decididas no Checkpoint 1]

## 7. Out of Scope (Backlog v2/v3)
[Lista das features cortadas com justificativa]
```

## Output Example

```markdown
# Requisitos e User Stories — MVP CRM Techmalhas

> **TL;DR:** MVP cobre pipeline Kanban dual (Atacado/Varejo), gestão de contatos e
> leads, tarefas obrigatórias bloqueantes, integração WhatsApp Cloud API e dashboard
> básico. Fora do escopo: campanhas em massa, agentes IA, Instagram DM, integração
> Dapic completa (apenas estrutura preparada).
> **Total de stories:** 24 🔴 + 8 🟡 + 6 🟢
> **Esforço estimado:** 12 P + 14 M + 8 G + 2 GG

## 1. Personas

| Persona | Papel | Contexto | Dores Principais |
|---|---|---|---|
| Vitor | Vendedor de Atacado | Atende lojistas via WhatsApp, viaja a feiras | Perder follow-up, não saber qual lead esfriou |
| Amanda | Atendente de Varejo | Responde clientes finais via WhatsApp e Instagram | Trocar 5 abas para checar pedido + histórico |
| Renato | Gestor Comercial | Acompanha equipe, define metas, fecha contratos grandes | Não saber se equipe cumpriu tarefas críticas |
| José | Cliente Lojista | Compra atacado mensalmente | Ser tratado como cliente novo a cada compra |

## 2. Visão do MVP

O MVP entrega o ciclo completo: lead entra (WhatsApp ou manual) → vira deal no pipeline
correto → vendedor responsável executa tarefas obrigatórias da etapa → move o deal até
ganho ou perdido. Renato acompanha tudo no dashboard. Fora: campanhas, agentes IA,
integração Dapic completa.

## 3. Épicos

| # | Épico | Stories Essenciais | Stories Backlog |
|---|---|---|---|
| A | Autenticação & Usuários | 3 | 2 |
| B | Pipeline & Deals | 6 | 2 |
| C | Contatos & Leads | 4 | 3 |
| D | Atividades & Tarefas Obrigatórias | 4 | 1 |
| E | WhatsApp Cloud API | 4 | 2 |
| F | Dashboard & Relatórios | 3 | 4 |

## 4. Backlog Priorizado

### Épico A: Autenticação & Usuários

#### US-001 — Usuário faz login com e-mail e senha

**Como** vendedor (Vitor),
**quero** entrar no CRM com meu e-mail e senha corporativos,
**para** acessar meus leads e tarefas com segurança.

**Prioridade:** 🔴 Essencial
**Esforço:** P
**Depende de:** Nada (primeira story)

**Critérios de Aceitação:**

GIVEN que tenho conta criada pelo admin
WHEN acesso `/login` com e-mail e senha corretos
THEN sou redirecionado para `/pipeline`
AND meu nome aparece no header

GIVEN credenciais incorretas
WHEN tento login
THEN vejo mensagem "E-mail ou senha incorretos" sem dizer qual está errado
AND tentativas ficam logadas em `audit_logs`

[continua com US-002 até US-038...]
```

## Veto Conditions

Reject and redo if ANY are true:
1. Alguma feature pedida explicitamente por Tania (Pipeline, Leads, Histórico, Dashboard, Funil, WhatsApp Oficial, Tarefas Obrigatórias) está sem story 🔴
2. User story sem critérios Given/When/Then específicos
3. Story sem persona nomeada (genérico "usuário")
4. MVP com mais de 40 stories 🔴 (sinal de escopo inflado)
5. Não há perguntas em aberto marcadas — em projeto deste tamanho, é improvável que tudo esteja 100% definido

## Quality Criteria

- [ ] 4 personas nomeadas com contexto e dores
- [ ] Cada story tem prioridade, esforço, dependências, critérios GWT
- [ ] Pipeline dual (Atacado + Varejo) está nas stories
- [ ] Tarefas mandatórias bloqueantes têm story dedicada
- [ ] WhatsApp Cloud API tem stories cobrindo: webhook, envio, templates
- [ ] LGPD aparece em stories de consentimento
- [ ] Out of Scope com justificativa por item
- [ ] Riscos/perguntas para Checkpoint 1 listados
