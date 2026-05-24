---
type: checkpoint
outputFile: squads/crm-techmalhas/output/architecture-decision.md
---

# Step 07: Checkpoint — Aprovar Arquitetura

## Apresentação para a Tania

O Arnaldo Arquiteto entregou a arquitetura técnica completa em
`squads/crm-techmalhas/output/<run_id>/v1/architecture.md`.

**Este é o ponto de não-retorno antes de gerar código.** Mudanças depois custam dias de
refatoração. Por favor, revise especialmente:

1. **ADRs (Architecture Decision Records)** — Prisma, Auth, Cron, Dapic
2. **Modelo de dados** — todas as tabelas que serão criadas
3. **Plano LGPD** — está adequado ao que a Techmalhas precisa?
4. **Custo mensal estimado** — cabe no orçamento?
5. **Riscos técnicos** — algum bloqueante?

## Perguntas para a Tania

Use `AskUserQuestion` para apresentar:

### 1. Você aprova a arquitetura técnica?
Opções:
- ✅ Sim, pode prosseguir para implementação
- 🔧 Aprovo com ajustes em ADRs específicos (descreva em "Outro")
- ⚠️ Quero revisar o modelo de dados antes
- ❌ Quero rever a stack escolhida

### 2. Sobre o custo mensal estimado (~US$45-60):
Opções:
- ✅ Está bom, pode seguir
- 💰 Quero opções mais baratas (avaliar Neon ao invés de Supabase Pro)
- 💎 Posso investir mais para ter recursos melhores (ex: Vercel Enterprise)
- 🤔 Não tenho certeza, quero ver detalhamento

### 3. Sobre a integração com Dapic ERP:
Opções:
- ✅ Confirmar abordagem definida no Checkpoint 1
- 🔄 Mudei de ideia, quero diferente (descreva em "Outro")
- 📞 Preciso falar com fornecedor Dapic antes de decidir
- ⏭️ Discutir após o MVP estar no ar

## Output Format

Gravar em `squads/crm-techmalhas/output/<run_id>/architecture-decision.md`:

```markdown
# Decisão de Arquitetura — Checkpoint 2

**Data:** [YYYY-MM-DD HH:mm]
**Aprovado por:** Tania (Techmalhas)

## Decisões

### Arquitetura Geral
[Resposta]

### Custo Mensal
[Resposta]

### Integração Dapic
[Resposta]

## Ajustes Solicitados em ADRs
[Lista — ou "Nenhum"]

## Próximos Passos
Pipeline prosseguirá para Steps 08-10 (Database, Backend API, Frontend) com o
Fábio Fullstack, implementando segundo a arquitetura aprovada.

⚠️ A partir deste ponto, mudanças estruturais (stack, modelo de dados, integrações)
exigirão refatoração custosa.
```

## Comportamento do Runner

- Mostrar `architecture.md` antes das perguntas
- Usar `AskUserQuestion` com até 3 slots para coletar respostas
- Gravar `architecture-decision.md` com decisões literais
- Se aprovado: prosseguir para Step 08
- Se rejeitado: voltar para Step 06 com novo input
