---
type: checkpoint
outputFile: squads/crm-techmalhas/output/scope-decision.md
---

# Step 03: Checkpoint — Aprovar Escopo do MVP

## Apresentação para a Tania

A Patrícia Produto entregou a auditoria comparativa (`audit-report.md`) e o backlog
priorizado do MVP (`requirements.md`).

**Antes de seguir para wireframes e arquitetura, preciso da sua aprovação no escopo.**

Por favor, revise os documentos:
- `squads/crm-techmalhas/output/<run_id>/v1/audit-report.md`
- `squads/crm-techmalhas/output/<run_id>/v1/requirements.md`

E responda as perguntas abaixo. Suas respostas serão gravadas em
`squads/crm-techmalhas/output/<run_id>/scope-decision.md` e usadas como
referência pelos próximos agentes.

## Perguntas para a Tania

Use `AskUserQuestion` para apresentar estas perguntas:

### 1. Você aprova o escopo do MVP proposto?
Opções:
- ✅ Sim, exatamente isso
- 🔧 Sim, mas quero ajustar algumas stories
- ➕ Aprovo, mas quero adicionar X (descreva em "Outro")
- ❌ Quero refazer com escopo diferente

### 2. Sobre integração com o ERP Dapic — qual abordagem prefere?
Opções:
- 🟢 Fora do MVP — só preparar a estrutura de dados (campos `dapic_id` reservados)
- 🟡 Integração leve no MVP — sincronizar contatos (one-way: CRM → Dapic)
- 🔴 Integração completa no MVP — bidirecional, requer documentação API Dapic
- 🤔 Não sei ainda — discutir com fornecedor Dapic primeiro

### 3. Sobre os 4 perfis de usuário (admin, gestor, vendedor) — alguma personalização?
Opções:
- ✅ Os 3 perfis estão bons
- ➕ Quero um perfil específico para Atacado vs Varejo
- ➕ Quero um perfil "visualizador" (só lê, não edita)
- 🔧 Outro (descreva em "Outro")

## Output Format

Gravar em `squads/crm-techmalhas/output/<run_id>/scope-decision.md`:

```markdown
# Decisão de Escopo — Checkpoint 1

**Data:** [YYYY-MM-DD HH:mm]
**Aprovado por:** Tania (Techmalhas)

## Decisões

### Escopo Geral
[Resposta da Tania à pergunta 1]

### Integração Dapic
[Resposta da Tania à pergunta 2]

### Perfis de Usuário
[Resposta da Tania à pergunta 3]

## Ajustes Solicitados
[Lista de mudanças vs proposta original, se houver]

## Próximos Passos
Pipeline prosseguirá para Steps 04 (Wireframes) e 05 (Design System) com a
Davi Designer, considerando as decisões acima.
```

## Comportamento do Runner

- Apresentar todos os arquivos para revisão antes das perguntas
- Usar `AskUserQuestion` (uma chamada com até 4 slots) para coletar as 3 respostas
- Gravar `scope-decision.md` com as respostas literais
- Se Tania escolher "Quero refazer com escopo diferente" → retornar ao Step 02 com novo input
- Se aprovado: prosseguir para Step 04
