# ADR-007: Modelo Operacional PM-Tutora-Squad

**Data:** 2026-05-25
**Status:** Aceito
**Decisor:** Tania (Techmalhas, PO)
**Aprovador:** Tania
**Facilitadora:** Tutora (assistente Cursor)

---

## Contexto

Após a fase de bootstrap do CRM Techmalhas (auditoria, requisitos, wireframes,
arquitetura, código MVP, deploy Vercel + Supabase), o projeto entrou em fase de
**evolução contínua**: novos features (chat widget do site, integração WhatsApp,
hardening de segurança, novos perfis de usuário) serão construídos em sprints
incrementais, não mais via pipeline linear de 13 passos.

Até agora, a tutora (assistente Cursor) operava como executora direta — lia
arquivos, editava código, fazia commits, gerenciava deploy. Esse modelo funcionou
para tarefas pequenas, mas começou a mostrar limitações para decisões complexas
(ex: escolher entre 9 widgets de chat de mercado) ou implementações longas
(ex: 33h de dev para o chat).

A Tania percebeu que o squad já contém 5 agentes especializados
(`product-strategist`, `ux-designer`, `system-architect`, `fullstack-developer`,
`qa-documentation`) que foram **calibrados especificamente para Techmalhas** com
personas, vieses e critérios próprios. Subutilizá-los é desperdício de
capacidade analítica.

A proposta da Tania: formalizar um modelo onde a tutora deixa de ser executora
genérica e passa a ser **orquestradora** do squad, delegando tarefas profundas
aos especialistas e mantendo execução direta apenas para operações triviais e
coordenação.

---

## Forças (constraints)

| # | Restrição | Implicação |
|---|-----------|------------|
| F1 | Tania não é técnica — não conhece quem é cada agente | Tutora precisa ser único ponto de contato; nunca expor "qual agente acionar?" |
| F2 | Squad já existe e está calibrado para Techmalhas | Aproveitar capacidade analítica que já foi paga (em tokens) |
| F3 | Decisões grandes precisam de profundidade (pesquisa, ADRs) | Especialistas vão mais fundo que tutora generalista |
| F4 | Operações pequenas (consultar banco, ver logs) não justificam acionar agente | Tutora continua executando direto via MCPs |
| F5 | Tania quer ver progresso visível e rastreável | Toda entrega de agente precisa virar arquivo `.md` no `output/` |
| F6 | Agentes podem alucinar / divergir entre si | Tutora valida com MCPs (Vercel/Supabase) e consolida |
| F7 | Custos de inferência crescem com paralelização | Acionar 2 agentes ao mesmo tempo só quando ganho de tempo justifica |

---

## Decisão

Adotar o modelo operacional **"PM-Tutora-Squad"** em 3 camadas:

```
   TANIA (PO/Dona)
        ↓ pede / aprova
   TUTORA (orquestradora)
        ↓ delega ou executa
   SQUAD (5 especialistas + MCPs)
```

### Regras de delegação

A tutora decide com base na **régua de tempo + complexidade**:

| Tipo de tarefa | Quem executa | Exemplo |
|---|---|---|
| Operação direta (< 30 min, sem trade-off) | **Tutora** | "Quantos leads novos hoje?" → SQL via MCP Supabase |
| Decisão com trade-offs (> 1h pra pensar) | **Agente especialista** | "Qual chat widget construir?" → Patrícia |
| Implementação > 4h com escopo definido | **Fábio** (fullstack) | "Construir widget.js + /embed/chat" |
| Validação antes de deploy | **Quésia** (QA) | "Auditar segurança do webchat" |
| Refinamento UX após uso real | **Davi** (UX) | "Melhorar tela X após feedback" |
| Decisão arquitetural grande | **Arnaldo** (arquiteto) | "WebSocket vs polling para chat" |
| Coordenar múltiplos agentes | **Tutora** | "Juntar Patrícia + Arnaldo em recomendação" |

### Onde o trabalho mora

| Entrega | Localização |
|---|---|
| Relatórios e recomendações | `squads/crm-techmalhas/output/YYYY-MM-DD/` |
| ADRs (decisões arquiteturais) | `squads/crm-techmalhas/output/YYYY-MM-DD/adr-NNN.md` |
| Wireframes do Davi | `squads/crm-techmalhas/output/YYYY-MM-DD/wireframes/` |
| Specs QA da Quésia | `squads/crm-techmalhas/output/YYYY-MM-DD/qa-*.md` |
| Código | `crm-app/` |
| Status / decisões pequenas | Chat com Tania |
| Histórico do projeto (incidentes, lições) | `squads/crm-techmalhas/_memory/` |

### Tania sempre fala com a tutora

A Tania **nunca precisa saber qual agente acionar**. Ela diz o objetivo
("quero ativar o chat do site") e a tutora orquestra o resto. A tutora
explica, em linguagem simples, o que cada agente decidiu e o que ela
mesma executou.

### Aprovação antes de execução grande

Decisões com impacto > 4h de dev ou que mexem em produção precisam de
**aprovação explícita da Tania** antes da execução. Decisões pequenas
(commits, refactors localizados, ajustes de configuração) a tutora
executa direto e informa.

### Memória persistente

Toda decisão importante vira arquivo em `output/` ou `_memory/`.
Daqui a 6 meses, qualquer pessoa (ou novo agente) consegue ler
**por que** algo foi feito daquele jeito.

---

## Alternativas avaliadas

### A. Manter modelo atual (tutora faz tudo direto)

**Prós:** velocidade máxima em tarefas pequenas, sem overhead de delegação.
**Contras:** profundidade analítica limitada, sem rastro de decisões,
desperdiça squad pré-calibrado, escala mal para features grandes.

**Rejeitada** porque o projeto saiu de bootstrap e entrou em evolução
contínua — features novas precisam de mais reflexão.

### B. Tania fala diretamente com cada agente

**Prós:** elimina intermediário, transparência total.
**Contras:** Tania não é técnica e teria que aprender quem é cada agente,
qual prompt usar, como consolidar resultados. Vira fricção.

**Rejeitada** porque inverte o princípio de "tecnologia serve à dona,
não o contrário".

### C. PM-Tutora-Squad (decisão escolhida)

**Prós:** Tania mantém UX simples (um ponto de contato), squad é
aproveitado, decisões ficam documentadas, tutora coordena
e valida.
**Contras:** algum overhead de orquestração, custo de inferência
levemente maior (mas margem de ganho >> custo).

**Aceita** com as regras de delegação acima.

---

## Consequências

### Positivas

- **Profundidade:** decisões grandes têm pesquisa de mercado e fundamentação
- **Paralelização:** múltiplos agentes podem trabalhar ao mesmo tempo (ex: Patrícia e Arnaldo em paralelo no chat widget)
- **Memória institucional:** projeto tem rastro de "por quê" em `output/`
- **Escalabilidade:** novos features seguem o mesmo padrão
- **UX para Tania:** ela continua só conversando com a tutora; não precisa lembrar nomes de agentes

### Negativas

- **Overhead em tarefas pequenas:** se a tutora acionar agente para coisa boba, demora mais que o necessário (mitigado pela régua de 30min)
- **Custo de inferência:** ~20-30% maior que executar tudo direto (aceitável dado o ganho de qualidade)
- **Risco de inconsistência:** dois agentes podem se contradizer (mitigado pela tutora consolidando)

### Métricas de sucesso (revisar em 30 dias)

- ≥ 80% das decisões grandes são executadas por agente especialista (não pela tutora direto)
- 100% das ADRs novas ficam documentadas em `output/`
- Tempo médio Tania → decisão aprovada ≤ 30min
- 0 incidentes de produção causados por decisão tomada sem consulta a agente

---

## Plano de Saída

Se o modelo se mostrar lento ou caro demais em 30 dias, voltar para
modelo direto (tutora executa) mantendo apenas Quésia para auditoria
pré-deploy.

---

## Referências

- `squads/crm-techmalhas/agents/*.agent.md` — personas dos 5 agentes
- `squads/crm-techmalhas/squad.yaml` — configuração do squad
- `squads/crm-techmalhas/output/2026-05-25/recomendacao-chat-widget.md` (a criar) — exemplo de saída no novo modelo
