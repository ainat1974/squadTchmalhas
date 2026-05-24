---
type: checkpoint
outputFile: squads/crm-techmalhas/output/final-acceptance.md
---

# Step 13: Checkpoint — Revisão Final e Handoff

## Apresentação para a Tania

🎉 **O squad completou todas as 12 etapas anteriores!**

A entrega do MVP do CRM Techmalhas está consolidada em:

📁 `squads/crm-techmalhas/output/<run_id>/`

Arquivos para revisar (na ordem):
1. `audit-report.md` — Auditoria comparativa de CRMs (Clint, RD Station, Pipedrive)
2. `requirements.md` — User Stories priorizadas do MVP
3. `wireframes.md` — Telas em mobile + desktop
4. `design-system.md` — Cores, tipografia, componentes
5. `architecture.md` — ADRs, ERD, API spec, plano LGPD
6. `code/db-schema.md` — Schema Prisma + migrations + RLS
7. `code/backend.md` — Endpoints REST + integração WhatsApp + cron
8. `code/frontend.md` — Páginas Next.js + componentes
9. `test-report.md` — Resultados de testes (unit + integration + E2E)
10. `deployment-handoff.md` — **Comece aqui** — Roteiro completo de deploy + documentação

## Perguntas para a Tania

Use `AskUserQuestion`:

### 1. Você aceita a entrega do MVP?
Opções:
- ✅ Aceito — entrega completa e clara
- 🔧 Aceito com ajustes pontuais (descreva em "Outro")
- 🔄 Quero re-rodar alguma etapa específica
- ❌ Preciso de revisão maior antes de aceitar

### 2. Próximo passo prioritário?
Opções:
- 🚀 Vou começar o deploy agora seguindo `deployment-handoff.md`
- 👀 Quero revisar mais antes (vou ler com calma)
- 👥 Vou compartilhar com Renato e equipe antes
- 🛠️ Quero criar um squad de iteração (Backlog v2)

### 3. Squad de evolução pós-MVP?
Opções:
- 📦 Ainda não — focar em rodar o MVP primeiro
- 🔌 Sim — criar squad para integração Dapic ERP
- 📊 Sim — criar squad para relatórios e BI avançado
- 🤖 Sim — criar squad para automações IA e WhatsApp Bot

## Output Format

Gravar em `squads/crm-techmalhas/output/<run_id>/final-acceptance.md`:

```markdown
# Aceite Final — Checkpoint 3

**Data:** [YYYY-MM-DD HH:mm]
**Aprovado por:** Tania (Techmalhas)
**Versão entregue:** MVP v0.1.0

## Decisões

### Aceite da Entrega
[Resposta]

### Próximo Passo Prioritário
[Resposta]

### Squad de Evolução
[Resposta]

## Ajustes Solicitados
[Lista — ou "Nenhum"]

## Acervo Entregue
- audit-report.md
- requirements.md
- wireframes.md
- design-system.md
- architecture.md
- code/db-schema.md
- code/backend.md
- code/frontend.md
- test-report.md
- deployment-handoff.md

## Status Final
✅ MVP entregue com sucesso

## Memórias para Próximas Iterações
[Aprendizados deste run que devem ser preservados em _memory/memories.md]

## Run Registrado
Adicionar entrada em `_memory/runs.md`:
| Data | Run ID | Tema | Output | Resultado |
| [data] | [run_id] | CRM MVP | [path] | ✅ Aceito |
```

## Comportamento do Runner

- Apresentar lista de arquivos com paths exatos
- Usar `AskUserQuestion` com até 3 slots
- Gravar `final-acceptance.md`
- **Atualizar `_memory/runs.md`** com a nova entrada (data, run_id, tema "CRM MVP", path do output, resultado)
- **Atualizar `_memory/memories.md`** se houver aprendizados novos
- Apresentar mensagem final de celebração e próximos passos
