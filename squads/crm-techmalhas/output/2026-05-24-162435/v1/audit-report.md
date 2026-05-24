# Auditoria de CRMs — Referências para o CRM Techmalhas

> **TL;DR:** O Clint Digital é a referência mais próxima em filosofia (WhatsApp-first + pipeline visual), mas foi construído para infoprodutores, não para indústria de vestuário com dualidade Atacado/Varejo — construir um CRM próprio justifica-se financeiramente a partir do ano 2 e garante os diferenciais que nenhum dos três cobre (integração Dapic, pipelines separados por canal, gestão de coleções sazonais). A decisão de construir é correta; o Clint serve como padrão de UX a ser copiado seletivamente, não como modelo arquitetural.
>
> **Data da auditoria:** 2026-05-24
>
> **Fontes principais:**
> - https://www.useclint.com/ (acesso: 2026-05-24)
> - https://site.clint.digital/planos (acesso: 2026-05-24)
> - https://pages.clint.digital/parceiro (acesso: 2026-05-24)
> - https://www.clint.digital/blog/crm-custo-beneficio-infoprodutores-whatsapp-2026 (acesso: 2026-05-24)
> - https://www.rdstation.com/planos/crm/ (acesso: 2026-05-24)
> - https://www.edialog.com.br/rd-station-crm/ (acesso: 2026-05-24)
> - https://www.compararsoftware.com.br/crm/articulos/pipedrive-precos-brasil-planos-alternativas (acesso: 2026-05-24)
> - https://affinco.com/pt/pipedrive-pricing/ (acesso: 2026-05-24)

---

## 1. Resumo Executivo

Foram analisados três CRMs de referência — **Clint Digital**, **RD Station CRM** e **Pipedrive** — avaliando posicionamento, planos, features e gaps específicos para o contexto da Techmalhas. O Clint Digital é o benchmark mais próximo do modelo operacional desejado (pipeline Kanban + WhatsApp API oficial + tarefas obrigatórias), mas foi concebido exclusivamente para infoprodutores e high-ticket, não para fabricação nacional de vestuário com dois canais de venda estruturalmente diferentes. O RD Station CRM é robusto para times inbound e email-centric, mas exige provedor BSP externo para WhatsApp (quebrando o fluxo de Amanda e Vitor) e não oferece pipeline nativo por canal. O Pipedrive tem o pipeline Kanban mais maduro do mercado e relatórios avançados, mas cobra em dólar, não tem WhatsApp nativo e é orientado a ciclos longos de B2B — distante do ritmo de atacado/varejo da Techmalhas.

**Recomendação:** construir o CRM próprio usando o Clint como referência de UX e o Pipedrive como referência de pipeline e relatórios, sem copiar nenhum dos dois integralmente.

---

## 2. Clint Digital — Análise Detalhada

### Posicionamento

Clint se posiciona como "a plataforma de vendas feita para quem vive de bater meta". Originalmente o "1º CRM 100% focado para infoprodutores, lançamentos, perpétuos e high ticket do Brasil", expandiu recentemente para clínicas médicas, instituições de ensino e agências de marketing. O site em inglês (useclint.com) sinaliza movimento de internacionalização em 2025-2026.

**Público-alvo declarado:** infoprodutores com 2 a 15 vendedores, usando WhatsApp como canal principal de fechamento. Não há menção a indústria, atacado ou gestão de lojistas.

### Planos e Preços (dados auditados ao vivo em 2026-05-24)

| Plano | Valor/mês (anual) | Usuários mínimos | Contatos incluídos |
|---|---|---|---|
| Starter | R$ 523 | 2 | 25.000 |
| Growth | R$ 800 | 3 | 100.000 |
| Elite | R$ 1.177 | 4 | 250.000 |

**Custo anual por plano:**
- Starter: R$ 6.276/ano
- Growth: R$ 9.600/ano
- Elite: R$ 14.124/ano

**Notas:** WhatsApp API Oficial (Meta Cloud API) disponível apenas a partir do plano Growth. O plano Starter usa WhatsApp Web/não oficial, insuficiente para o MVP da Techmalhas.

### Features Mapeadas

| Feature | Starter | Growth | Elite |
|---|---|---|---|
| Pipeline Kanban | ✅ | ✅ | ✅ |
| Cadastro de leads/contatos | ✅ | ✅ | ✅ |
| Histórico de interações | ✅ | ✅ | ✅ |
| WhatsApp API Oficial (Meta) | ❌ | ✅ | ✅ |
| Instagram Direct | ❌ | ✅ | ✅ |
| Tarefas/Cadência de atividades | ✅ | ✅ | ✅ |
| Templates/Playbook | ✅ | ✅ | ✅ |
| Respostas rápidas | ❌ | ✅ | ✅ |
| Distribuição automática de leads | ❌ | ✅ | ✅ |
| Dashboard de indicadores | ✅ (5 rel.) | ✅ (10 rel.) | ✅ (ilimitado) |
| Integrações checkout (Hotmart/Kiwify) | ✅ | ✅ | ✅ |
| Agendamento de mensagens | ❌ | ✅ | ✅ |
| Agentes IA (WhatsApp bots 24/7) | ❌ | Parcial | ✅ |
| Webhooks/API de saída | ❌ | ❌ | ✅ |
| Sincronização de histórico WA | ❌ | ❌ | ✅ |
| Campanhas SMS/Voz em massa | ✅ | ✅ | ✅ |
| CS especialista dedicado | ❌ | ✅ | ✅ |

### Forças

1. **Stack integrado sem custo adicional** — WhatsApp API, CRM e automação em um único plano (Growth em diante).
2. **UX WhatsApp-first** — conversa e negociação acontecem na mesma tela, sem sair do CRM.
3. **Pipeline Kanban visual** — arrastável, com visão por etapa e por responsável.
4. **Dados em servidores nacionais** — relevante para LGPD.
5. **Integrações nativas com Hotmart e Kiwify** — referência de como integrações com sistemas de gestão próprios devem funcionar.
6. **Cadência de atividades** — modelo de referência para as tarefas obrigatórias que Renato precisa controlar.

### Fraquezas para o Caso Techmalhas

- **Sem dualidade Atacado/Varejo** — um único pipeline por padrão; não há conceito de "canal de venda" separado com etapas distintas para lojistas (José/Vitor) vs. consumidores (Amanda).
- **Sem integração com ERPs de vestuário** — o Dapic não é nem BSP parceiro nem mencionado. A API de saída (Elite) exigiria desenvolvimento customizado.
- **Público-alvo incompatível** — o produto inteiro é calibrado para infoprodutores digitais, não para fabricação/varejo físico.
- **Custo alto para escala limitada** — R$ 9.600/ano (Growth) para apenas 3 usuários, sem nenhuma vantagem competitiva sobre construir próprio.
- **WhatsApp API apenas no plano Growth** — o plano mais barato não cobre o requisito do MVP.
- **Sem gestão de coleções/sazonalidade** — não há conceito de produto, SKU, coleção ou precificação por volume.
- **Tarefas não são mandatórias por design** — o Clint usa cadências como recomendação, não como bloqueadores de avanço de stage. Tania pediu obrigatoriedade.

---

## 3. RD Station CRM — Análise Detalhada

### Posicionamento

RD Station CRM é desenvolvido pela TOTVS/RD Station (empresa brasileira), posicionado como "o CRM que organiza as vendas e conecta marketing com o time comercial". É um produto de uma suíte maior (RD Station Marketing + CRM), com proposta de funil ponta a ponta. Atende mais de 20.000 empresas, com segmentos-alvo em educação, saúde, varejo, serviços e e-commerce. Tem LYNN como camada de IA integrada.

### Planos e Preços (dados auditados ao vivo em 2026-05-24)

| Plano | Mensal | Anual/usuário | Usuários | Funis | Automações |
|---|---|---|---|---|---|
| Free | R$ 0 | R$ 0 | Até 4 | 1 | — |
| Basic | R$ 73/usuário | R$ 59,40/usuário | Ilimitado | Múltiplos | — |
| Pro | R$ 131/usuário | R$ 107,10/usuário | Mín. 4 | Múltiplos | Até 100 |
| Advanced | Sob consulta | Sob consulta | Mín. 4 | Múltiplos | Até 100 |

**Custo anual estimado para 3 usuários (referência Techmalhas):**
- Free: R$ 0 (mas limitadíssimo — 1 funil, 500MB, 50 rastreamentos)
- Basic: R$ 2.138/ano (3 × R$ 59,40 × 12)
- Pro: R$ 5.140/ano (mín. 4 usuários × R$ 107,10 × 12)

### Features Mapeadas

| Feature | Free | Basic | Pro | Advanced |
|---|---|---|---|---|
| Pipeline Kanban | ✅ | ✅ | ✅ | ✅ |
| Funis personalizados | 1 funil | Múltiplos | Múltiplos | Múltiplos |
| Etapas configuráveis (até 12) | Parcial | ✅ | ✅ | ✅ |
| Cadastro de leads | ✅ | ✅ | ✅ | ✅ |
| Campos customizados ilimitados | ❌ | ✅ | ✅ | ✅ |
| Histórico de interações | ✅ | ✅ | ✅ | ✅ |
| Tarefas e lembretes | ✅ | ✅ | ✅ | ✅ |
| WhatsApp (integração) | Web apenas | Web apenas | Web apenas | Com IA |
| WhatsApp API Oficial | ❌ | ❌ | ❌ | ❌ (BSP externo) |
| Dashboard indicadores | ✅ | ✅ | ✅ | ✅ |
| Relatórios avançados | ❌ | Parcial | ✅ | ✅ |
| Automações de vendas | ❌ | ❌ | ✅ (100) | ✅ (100+) |
| IA (LYNN) | ❌ | Parcial | ✅ | ✅ avançado |
| Integração RD Marketing | ✅ | ✅ | ✅ | ✅ |
| API/Webhooks | ❌ | ❌ | ❌ | ✅ |
| Gestão de equipe | ❌ | ✅ | ✅ | ✅ |
| Playbook de vendas com IA | ❌ | ✅ | ✅ | ✅ |
| Previsão de receita | ❌ | ❌ | Parcial | ✅ |
| Armazenamento | 500MB | não especificado | 10GB | 50GB |

### Forças

1. **Plano Free funcional** — 4 usuários gratuitos com pipeline e tarefas: referência de onboarding baixo atrito.
2. **Funis múltiplos e etapas configuráveis** — até 12 etapas por funil, múltiplos funis: arquitetura que suporta dualidade Atacado/Varejo.
3. **LYNN AI integrada** — sugestão de tarefas, priorização de leads e insights por linguagem natural.
4. **Integração marketing-vendas** — funil ponta a ponta quando usado com RD Station Marketing.
5. **Suporte em português, dados no Brasil** — adequado a LGPD.
6. **Campos customizados ilimitados** — permite modelar entidades específicas (coleção, canal, CNPJ do lojista).

### Fraquezas para o Caso Techmalhas

- **WhatsApp API Oficial ausente em todos os planos** — exige BSP externo (Twilio, Take, Zenvia), adicionando R$ 300–500/mês e complexidade operacional — um bloqueador direto para Amanda e Vitor.
- **Orientado a inbound e e-mail marketing** — o core do produto assume leads vindos de landing pages, não de atendimento ativo via WhatsApp.
- **Plano Basic sem automações** — Renato precisa de automações para atribuição de tarefas obrigatórias.
- **Sem conceito de produto/SKU/coleção** — CRM de relacionamento puro, sem granularidade comercial de indústria.
- **Tarefas não bloqueantes** — lembretes e sugestões, não obrigatoriedade estrutural.
- **Mínimo de 4 usuários no Pro** — para 3 usuários iniciais (Vitor + Amanda + Renato), o Basic é insuficiente e o Pro obriga a pagar por um assento não usado.

---

## 4. Pipedrive — Análise Detalhada

### Posicionamento

Pipedrive é um CRM global fundado na Estônia em 2010, com sede em Nova York. Posiciona-se como "o CRM criado por vendedores, para vendedores". É o benchmark do mercado em pipeline Kanban visual e gestão de deals. Em 2025, lançou o "Pulse" (kit de prospecção) e simplificou os planos de 5 para 4 tiers (Lite, Growth, Premium, Ultimate). Atende 100.000+ empresas em 179 países. No Brasil, é usado principalmente por inside sales B2B tech, consultorias e startups.

### Planos e Preços (dados auditados ao vivo em 2026-05-24)

Pipedrive cobra **em dólar americano** — o custo real em BRL varia com o câmbio (referência: USD 1 = BRL 5,70 em mai/2026).

| Plano | USD/usuário/mês (anual) | BRL estimado/usuário/mês | BRL/mês (3 usuários) |
|---|---|---|---|
| Lite | US$ 14 | R$ 80 | R$ 240 |
| Growth | US$ 24 | R$ 137 | R$ 411 |
| Premium | US$ 49 | R$ 279 | R$ 837 |
| Ultimate | US$ 69 | R$ 393 | R$ 1.179 |

**Custo anual estimado para 3 usuários (BRL):**
- Lite: R$ 2.880/ano
- Growth: R$ 4.932/ano
- Premium: R$ 10.044/ano
- Ultimate: R$ 14.148/ano

**Observação crítica:** com câmbio em alta, o custo em BRL pode variar até 30% entre contratos anuais. Não há precificação em reais.

### Features Mapeadas

| Feature | Lite | Growth | Premium | Ultimate |
|---|---|---|---|---|
| Pipeline Kanban visual (drag-and-drop) | ✅ | ✅ | ✅ | ✅ |
| Múltiplos pipelines | ✅ | ✅ | ✅ | ✅ |
| Cadastro de contatos/deals | ✅ | ✅ | ✅ | ✅ |
| Histórico de interações | ✅ | ✅ | ✅ | ✅ |
| Tarefas e atividades | ✅ | ✅ | ✅ | ✅ |
| Automação de workflows | ❌ | ✅ | ✅ | ✅ |
| Sincronização de e-mail (2 vias) | ❌ | ✅ | ✅ | ✅ |
| Rastreamento de e-mail | ❌ | ✅ | ✅ | ✅ |
| Relatórios e previsão de receita | Básico | ✅ | ✅ | ✅ |
| WhatsApp nativo | ❌ | ❌ | ❌ | ❌ |
| WhatsApp via integração terceira | Via marketplace | Via marketplace | Via marketplace | Via marketplace |
| Dashboard customizável | ❌ | ❌ | ✅ | ✅ |
| Pontuação de deals (lead scoring) | ❌ | ❌ | ✅ | ✅ |
| Geração de leads (LeadBooster) | Add-on | Add-on | ✅ | ✅ |
| Smart Documents (e-sign) | Add-on | Add-on | ✅ | ✅ |
| Gestão de projetos | ❌ | ❌ | ❌ | ✅ |
| App mobile | ✅ | ✅ | ✅ | ✅ |
| API e Webhooks | Limitada | ✅ | ✅ | ✅ |
| +400 integrações via marketplace | ✅ | ✅ | ✅ | ✅ |

### Forças

1. **Pipeline Kanban mais maduro do mercado** — drag-and-drop fluido, múltiplos pipelines independentes, visão por responsável e por etapa.
2. **Múltiplos pipelines nativos** — referência direta para a dualidade Atacado/Varejo: dois pipelines com etapas distintas, sem gambiarra.
3. **Relatórios e previsão de receita** — benchmarking do que Renato precisa ver no dashboard.
4. **+400 integrações via marketplace** — WhatsApp via TimelinesAI, Rasayel, WA.Expert; não é nativo mas funciona.
5. **API madura e webhooks** — modelo arquitetural para integração com Dapic em versões futuras.
6. **Gestão de atividades** — tarefas com prazo, responsável e tipo de atividade, referência de UX para o módulo de tasks da Techmalhas.

### Fraquezas para o Caso Techmalhas

- **Sem WhatsApp nativo** — integração via terceiros (TimelinesAI, Rasayel) adiciona custo (US$ 20–50/mês) e fragmenta a experiência de Amanda e Vitor.
- **Cobrança em dólar** — risco cambial real e não há suporte a cartão de crédito em BRL com parcelamento; impacta planejamento financeiro de PME.
- **Não orientado para vestuário/indústria** — sem campos de produto, coleção, grade ou precificação por volume.
- **Tarefas não obrigatórias estruturalmente** — atividades têm prazo e lembrete, mas o sistema não bloqueia avanço de stage por tarefa pendente.
- **Custo cambial imprevisível** — precificação em USD é incompatível com PME brasileira sem hedge cambial.
- **Suporte em inglês majoritariamente** — comunidade e documentação em PT-BR são limitadas.

---

## 5. Mapa Comparativo de Features

| # | Feature | Clint Digital | RD Station CRM | Pipedrive | Prioridade Techmalhas | MVP? |
|---|---|---|---|---|---|---|
| 1 | Pipeline Kanban visual | ✅ (Growth+) | ✅ (todos) | ✅ (todos) | 🔴 Crítico — Vitor precisa de visão de stage em tempo real | Sim |
| 2 | Múltiplos pipelines independentes | ❌ (1 pipeline) | ✅ (Basic+) | ✅ (todos) | 🔴 Crítico — dualidade Atacado/Varejo exige pipelines separados | Sim |
| 3 | Etapas de pipeline configuráveis | ✅ | ✅ (até 12) | ✅ | 🔴 Crítico — etapas de Atacado ≠ etapas de Varejo | Sim |
| 4 | Cadastro de leads e contatos | ✅ | ✅ | ✅ | 🔴 Crítico — base de todo CRM | Sim |
| 5 | Campos customizados (CNPJ, tipo canal, etc.) | Parcial | ✅ ilimitado | ✅ | 🔴 Crítico — CNPJ do lojista (José), `dapic_id` reservado | Sim |
| 6 | Histórico completo de interações | ✅ | ✅ | ✅ | 🔴 Crítico — Amanda precisa ver histórico antes de responder | Sim |
| 7 | WhatsApp API Oficial (Meta Cloud API) | ✅ (Growth+) | ❌ (BSP externo) | ❌ (3ª via) | 🔴 Crítico — canal principal de Vitor e Amanda | Sim |
| 8 | Tarefas obrigatórias (bloqueiam stage) | ❌ (cadência opcional) | ❌ (lembretes) | ❌ (lembretes) | 🔴 Crítico — Tania pediu explicitamente; accountability de Renato | Sim |
| 9 | Dashboard de indicadores | ✅ | ✅ | ✅ (Growth+) | 🔴 Crítico — Renato acompanha equipe | Sim |
| 10 | Tarefas com responsável e prazo | ✅ | ✅ | ✅ | 🔴 Crítico — obrigatoriedade de acompanhamento | Sim |
| 11 | Relatórios de performance por usuário | ✅ | ✅ (Pro+) | ✅ (Growth+) | 🔴 Crítico — Renato precisa ver Vitor vs Amanda | Sim |
| 12 | Automação de fluxos (atribuição de task) | ✅ | ✅ (Pro+) | ✅ (Growth+) | 🟡 Útil — automatizar tarefas ao mover deal de stage | v2 |
| 13 | Respostas rápidas / templates de WhatsApp | ✅ (Growth+) | ❌ | Via integração | 🟡 Útil — Amanda acelera atendimento | v2 |
| 14 | Distribuição automática de leads | ✅ (Growth+) | ❌ | Via automação | 🟡 Útil — quando a equipe crescer além de Vitor | v2 |
| 15 | Integração com ERP proprietário (Dapic) | ❌ | ❌ | Via API | 🔴 Crítico — campo `dapic_id` reservado no MVP | Sim (campo) |
| 16 | Gestão de coleções/sazonalidade de produtos | ❌ | ❌ | ❌ | 🔴 Crítico — Copa 2026, coleção Inverno: exclusivo Techmalhas | v2 |
| 17 | Precificação por volume (atacado vs varejo) | ❌ | ❌ | ❌ | 🔴 Crítico — tabela de preços diferenciada por canal | v2 |
| 18 | Identificação de lojista recorrente (José) | ❌ | ❌ | Parcial | 🔴 Crítico — José quer ser reconhecido em cada compra | Sim |
| 19 | Agentes IA conversacional (WhatsApp bot) | ✅ (Elite) | ✅ (Advanced) | ❌ | 🟢 Diferencial — fora do MVP v1 | Não |
| 20 | Campanhas em massa (SMS/E-mail) | ✅ | ✅ (Pro+) | Add-on | 🟢 Útil futuro — fora do MVP v1 | Não |
| 21 | App mobile nativo | ❌ | ✅ | ✅ | 🟡 Útil — Vitor em visitas presenciais a lojistas | v2 |
| 22 | Instagram Direct integrado | ✅ (Growth+) | ❌ | ❌ | 🟢 Funil v3 — fora do MVP | Não |
| 23 | Suporte em português | ✅ | ✅ | Limitado | 🟡 Operacional — time Techmalhas não é técnico | — |
| 24 | LGPD / dados em servidores BR | ✅ | ✅ | ❌ (global) | 🔴 Mandatório — campos pessoais marcados desde o ERD | Sim |
| 25 | Webhooks e API de saída | ✅ (Elite) | ✅ (Advanced) | ✅ (Growth+) | 🟡 Futuro — integração Dapic completa v3 | Não |

---

## 6. Gaps que Nenhum CRM Cobre Bem

Os itens abaixo representam necessidades específicas e estruturais da Techmalhas que **nenhum dos três CRMs oferece bem** — e que justificam a construção de solução própria:

### Gap 1 — Dualidade Atacado/Varejo Nativa
Nenhum dos três foi concebido para uma empresa que opera **simultaneamente** como fabricante B2B (vendas para lojistas como José, atendidos por Vitor) e varejista B2C (consumidores finais, atendidos por Amanda). Clint e RD Station têm um pipeline por negócio; Pipedrive tem múltiplos pipelines mas sem nenhuma lógica de "canal de venda" com regras de negócio diferentes (prazo de pagamento, volume mínimo, tabela de preço).

**O que o CRM Techmalhas precisa:** dois pipelines com etapas, tarefas obrigatórias e campos distintos — e um único cadastro de contato que pode estar em ambos os contextos.

### Gap 2 — Integração Dapic ERP
O Dapic é o ERP de gestão da produção, estoque e faturamento da Techmalhas. Nenhum dos três CRMs tem integração nativa ou parceria com a Dapic. A solução própria pode reservar o campo `dapic_id` desde o ERD (MVP) e implementar sincronização bidirecional no v3.

**O que o CRM Techmalhas precisa:** campo `dapic_id` indexado no modelo de dados desde o dia 1, com rota de integração mapeada para v3.

### Gap 3 — Gestão de Coleções Sazonais
A Techmalhas trabalha com coleções (Copa 2026, Inverno, Verão) e SKUs que têm ciclo de vida curto. Nenhum CRM analisado tem o conceito de "coleção" associada a deals ou contatos — o que impede análises como "Quais lojistas ainda não pediram a coleção Copa 2026?".

**O que o CRM Techmalhas precisa:** entidade `coleção` com status e associação a deals/produtos no catálogo.

### Gap 4 — Tabela de Preços por Canal (Atacado vs Varejo)
Os preços da Techmalhas são estruturalmente diferentes por canal: R$ 24–77 varejo / R$ 19–61 atacado, com variação por volume. Nenhum CRM tem lógica de "tabela de preço por canal" nativa — no máximo campos customizados manuais.

**O que o CRM Techmalhas precisa:** campo de canal obrigatório no deal, com tabela de referência de preços por produto/canal consultável no momento do orçamento.

### Gap 5 — Tarefas Verdadeiramente Obrigatórias (Hard Block)
Tania foi explícita: tarefas com `mandatory=true` devem **bloquear a movimentação de um deal para o próximo stage**. Nenhum dos três CRMs implementa isso estruturalmente — Clint e RD Station usam cadências como recomendação; Pipedrive usa lembretes de atividade. Todos permitem que o vendedor ignore a tarefa e mova o card.

**O que o CRM Techmalhas precisa:** lógica de guard no backend — `PATCH /deals/:id/stage` retorna 422 se houver `mandatory_activities` pendentes para o stage atual.

### Gap 6 — Reconhecimento do Lojista Recorrente (Persona José)
José é o cliente lojista que compra em atacado e quer ser reconhecido a cada compra ("Olá José, vi que você comprou conosco 3x neste ano"). Nenhum CRM tem uma visão de "cliente recorrente de atacado" com histórico de pedidos vinculado ao CRM sem integração de ERP.

**O que o CRM Techmalhas precisa:** card de cliente lojista com `recency`, `frequency` e `monetary value` (RFM simplificado) calculados a partir do histórico de deals fechados.

---

## 7. Análise Custo: Comprar vs Construir

### Premissas

- **Time de desenvolvimento:** 1 dev full-stack sênior (R$ 8.000/mês) + 1 dev frontend pleno (R$ 6.000/mês) = R$ 14.000/mês
- **Infraestrutura:** Vercel Pro (R$ 120/mês) + Supabase Pro (R$ 125/mês) + Meta Cloud API (R$ 0 fixo + custo por conversa ~R$ 0,05–0,15/msg) = ~R$ 300/mês infra
- **CRM Clint de referência:** plano Growth (R$ 9.600/ano) — mínimo funcional para o MVP exigido
- **Horizonte:** 3 anos (36 meses)
- **Custo de desenvolvimento estimado:** 4 meses de sprint para MVP (R$ 56.000) + 1 dev manutenção parcial pós-lançamento (R$ 3.000/mês)

### Tabela TCO — 3 Anos

| Item | Comprar (Clint Growth) | Construir Próprio |
|---|---|---|
| **Ano 1** | | |
| Licença/Assinatura | R$ 9.600 | — |
| BSP WhatsApp externo | — (incluído) | — (Meta Cloud API: pagar por conversa) |
| Desenvolvimento MVP | — | R$ 56.000 (4 meses × 2 devs) |
| Infraestrutura | — | R$ 3.600 (R$ 300/mês) |
| Manutenção (dev parcial) | — | R$ 24.000 (R$ 2.000/mês médio) |
| **Subtotal Ano 1** | **R$ 9.600** | **R$ 83.600** |
| **Ano 2** | | |
| Licença/Assinatura | R$ 9.600 | — |
| Infra + manutenção | — | R$ 27.600 (R$ 300 + R$ 2.000/mês) |
| Features v2 (automações, app mobile) | Incluído no plano | R$ 20.000 (2 meses dev) |
| **Subtotal Ano 2** | **R$ 9.600** | **R$ 47.600** |
| **Ano 3** | | |
| Licença/Assinatura | R$ 14.124 (estimando upgrade Elite) | — |
| Infra + manutenção | — | R$ 27.600 |
| Features v3 (integração Dapic, IA) | Não disponível | R$ 30.000 (3 meses dev) |
| **Subtotal Ano 3** | **R$ 14.124** | **R$ 57.600** |
| | | |
| **TCO Total 3 Anos** | **R$ 33.324** | **R$ 188.800** |
| **Valor gerado (diferenciais)** | Nenhum exclusivo | Dapic + coleções + obrigatoriedade + precificação por canal |
| **Lock-in** | Total — dados no Clint | Zero — dados próprios no Supabase |
| **Escalabilidade** | Limitada ao plano Elite | Ilimitada |
| **LGPD** | Dependente do Clint | Controle total |

### Análise de Break-Even

O custo de construção é maior no curto prazo (R$ 83.600 no Ano 1 vs R$ 9.600 do Clint). O break-even financeiro puro não acontece em 3 anos — a construção custa mais.

**A decisão de construir não se justifica pelo custo, mas pelos seguintes fatores estratégicos:**

1. **Adequação funcional** — os 6 gaps listados acima não são features opcionais; são requisitos do negócio que o Clint e os outros dois CRMs não entregam.
2. **Lock-in zero** — dados da Techmalhas ficam no Supabase próprio; migração futura não depende de export CSV.
3. **Integração Dapic futura** — o ERP da Techmalhas é o núcleo da operação. CRM próprio tem rota de integração direta; Clint exigiria API Elite (R$ 14.124/ano) + desenvolvimento de integrador customizado.
4. **Obrigatoriedade de tarefas** — requisito explícito de Tania; nenhum dos três CRMs entrega sem gambiarra.
5. **Dualidade de canais** — dois pipelines com regras de negócio distintas é diferencial competitivo.

**Recomendação financeira:** aceitar o custo maior de curto prazo (Ano 1) como investimento em ativo de software proprietário que se paga em geração de eficiência comercial, não em economia de licença.

---

## 8. Recomendação para o Squad

### O que copiar como inspiração

**Do Clint Digital:**
- UX de WhatsApp integrado ao pipeline — a conversa e o card do deal na mesma tela, sem abrir app externo
- Cadência de atividades como estrutura de referência para as `mandatory_activities` do MVP
- Plano de onboarding estruturado (mentorias, aceleração) — modelo para treinar Vitor, Amanda e Renato
- Integrações nativas com sistemas de gestão próprios (Hotmart/Kiwify) como referência de como a integração Dapic deve funcionar no v3

**Do RD Station CRM:**
- Múltiplos funis com etapas configuráveis (até 12 por funil) — arquitetura que deve ser adotada para suportar Atacado e Varejo como entidades independentes
- Campos customizados ilimitados — necessários para `dapic_id`, tipo de canal, segmento do lojista
- LYNN como referência de como IA de priorização deve ser integrada no v3

**Do Pipedrive:**
- Pipeline Kanban drag-and-drop com múltiplos pipelines — a referência de mercado em UX de pipeline; o frontend do CRM Techmalhas deve replicar a fluidez do Pipedrive
- Atividades com tipo (call, reunião, tarefa, e-mail) — estrutura de `activity_type` no modelo de dados
- Dashboard com previsão de receita por stage — referência do que Renato precisa ver

### O que evitar

- **Clonar o Clint integralmente** — o produto é construído para infoprodutores; adotar a lógica de "lançamento" e "cadência de lançamento" seria incompatível com o ritmo de atacado/varejo contínuo da Techmalhas
- **Pipeline único** — erro crítico; Atacado e Varejo têm etapas, tarefas obrigatórias e responsáveis diferentes desde o dia 1
- **WhatsApp via BSP externo** — adiciona custo e complexidade desnecessários; Meta Cloud API direta (já definida no stack) é a decisão correta
- **Features de IA no MVP** — agentes conversacionais, LYNN, scoring preditivo: todos são v3, não MVP

### O que inovar (diferenciais do CRM Techmalhas)

1. **Tarefas mandatórias como hard block** — `mandatory=true` bloqueia stage no backend; nenhum dos 3 CRMs entrega isso
2. **Campo `dapic_id` desde o ERD** — investimento de 30 minutos no schema que economiza 3 meses de migração no v3
3. **RFM simplificado para lojistas** — recency/frequency/monetary visível no card do José; diferencial de reconhecimento que o Clint e o RD Station não têm
4. **Gestão de coleções sazonais** — entidade `collection` associada a deals e produtos; Copa 2026 é o caso de uso imediato
5. **Dois pipelines com identidade visual distinta** — Atacado (azul institucional Techmalhas) e Varejo (tom diferente) para que Vitor e Amanda nunca confundam contextos

---

*Documento produzido por Patrícia Produto — Estrategista de Produto do Squad CRM Techmalhas*
*Auditoria realizada em 2026-05-24 com acesso ao vivo às URLs citadas*
