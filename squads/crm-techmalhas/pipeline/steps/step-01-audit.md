---
execution: subagent
agent: product-strategist
outputFile: squads/crm-techmalhas/output/audit-report.md
model_tier: powerful
---

# Step 01: Auditoria de CRMs de Referência

## Context Loading

Load these files before executing:
- `_opensquad/_memory/company.md` — perfil completo da Techmalhas (atacado + varejo, ERP Dapic, slogan)
- `_opensquad/_memory/preferences.md` — idioma e formato preferidos da Tania
- `squads/crm-techmalhas/_build/discovery.yaml` — escopo declarado, stack, decisões
- `squads/crm-techmalhas/pipeline/data/research-brief.md` — auditoria preliminar do Clint Digital
- `squads/crm-techmalhas/pipeline/data/anti-patterns.md` — evitar copiar Clint cegamente

## Instructions

### Process

1. **Auditar Clint Digital em profundidade** — usar `web_fetch` em https://www.clint.digital, https://pages.clint.digital/parceiro, https://site.clint.digital/planos, https://www.clint.digital/automcao. Extrair: posicionamento, planos, features, integrações, target. Use o research-brief como ponto de partida e expanda.
2. **Auditar 2 CRMs comparáveis brasileiros** — usar `web_search` + `web_fetch` para auditar RD Station CRM e Pipedrive. Para cada um: features-chave, preço (BR), público-alvo, gaps.
3. **Mapear features comparativamente** — tabela com cada feature listada nas 3 ferramentas + nota de prioridade para Techmalhas (🔴/🟡/🟢) baseada em personas (Vitor, Amanda, Renato).
4. **Identificar gaps específicos para Techmalhas** — features que NENHUMA das 3 ferramentas oferece bem mas a Techmalhas precisa (ex: dualidade Atacado/Varejo nativa, integração Dapic, gestão de coleções).
5. **Resumir trade-offs estratégicos** — comprar pronto vs construir próprio, com números (custo Clint anual vs custo dev próprio estimado).
6. **Produzir o documento** seguindo o Output Format abaixo, salvando em `squads/crm-techmalhas/output/audit-report.md`.

## Output Format

```markdown
# Auditoria de CRMs — Referências para o CRM Techmalhas

> **TL;DR:** [1-2 frases com a conclusão principal]
> **Data da auditoria:** [YYYY-MM-DD]
> **Fontes principais:** [URLs auditadas]

## 1. Resumo Executivo
[Parágrafo com a foto geral: quais ferramentas analisadas, principais aprendizados, recomendação]

## 2. Clint Digital — Análise Detalhada
### Posicionamento
### Planos e Preços
### Features Mapeadas
### Forças
### Fraquezas para o Caso Techmalhas

## 3. RD Station CRM — Análise Detalhada
[mesma estrutura]

## 4. Pipedrive — Análise Detalhada
[mesma estrutura]

## 5. Mapa Comparativo
| Feature | Clint | RD Station | Pipedrive | Prioridade Techmalhas | MVP? |
|---|---|---|---|---|---|

## 6. Gaps que Nenhum CRM Cobre Bem
[Lista de necessidades específicas Techmalhas não atendidas]

## 7. Análise Custo: Comprar vs Construir
[Tabela: Clint vs Construir Próprio, com TCO 3 anos]

## 8. Recomendação para o Squad
[Parágrafo: o que copiar como inspiração, o que evitar, o que inovar]
```

## Output Example

```markdown
# Auditoria de CRMs — Referências para o CRM Techmalhas

> **TL;DR:** Clint Digital é forte em WhatsApp e cadência mas caro e voltado a infoproduto.
> RD Station é maduro mas pesado e caro para PME industrial. Pipedrive é leve mas fraco
> em WhatsApp BR. Construir próprio se paga em 14 meses e dá controle total da dualidade
> Atacado/Varejo + integração Dapic.
> **Data da auditoria:** 2026-05-24
> **Fontes principais:** clint.digital, rdstation.com/crm, pipedrive.com/pt

## 1. Resumo Executivo

Auditei 3 CRMs do mercado brasileiro relevantes para o caso Techmalhas: Clint Digital
(referência indicada pela Tania), RD Station CRM (líder nacional) e Pipedrive (líder global
com presença forte no BR). Os 3 oferecem o essencial (pipeline, contatos, atividades), mas
divergem em integração WhatsApp, preço e ajuste ao contexto B2B+B2C de indústria de vestuário.

## 2. Clint Digital — Análise Detalhada

### Posicionamento
"1º CRM all-in-one para vendas + atendimento + automação". Originalmente focado em
infoprodutores, expandiu para varejo/indústria em 2024.

### Planos e Preços (anual)
- Starter: R$ 523/mês (mín 2 usuários)
- Growth: R$ 800/mês (mín 3 usuários) — WhatsApp API Oficial
- Pro: R$ 1.177/mês (mín 4 usuários) — Webhooks, automações IA

[continua com todas as seções...]
```

## Veto Conditions

Reject and redo if ANY are true:
1. Auditoria do Clint baseada apenas no research-brief existente, sem `web_fetch` ao vivo de pelo menos 3 páginas do site oficial
2. Falta auditoria de pelo menos UMA alternativa brasileira além do Clint
3. Tabela comparativa sem coluna de prioridade para Techmalhas
4. Recomendação sem análise quantitativa de custo (Clint anual vs estimativa próprio)

## Quality Criteria

- [ ] 3 CRMs auditados (Clint + RD Station + Pipedrive)
- [ ] Cada CRM com forças, fraquezas e preço atual
- [ ] Mapa comparativo cobre min 15 features
- [ ] Gaps específicos Techmalhas explicitamente listados
- [ ] Análise custo comprar vs construir com horizonte de 3 anos
- [ ] Fontes citadas (URLs com data de acesso)
- [ ] Recomendação clara para o squad
