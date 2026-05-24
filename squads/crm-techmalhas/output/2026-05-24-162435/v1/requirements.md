# Requisitos e User Stories — MVP CRM Techmalhas

> **TL;DR:** O MVP entrega um CRM dual-canal (Atacado B2B + Varejo B2C) com pipeline Kanban visual, cadastro de contatos/leads, histórico de interações, integração WhatsApp Cloud API (Meta), tarefas obrigatórias com hard block, dashboard de KPIs e controle de acesso por papel (admin/gestor/vendedor). Tudo construído sobre Next.js 15 + Supabase + Prisma, hospedado na Vercel.
> **Total de stories:** 38 🔴 essenciais + 11 🟡 importantes + 5 🟢 nice-to-have
> **Esforço estimado MVP:** 4P + 18M + 13G + 3GG ≈ 18–22 semanas de desenvolvimento para 1 dev sênior full-stack (ou ~9–11 semanas com squad de 2 devs)

---

## 1. Personas

| Persona | Papel | Contexto | Dores Principais |
|---|---|---|---|
| **Vitor** | Vendedor de Atacado | Atende lojistas B2B via WhatsApp e visita feiras; usa celular o dia todo | Perder follow-up de lojista; não saber qual lead esfriou; planilhas bagunçadas sem histórico; não sabe quando tarefa vence |
| **Amanda** | Atendente de Varejo | Responde clientes no WhatsApp e Instagram; trabalha no computador no escritório | Troca 5 abas para checar pedido + histórico do cliente; sem contexto de quem está falando; mensagem cai no vácuo sem alerta |
| **Renato** | Gestor Comercial | Acompanha desempenho da equipe; fecha contratos grandes; precisa de visibilidade total | Não saber se equipe cumpriu tarefas críticas; pipeline virou caixa-preta; não consegue medir conversão real |
| **José** | Cliente Lojista (Atacado) | Compra em atacado mensalmente; contato recorrente com Vitor | Ser tratado como cliente novo a cada compra; ter que repetir dados do negócio; sem histórico de pedidos anteriores no atendimento |

---

## 2. Visão do MVP

**Dentro do MVP:** Pipeline Kanban dual (Atacado e Varejo como pipelines separados), cadastro e gestão de contatos/leads com distinção B2B/B2C, histórico completo de interações, integração WhatsApp Cloud API (Meta — webhook bidirecional + envio), tarefas com flag `mandatory=true` que bloqueia avanço de stage, dashboard com KPIs essenciais, autenticação via e-mail e Google OAuth, RBAC com três papéis (admin/gestor/vendedor), LGPD (consentimento + audit log), e configuração de pipelines/stages/tarefas-obrigatórias-por-stage.

**Fora do MVP v1:** Instagram DM, disparos em massa, agentes IA conversacionais, integração checkout/carrinho abandonado, app mobile nativo, multitenancy, integração Dapic completa (apenas campo `dapic_id` reservado no schema), respostas rápidas/templates salvos, distribuição automática de leads, relatórios avançados de RFM e coleções sazonais.

**Por quê esse escopo:** Cada feature dentro resolve uma dor nomeada das personas acima. O que está fora ou não tem persona-dor mapeada ou depende de integrações de terceiros (Dapic, Instagram Graph API) que aumentam o risco de entrega sem retorno proporcional no v1.

---

## 3. Épicos

| # | Épico | Stories 🔴 | Stories 🟡 | Stories 🟢 |
|---|---|---|---|---|
| A | Autenticação & Usuários | 4 | 1 | 0 |
| B | Pipeline & Deals | 7 | 2 | 1 |
| C | Contatos & Leads | 6 | 2 | 1 |
| D | Atividades & Tarefas Obrigatórias | 5 | 2 | 1 |
| E | WhatsApp Cloud API | 7 | 2 | 1 |
| F | Dashboard & Relatórios | 5 | 1 | 1 |
| G | Configurações do Sistema | 4 | 1 | 0 |
| **Total** | | **38** | **11** | **5** |

---

## 4. Backlog Priorizado

---

### Épico A: Autenticação & Usuários

---

#### US-001 — Login com e-mail e senha
**Como** Vitor, Amanda ou Renato,
**quero** fazer login com e-mail e senha,
**para** acessar o CRM de forma segura sem depender de SSO corporativo.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** nada (ponto de partida)
**Observações técnicas:** Supabase Auth com `signInWithPassword`. Senha deve seguir política mínima: 8 caracteres, 1 maiúscula, 1 número. Sessão JWT com refresh token. Rota `/login` pública, todo o resto protegido por middleware Next.js.

**Critérios de Aceitação:**

```
GIVEN que Vitor tem conta ativa no sistema
WHEN ele acessa /login e submete e-mail + senha válidos
THEN é redirecionado para /dashboard
AND o token de sessão é gravado em cookie httpOnly

GIVEN que Amanda digita senha incorreta 3 vezes
WHEN tenta o 4º login
THEN vê mensagem "Conta temporariamente bloqueada. Tente em 15 minutos."
AND o evento é registrado no audit_log com IP e timestamp
```

---

#### US-002 — Login com Google OAuth
**Como** Renato,
**quero** fazer login com minha conta Google,
**para** não precisar memorizar mais uma senha corporativa.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-001
**Observações técnicas:** Supabase Auth `signInWithOAuth({ provider: 'google' })`. Apenas e-mails do domínio `techmalhas.com.br` ou lista de e-mails aprovados devem conseguir criar conta via OAuth (validação pós-callback no server). Novos usuários via OAuth ficam com role `vendedor` até admin promover.

**Critérios de Aceitação:**

```
GIVEN que Renato clica em "Entrar com Google"
WHEN completa o fluxo OAuth com conta @techmalhas.com.br
THEN é redirecionado para /dashboard com sessão ativa
AND um registro é criado na tabela users com role=vendedor (se primeiro acesso)

GIVEN que alguém tenta logar com Gmail pessoal não autorizado
WHEN completa o fluxo OAuth
THEN vê mensagem de erro "E-mail não autorizado. Solicite acesso ao administrador."
AND nenhum registro é criado em users
```

---

#### US-003 — Controle de acesso por papel (RBAC)
**Como** Renato (gestor),
**quero** que o sistema aplique permissões por papel,
**para** que vendedores não alterem configurações de pipeline ou dados de outros usuários.

**Prioridade:** 🔴 Essencial
**Esforço:** G
**Depende de:** US-001, US-002
**Observações técnicas:** Três roles: `admin`, `gestor`, `vendedor`. Middleware Next.js valida role em cada rota protegida. API Routes retornam 403 se role insuficiente. Tabela de permissões: admin (tudo), gestor (ver tudo + editar deals de qualquer vendedor + relatórios), vendedor (ver/editar apenas seus próprios deals e contatos + inbox WhatsApp). Row Level Security (RLS) no Supabase como segunda camada.

**Critérios de Aceitação:**

```
GIVEN que Amanda tem role=vendedor
WHEN tenta acessar /configuracoes/pipelines
THEN recebe HTTP 403 na API e é redirecionada para /dashboard com toast "Acesso negado"

GIVEN que Renato tem role=gestor
WHEN acessa /relatorios/performance
THEN vê dados de todos os vendedores da equipe

GIVEN que Vitor tem role=vendedor
WHEN tenta editar um deal cujo owner_id é de outro vendedor via API
THEN recebe HTTP 403 e o dado não é alterado
```

---

#### US-004 — Gerenciamento de usuários pelo admin
**Como** admin do sistema,
**quero** criar, editar e desativar usuários,
**para** controlar quem tem acesso ao CRM da Techmalhas.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-003
**Observações técnicas:** Tela `/configuracoes/usuarios`. Campos: nome, e-mail, role, status (ativo/inativo). Desativar = `deleted_at` preenchido (soft delete), não apaga dados. Admin não pode desativar a si mesmo. Toda alteração de role gravada em `audit_logs`.

**Critérios de Aceitação:**

```
GIVEN que o admin está em /configuracoes/usuarios
WHEN cria um novo usuário preenchendo nome, e-mail e role=vendedor
THEN o usuário recebe e-mail de convite com link de definição de senha
AND aparece na listagem com status "Convite enviado"

GIVEN que o admin desativa Vitor
WHEN Vitor tenta fazer login
THEN recebe mensagem "Conta desativada. Contate o administrador."
AND os deals de Vitor permanecem no sistema com owner_id preservado
```

---

#### US-005 — Perfil de usuário e troca de senha
**Como** Vitor,
**quero** visualizar meu perfil e trocar minha senha,
**para** manter minha conta segura.

**Prioridade:** 🟡 Importante
**Esforço:** P
**Depende de:** US-001
**Observações técnicas:** Tela `/perfil`. Troca de senha via Supabase `updateUser`. Campo de nome editável. Upload de avatar opcional (Supabase Storage — bucket privado).

**Critérios de Aceitação:**

```
GIVEN que Vitor acessa /perfil
WHEN altera a senha informando senha atual + nova senha + confirmação
THEN a senha é atualizada e ele recebe toast "Senha alterada com sucesso"

GIVEN que a nova senha tem menos de 8 caracteres
WHEN Vitor submete o formulário
THEN vê erro inline "A senha deve ter no mínimo 8 caracteres"
AND a senha não é alterada
```

---

### Épico B: Pipeline & Deals

---

#### US-006 — Visualizar pipeline Kanban — Atacado
**Como** Vitor,
**quero** ver meus deals de atacado em um Kanban com colunas por stage,
**para** entender de forma visual onde cada lojista está no funil.

**Prioridade:** 🔴 Essencial
**Esforço:** G
**Depende de:** US-003
**Observações técnicas:** Pipeline `type=atacado`. Colunas = stages do pipeline. Cada card mostra: nome do deal, nome do contato/empresa, valor (R$), dias no stage atual, ícone de overdue se tarefa obrigatória vencida. Vitor vê apenas seus deals; Renato vê todos. Dados via API `/api/deals?pipeline_id=X`.

**Critérios de Aceitação:**

```
GIVEN que Vitor tem 5 deals ativos no pipeline de Atacado em stages diferentes
WHEN acessa /pipeline/atacado
THEN vê 5 cards distribuídos nas colunas correspondentes
AND cada card exibe nome, empresa, valor e dias no stage

GIVEN que um deal tem tarefa obrigatória vencida há 2 dias
WHEN Vitor visualiza o card no Kanban
THEN o card exibe ícone de alerta vermelho "Tarefa vencida"
```

---

#### US-007 — Visualizar pipeline Kanban — Varejo
**Como** Amanda,
**quero** ver os deals de varejo em um Kanban separado do atacado,
**para** trabalhar com etapas e lógica específicas do atendimento B2C.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-006
**Observações técnicas:** Pipeline `type=varejo`. Stages distintos do pipeline de Atacado (configurados em G). Mesma implementação de componente Kanban — parâmetro `pipeline_id` diferente. Amanda e Renato têm acesso; Vitor não precisa ver este pipeline por padrão (mas admin pode liberar).

**Critérios de Aceitação:**

```
GIVEN que Amanda acessa /pipeline/varejo
WHEN o pipeline carrega
THEN vê apenas deals do pipeline varejo (type=varejo), com stages configurados para B2C

GIVEN que um deal de varejo e um deal de atacado existem no sistema
WHEN Amanda visualiza /pipeline/varejo
THEN não vê o deal de atacado listado nesta view
```

---

#### US-008 — Criar novo deal
**Como** Vitor ou Amanda,
**quero** criar um novo deal vinculado a um contato e a um pipeline,
**para** registrar uma oportunidade real de venda no funil.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-006, US-007, US-019 (contato precisa existir ou ser criado inline)
**Observações técnicas:** Modal ou slide-over. Campos obrigatórios: título, contato (busca inline), pipeline (Atacado/Varejo), stage inicial, valor estimado, data prevista de fechamento, responsável (owner_id — padrão: usuário logado). Campo `dapic_id` oculto, reservado. Validação via Zod no servidor.

**Critérios de Aceitação:**

```
GIVEN que Vitor está no pipeline de Atacado
WHEN clica em "+ Novo Deal", preenche título "Pedido Inverno 2026 — Malhas João", seleciona contato José, valor R$ 3.200 e stage "Proposta Enviada"
THEN o card aparece na coluna "Proposta Enviada" do Kanban imediatamente
AND um registro é criado em deals com status=open e owner_id=Vitor

GIVEN que Amanda tenta criar deal sem informar contato
WHEN submete o formulário
THEN vê erro de validação "Contato é obrigatório"
AND nenhum deal é criado
```

---

#### US-009 — Mover deal entre stages (drag-and-drop)
**Como** Vitor ou Amanda,
**quero** arrastar um card de deal de uma coluna para outra,
**para** atualizar o stage de forma rápida e intuitiva.

**Prioridade:** 🔴 Essencial
**Esforço:** G
**Depende de:** US-006, US-007, US-011 (hard block de tarefa obrigatória)
**Observações técnicas:** Drag-and-drop com `@dnd-kit/core`. Ao soltar o card em novo stage, frontend dispara `PATCH /api/deals/:id` com `stage_id` novo. Se stage de destino tem tarefas obrigatórias pendentes no stage atual, o backend rejeita com 422 e exibe modal explicativo. Registra `audit_log` da movimentação.

**Critérios de Aceitação:**

```
GIVEN que o deal "Pedido Inverno — José" está em "Qualificação" sem tarefas pendentes
WHEN Vitor arrasta o card para "Proposta Enviada"
THEN o card move visualmente e a API confirma a atualização com HTTP 200
AND o campo stage_id do deal é atualizado no banco

GIVEN que o stage atual tem tarefa obrigatória não concluída
WHEN Vitor tenta arrastar o deal para o próximo stage
THEN o card retorna à posição original e aparece modal "Há tarefas obrigatórias pendentes: [lista]. Conclua-as antes de avançar."
AND nenhuma atualização é gravada no banco
```

---

#### US-010 — Visualizar e editar detalhe de um deal
**Como** Vitor,
**quero** abrir um deal e ver/editar todos seus dados em uma tela dedicada,
**para** ter contexto completo antes de entrar em contato com o lojista José.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-008
**Observações técnicas:** Rota `/deals/:id`. Layout em duas colunas: esquerda (dados do deal + formulário de edição inline), direita (timeline de interações + atividades). Edição inline com auto-save (debounce 800ms) ou botão "Salvar". Histórico de mudanças visível abaixo dos dados.

**Critérios de Aceitação:**

```
GIVEN que Vitor abre o deal "Pedido Inverno 2026 — José"
WHEN a tela carrega
THEN vê valor, stage atual, data prevista de fechamento, responsável, e lista de atividades/interações do deal

GIVEN que Vitor altera o valor de R$ 3.200 para R$ 4.100 e clica em "Salvar"
WHEN a API processa a atualização
THEN o campo exibe R$ 4.100 e um entry é adicionado no audit_log com valor anterior e novo
```

---

#### US-011 — Fechar deal como "Ganho" ou "Perdido"
**Como** Vitor,
**quero** marcar um deal como ganho ou perdido,
**para** registrar o resultado do ciclo de vendas e liberar o funil.

**Prioridade:** 🔴 Essencial
**Esforço:** P
**Depende de:** US-010
**Observações técnicas:** Botões "Marcar como Ganho" e "Marcar como Perdido" na tela de detalhe. "Perdido" exige motivo obrigatório (select: preço, concorrência, sem interesse, sem resposta, outro). Ao fechar, `deals.status` = `won` ou `lost` e `deals.closed_at` = now(). Card some do Kanban ativo.

**Critérios de Aceitação:**

```
GIVEN que Vitor está no detalhe de um deal aberto
WHEN clica em "Marcar como Ganho" e confirma
THEN deals.status=won, deals.closed_at=now(), o card desaparece do Kanban
AND Amanda (se for varejo) ou Renato recebem notificação no sistema

GIVEN que Vitor clica em "Marcar como Perdido"
WHEN o modal aparece e ele tenta confirmar sem selecionar motivo
THEN vê erro "Informe o motivo da perda"
AND o deal não é alterado
```

---

#### US-012 — Filtrar e buscar deals no pipeline
**Como** Renato,
**quero** filtrar deals por responsável, stage, valor e período,
**para** identificar gargalos no funil sem precisar de relatório externo.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-006, US-007
**Observações técnicas:** Filtros acima do Kanban: owner_id (multi-select), stage (multi-select), valor (min/max), expected_close_at (período). Query params na URL para compartilhamento. Filtro aplicado via API com query params — não filtrar apenas no front.

**Critérios de Aceitação:**

```
GIVEN que Renato está no pipeline de Atacado com 20 deals
WHEN aplica filtro "Responsável: Vitor" + "Stage: Proposta Enviada"
THEN vê apenas os deals do Vitor em Proposta Enviada
AND a URL reflete os filtros ativos (?owner=X&stage=Y)

GIVEN que Renato remove todos os filtros
WHEN clica em "Limpar filtros"
THEN todos os deals ativos reaparecem no Kanban
```

---

#### US-013 — Histórico de movimentação do deal
**Como** Renato,
**quero** ver o log de todas as mudanças de stage de um deal,
**para** entender a velocidade do ciclo de vendas e identificar onde deals empacam.

**Prioridade:** 🟡 Importante
**Esforço:** P
**Depende de:** US-009, US-010
**Observações técnicas:** Timeline dentro da tela de detalhe do deal. Fonte: `audit_logs` filtrado por `resource_type=deal` e `resource_id=:id`. Exibir: ação, de/para, quem fez, quando.

**Critérios de Aceitação:**

```
GIVEN que um deal passou pelos stages Novo > Qualificação > Proposta Enviada
WHEN Renato abre o detalhe do deal
THEN vê 3 entradas na timeline com data/hora, stage anterior, stage novo e usuário responsável
```

---

#### US-014 — Visualizar deals perdidos e ganhos (histórico fechado)
**Como** Renato,
**quero** visualizar deals fechados (ganhos e perdidos) com filtros de período,
**para** analisar a taxa de conversão e os motivos de perda.

**Prioridade:** 🟡 Importante
**Esforço:** M
**Depende de:** US-011
**Observações técnicas:** Aba ou rota `/deals/fechados`. Filtros: pipeline, período, status (won/lost), motivo de perda. Exibe tabela com colunas: deal, contato, responsável, valor, data fechamento, status, motivo (se perdido).

**Critérios de Aceitação:**

```
GIVEN que há 10 deals fechados em maio/2026
WHEN Renato acessa /deals/fechados com filtro "Maio 2026"
THEN vê os 10 deals com status won ou lost, valores e motivos de perda exibidos

GIVEN que Renato filtra apenas "Perdidos" com motivo "Preço"
WHEN o filtro é aplicado
THEN vê apenas deals com status=lost e motivo=preço
```

---

#### US-015 — Vista de lista de deals (alternativa ao Kanban)
**Como** Renato,
**quero** ver deals em formato de tabela/lista,
**para** exportar ou copiar dados rapidamente sem arrastar cards.

**Prioridade:** 🟢 Nice-to-have
**Esforço:** M
**Depende de:** US-006, US-007
**Observações técnicas:** Toggle entre Kanban e Lista na mesma rota. Tabela com ordenação por coluna. Sem exportação CSV no MVP (backlog v2).

**Critérios de Aceitação:**

```
GIVEN que Renato está no pipeline de Atacado
WHEN clica no ícone de lista
THEN vê os deals em formato tabular com colunas: título, contato, stage, valor, responsável, data prevista
```

---

### Épico C: Contatos & Leads

---

#### US-016 — Listar e buscar contatos
**Como** Amanda,
**quero** buscar contatos por nome, telefone ou empresa,
**para** encontrar o histórico de um cliente rapidamente no meio de um atendimento.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-003
**Observações técnicas:** Rota `/contatos`. Busca full-text via `ilike` no Supabase (nome, phone, company_name). Filtro por type (lead/customer/lost) e por responsável. Paginação: 25 por página. Exibição em tabela com colunas: nome, empresa, tipo, responsável, último contato (data da última interação).

**Critérios de Aceitação:**

```
GIVEN que Amanda está em /contatos
WHEN digita "José" no campo de busca
THEN vê todos os contatos cujo nome ou empresa contém "José" em tempo real (debounce 300ms)

GIVEN que Amanda filtra por type=customer
WHEN o filtro é aplicado
THEN vê apenas contatos que já são clientes ativos, excluindo leads e perdidos
```

---

#### US-017 — Criar novo contato / lead
**Como** Vitor,
**quero** cadastrar um novo contato/lead diretamente no CRM,
**para** não perder informações de lojistas que conheceu em uma feira.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-016
**Observações técnicas:** Modal ou tela `/contatos/novo`. Campos: nome (obrigatório), telefone (obrigatório — formato +55XXXXXXXXXXX), e-mail, empresa, tipo de contato (B2B Atacado / B2C Varejo — mapeia para `pipeline_id` sugerido), fonte (WhatsApp/Feira/Indicação/Instagram/Outros), responsável (owner_id), campo `dapic_id` oculto (reservado). Validação de telefone duplicado: alerta, não bloqueio. LGPD: checkbox de consentimento obrigatório para criação.

**Critérios de Aceitação:**

```
GIVEN que Vitor preenche nome "Malhas do Norte — Carlos", telefone "+5516999990001", tipo B2B, fonte Feira
WHEN submete o formulário com checkbox LGPD marcado
THEN contato é criado com consent_lgpd=true, consent_at=now()
AND Vitor é redirecionado para a tela de detalhe do novo contato

GIVEN que Vitor tenta criar um contato sem marcar o checkbox de consentimento LGPD
WHEN clica em "Salvar"
THEN vê erro "Consentimento LGPD é obrigatório para cadastrar contato"
AND nenhum registro é criado
```

---

#### US-018 — Visualizar detalhe do contato
**Como** Amanda,
**quero** abrir a ficha completa de um cliente e ver todo o histórico,
**para** ter contexto antes de responder uma mensagem no WhatsApp.

**Prioridade:** 🔴 Essencial
**Esforço:** G
**Depende de:** US-017
**Observações técnicas:** Rota `/contatos/:id`. Layout: header (dados do contato + ações rápidas), tabs: "Deals" (lista de deals do contato), "Interações" (timeline WhatsApp, notas, chamadas), "Atividades" (tarefas pendentes e concluídas). Botão "Enviar WhatsApp" abre compose inline. Exibe badge "Cliente Recorrente" se contato tem 2+ deals ganhos (simplificado de RFM para José).

**Critérios de Aceitação:**

```
GIVEN que Amanda abre a ficha de José (cliente lojista recorrente com 3 pedidos anteriores)
WHEN a tela carrega
THEN vê badge "Cliente Recorrente", histórico das 3 compras anteriores na aba Deals, e últimas mensagens WhatsApp na aba Interações

GIVEN que Amanda acessa a aba "Atividades" de um contato
WHEN há 2 tarefas pendentes para aquele contato
THEN vê ambas listadas com título, prazo e status de vencimento
```

---

#### US-019 — Editar dados do contato
**Como** Vitor,
**quero** editar os dados de um contato existente,
**para** manter as informações do lojista atualizadas após uma conversa.

**Prioridade:** 🔴 Essencial
**Esforço:** P
**Depende de:** US-018
**Observações técnicas:** Edição inline na tela de detalhe (campos clicáveis). Campos editáveis: nome, telefone, e-mail, empresa, source, owner_id (apenas gestor/admin). Alteração de telefone registra no audit_log (dado sensível LGPD). Soft delete: campo `deleted_at` — contato "excluído" some das listagens mas dados são preservados.

**Critérios de Aceitação:**

```
GIVEN que Vitor abre o contato de José e clica no campo de e-mail
WHEN altera o e-mail e clica em "Salvar"
THEN o e-mail é atualizado na tela e no banco
AND a alteração é registrada no audit_log com valor anterior e novo

GIVEN que um gestor tenta excluir um contato que tem deals ativos
WHEN confirma a exclusão
THEN recebe alerta "Este contato possui deals ativos. Feche ou transfira os deals antes de excluir."
AND deleted_at permanece null
```

---

#### US-020 — Consentimento LGPD e direito ao esquecimento
**Como** admin ou gestor,
**quero** registrar o consentimento LGPD de cada contato e executar o direito ao esquecimento quando solicitado,
**para** cumprir a Lei 13.709/2018 e evitar sanções à Techmalhas.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-017, US-004
**Observações técnicas:** `consent_lgpd` (boolean) + `consent_at` (timestamp) gravados na criação. Direito ao esquecimento = endpoint `DELETE /api/contacts/:id/lgpd` que anonimiza: nome → "Contato Removido", phone → null, email → null, company_name → null. Mantém deals e interações com contact_id para integridade referencial, mas dado pessoal apagado. Ação registrada em audit_log com tipo `LGPD_ERASURE`. Apenas admin pode executar.

**Critérios de Aceitação:**

```
GIVEN que um cliente solicita remoção de seus dados (Art. 18 LGPD)
WHEN o admin executa o direito ao esquecimento na ficha do contato
THEN nome, telefone, e-mail e empresa são anonimizados no banco
AND audit_log registra ação LGPD_ERASURE com user_id do admin e timestamp

GIVEN que o admin tenta executar erasure em contato que ainda tem deal aberto
WHEN tenta confirmar a ação
THEN vê aviso "Este contato tem deal(s) aberto(s). Feche os deals antes de executar o apagamento."
AND a ação não é executada
```

---

#### US-021 — Importar contatos via CSV
**Como** Renato,
**quero** importar uma lista de contatos de um arquivo CSV,
**para** migrar a base atual de lojistas do WhatsApp/planilhas para o CRM na implantação inicial.

**Prioridade:** 🟡 Importante
**Esforço:** G
**Depende de:** US-017
**Observações técnicas:** Upload de CSV com colunas mapeáveis (nome, telefone, empresa, e-mail, tipo). Preview das primeiras 5 linhas antes de confirmar. Validação de duplicatas por telefone — exibe lista de conflitos para usuário decidir (ignorar ou atualizar). Máximo 500 registros por importação no MVP. LGPD: consentimento em lote marcado como `consent_lgpd=true` pelo importador (Renato assume responsabilidade via checkbox de confirmação).

**Critérios de Aceitação:**

```
GIVEN que Renato faz upload de CSV com 200 contatos
WHEN o sistema valida o arquivo
THEN exibe preview de 5 linhas + contagem de "200 contatos encontrados, 3 possíveis duplicatas"
AND aguarda confirmação antes de importar

GIVEN que Renato confirma a importação
WHEN o processamento termina
THEN todos os 200 contatos são criados com consent_lgpd=true
AND Renato recebe feedback "200 contatos importados com sucesso. 3 duplicatas ignoradas."
```

---

#### US-022 — Transferir contato/deal para outro responsável
**Como** Renato,
**quero** transferir um contato ou deal de um vendedor para outro,
**para** redistribuir carga quando Vitor está de férias ou um vendedor sai da empresa.

**Prioridade:** 🟡 Importante
**Esforço:** P
**Depende de:** US-019, US-004
**Observações técnicas:** Campo `owner_id` editável apenas por gestor/admin. Transferência em lote: selecionar N contatos/deals e reatribuir de uma vez.

**Critérios de Aceitação:**

```
GIVEN que Renato seleciona 5 deals de Vitor e escolhe transferir para outro vendedor
WHEN confirma a transferência
THEN owner_id dos 5 deals é atualizado
AND audit_log registra cada transferência com vendedor anterior e novo
```

---

#### US-023 — Segmentar contatos por tipo (Atacado x Varejo)
**Como** Renato,
**quero** filtrar a lista de contatos por tipo (B2B/B2C) e pipeline associado,
**para** entender o mix da base e planejar ações segmentadas.

**Prioridade:** 🟢 Nice-to-have
**Esforço:** P
**Depende de:** US-016
**Observações técnicas:** Filtro já previsto na US-016 (type). Esta story é sobre adicionar filtro por pipeline_id associado e exibir contagem por segmento no topo da lista.

**Critérios de Aceitação:**

```
GIVEN que Renato está em /contatos
WHEN seleciona filtro "Atacado"
THEN vê apenas contatos vinculados a deals no pipeline de Atacado, com contagem "47 contatos Atacado"
```

---

### Épico D: Atividades & Tarefas Obrigatórias

---

#### US-024 — Criar atividade/tarefa em um deal ou contato
**Como** Vitor,
**quero** criar uma tarefa com prazo em um deal,
**para** não esquecer de ligar para José na sexta-feira.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-010, US-018
**Observações técnicas:** Modal de criação. Campos: tipo (call/whatsapp/meeting/email/task), título, data/hora de vencimento, responsável (assignee_id — pode diferir do owner do deal), notas. Campo `mandatory` é false por padrão (apenas admin/gestor pode criar tarefa mandatória manualmente; tarefas mandatórias de stage são criadas automaticamente — US-026). Vinculado a deal_id e/ou contact_id.

**Critérios de Aceitação:**

```
GIVEN que Vitor está no detalhe do deal "Pedido Inverno — José"
WHEN cria tarefa tipo "call", título "Ligar pra fechar tabela de preços", due_at = amanhã 10h
THEN a tarefa aparece na aba Atividades do deal com status "Pendente"
AND Amanda (se assignee) recebe notificação no sistema

GIVEN que Vitor tenta criar tarefa sem informar data de vencimento
WHEN submete o formulário
THEN vê erro "Data de vencimento é obrigatória"
AND a tarefa não é criada
```

---

#### US-025 — Marcar tarefa como concluída
**Como** Vitor,
**quero** marcar uma tarefa como concluída com um clique,
**para** registrar que fiz o follow-up e limpar minha lista de pendências.

**Prioridade:** 🔴 Essencial
**Esforço:** P
**Depende de:** US-024
**Observações técnicas:** Checkbox na linha da tarefa. `PATCH /api/activities/:id` com `completed_at=now()`. Se a tarefa era a última `mandatory=true` pendente do stage atual, o sistema verifica e — se não houver mais bloqueios — notifica Vitor que o deal pode avançar.

**Critérios de Aceitação:**

```
GIVEN que Vitor vê a tarefa "Ligar pra fechar tabela de preços" como pendente
WHEN clica no checkbox
THEN a tarefa exibe status "Concluída" com data/hora
AND se era a última tarefa obrigatória do stage, vê toast "Todas as tarefas obrigatórias concluídas. Você pode avançar o deal."

GIVEN que Amanda desmarca uma tarefa já concluída por engano
WHEN clica novamente no checkbox
THEN a tarefa volta para status "Pendente" e completed_at é nulo
```

---

#### US-026 — Tarefas obrigatórias por stage com hard block
**Como** Renato,
**quero** configurar tarefas obrigatórias para cada stage do pipeline,
**para** garantir que Vitor não avance um deal sem enviar a proposta formal.

**Prioridade:** 🔴 Essencial
**Esforço:** G
**Depende de:** US-009, US-024, US-039 (configuração de stages)
**Observações técnicas:** Tabela `stage_required_tasks`: ao mover deal para um stage com tarefas obrigatórias configuradas, o sistema cria automaticamente as atividades com `mandatory=true` no deal. Hard block no backend: `POST /api/deals/:id/stage` retorna HTTP 422 se houver `activities` com `mandatory=true` e `completed_at=null` no stage atual. Hard block também no frontend (drag-and-drop — US-009). Não é possível bypassar via API sem role admin.

**Critérios de Aceitação:**

```
GIVEN que o stage "Proposta Enviada" tem tarefa obrigatória "Enviar proposta por e-mail"
WHEN Vitor move deal para "Proposta Enviada"
THEN a tarefa "Enviar proposta por e-mail" é criada automaticamente no deal com mandatory=true e due_at = now() + default_due_hours do stage

GIVEN que a tarefa obrigatória está pendente e Vitor tenta mover o deal para "Negociação"
WHEN arrasta o card ou usa a API
THEN recebe erro "Conclua as tarefas obrigatórias antes de avançar: Enviar proposta por e-mail"
AND o deal permanece em "Proposta Enviada"

GIVEN que Vitor conclui a tarefa obrigatória
WHEN tenta mover o deal novamente
THEN a movimentação é permitida e o card vai para "Negociação"
```

---

#### US-027 — Alertas de tarefas vencidas
**Como** Vitor,
**quero** receber alertas quando minhas tarefas estiverem vencidas,
**para** não deixar um follow-up com José passar em branco.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-024, US-025
**Observações técnicas:** Job de background (Vercel Cron ou Supabase Edge Function) rodando a cada hora: busca `activities` com `due_at < now()` e `completed_at = null`. Cria `notifications` para o `assignee_id`. Badge de contador na navbar. Central de notificações em `/notificacoes`. Cards de deal com tarefas vencidas exibem ícone de alerta vermelho no Kanban.

**Critérios de Aceitação:**

```
GIVEN que Vitor tem tarefa com due_at = ontem 10h e completed_at = null
WHEN o job de verificação roda
THEN uma notificação é criada em notifications para Vitor com tipo "task_overdue"
AND o badge na navbar incrementa (+1)
AND o card do deal no Kanban exibe ícone de alerta vermelho

GIVEN que Vitor marca a tarefa vencida como concluída
WHEN atualiza a página
THEN o ícone de alerta some do card e o badge decrementa
```

---

#### US-028 — Agenda de tarefas do dia (visão pessoal)
**Como** Vitor,
**quero** ver todas as minhas tarefas do dia em uma visão consolidada,
**para** planejar minha agenda de trabalho sem abrir deal por deal.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-024
**Observações técnicas:** Seção em `/dashboard` ou rota `/agenda`. Lista de atividades com `assignee_id = usuário_logado` e `due_at` = hoje ± amanhã, ordenadas por due_at. Agrupadas por: Atrasadas / Hoje / Amanhã. Cada item clicável abre o deal ou contato associado.

**Critérios de Aceitação:**

```
GIVEN que é 24/05/2026 e Vitor tem 3 tarefas: 1 atrasada, 1 para hoje, 1 para amanhã
WHEN acessa o dashboard
THEN vê as 3 tarefas agrupadas em "Atrasadas (1)", "Hoje (1)", "Amanhã (1)"
AND clicar em qualquer tarefa abre o deal correspondente

GIVEN que não há tarefas para o dia
WHEN Vitor acessa o dashboard
THEN vê mensagem "Nenhuma tarefa para hoje. Bom trabalho!"
```

---

#### US-029 — Visão de tarefas da equipe (gestor)
**Como** Renato,
**quero** ver todas as tarefas pendentes da equipe filtradas por responsável,
**para** identificar quem está sobrecarregado ou negligenciando follow-ups.

**Prioridade:** 🟡 Importante
**Esforço:** M
**Depende de:** US-028, US-003
**Observações técnicas:** Rota `/tarefas` visível apenas para gestor/admin. Tabela com colunas: tarefa, deal, responsável, tipo, prazo, status. Filtros: responsável, tipo, status (pendente/vencida/concluída), período.

**Critérios de Aceitação:**

```
GIVEN que Renato está em /tarefas
WHEN filtra por "Responsável: Vitor" + "Status: Vencida"
THEN vê todas as tarefas vencidas de Vitor com deals associados
AND pode ver se são obrigatórias (ícone de cadeado)
```

---

#### US-030 — Comentários/notas em atividades
**Como** Amanda,
**quero** adicionar notas textuais em uma atividade concluída,
**para** registrar o que foi conversado e deixar contexto para o próximo atendimento.

**Prioridade:** 🟡 Importante
**Esforço:** P
**Depende de:** US-025
**Observações técnicas:** Campo de texto livre na tarefa/atividade. Salvo como `interactions` com `type=note` e `channel=note`. Visível na timeline do deal e do contato.

**Critérios de Aceitação:**

```
GIVEN que Amanda conclui a tarefa "Ligar para cliente"
WHEN adiciona nota "Cliente confirmou interesse no modelo Polo Piquet. Aguarda tabela de preços."
THEN a nota aparece na timeline do deal e do contato com data/hora e nome de Amanda
```

---

#### US-031 — Templates de tarefas por tipo de deal
**Como** Renato,
**quero** configurar quais tarefas obrigatórias são criadas automaticamente ao criar um deal de atacado,
**para** padronizar o processo de onboarding de novos lojistas.

**Prioridade:** 🟢 Nice-to-have
**Esforço:** M
**Depende de:** US-026, US-039
**Observações técnicas:** Extensão de `stage_required_tasks` com campo `pipeline_id` para templates por pipeline. Backlog v2 se o time decidir que US-026 já resolve suficientemente.

**Critérios de Aceitação:**

```
GIVEN que o pipeline de Atacado tem template de tarefas no stage "Novo Lead"
WHEN Vitor cria um deal de atacado
THEN as tarefas do template são criadas automaticamente no deal com mandatory=true
```

---

### Épico E: WhatsApp Cloud API

---

#### US-032 — Configurar webhook WhatsApp Cloud API
**Como** admin,
**quero** configurar o webhook da Meta Cloud API no sistema,
**para** receber mensagens WhatsApp em tempo real no CRM.

**Prioridade:** 🔴 Essencial
**Esforço:** G
**Depende de:** US-003
**Observações técnicas:** Endpoint público `POST /api/webhooks/whatsapp` com verificação de `X-Hub-Signature-256`. Validação do `hub.challenge` para setup inicial. Secrets armazenados em variáveis de ambiente (não em banco). Processa payloads: `messages`, `statuses` (sent/delivered/read). Registra em `whatsapp_messages` e `interactions`. Documentação Meta: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks.

**Critérios de Aceitação:**

```
GIVEN que o admin configura o webhook URL no Meta Business Manager
WHEN a Meta envia o GET de verificação com hub.challenge
THEN o sistema retorna o hub.challenge e o webhook é verificado com sucesso

GIVEN que José envia uma mensagem WhatsApp para o número Techmalhas
WHEN o webhook recebe o payload
THEN uma entrada é criada em interactions com direction=in, channel=whatsapp, body=texto da mensagem
AND meta_message_id é salvo em whatsapp_messages para deduplicação
```

---

#### US-033 — Inbox de mensagens WhatsApp
**Como** Amanda,
**quero** ver todas as conversas WhatsApp em um inbox centralizado,
**para** não precisar ficar trocando de aba entre o celular e o CRM.

**Prioridade:** 🔴 Essencial
**Esforço:** GG
**Depende de:** US-032
**Observações técnicas:** Rota `/inbox`. Lista de conversas à esquerda (ordenadas por última mensagem), painel de chat à direita. Cada conversa = um contato (identificado pelo número de telefone). Mensagens não vinculadas a contato existente exibem botão "Criar contato". Badge de não-lidas na navbar. Atualização em tempo real via Supabase Realtime (channel `whatsapp_messages`). Vendedor vê apenas conversas dos seus contatos; gestor/admin vê todas.

**Critérios de Aceitação:**

```
GIVEN que José envia mensagem "Oi, quero ver o catálogo de inverno"
WHEN Amanda abre /inbox
THEN vê a conversa de José no topo da lista com preview da mensagem e timestamp
AND o badge de não-lidas na navbar mostra (+1)

GIVEN que chega mensagem de número desconhecido (+5516988887777)
WHEN Amanda abre a conversa
THEN vê botão "Vincular a contato existente" ou "Criar novo contato"
AND pode responder mesmo antes de vincular

GIVEN que Amanda tem role=vendedor e Vitor tem seus próprios contatos
WHEN Amanda abre /inbox
THEN vê apenas conversas vinculadas a contatos cujo owner_id = Amanda
```

---

#### US-034 — Enviar mensagem WhatsApp pelo CRM
**Como** Amanda,
**quero** enviar mensagens WhatsApp diretamente do CRM,
**para** responder clientes sem sair do sistema e manter o histórico centralizado.

**Prioridade:** 🔴 Essencial
**Esforço:** G
**Depende de:** US-033
**Observações técnicas:** `POST /api/whatsapp/send` que chama `https://graph.facebook.com/v19.0/{phone_number_id}/messages` com `Authorization: Bearer {WHATSAPP_TOKEN}`. Apenas tipo `text` no MVP (templates no v2). Janela de 24h da Meta: se última mensagem do cliente > 24h, bloqueia envio com mensagem explicativa (templates pre-aprovados seriam necessários — out of scope MVP). Salva response com `meta_message_id` em `whatsapp_messages`.

**Critérios de Aceitação:**

```
GIVEN que Amanda está no inbox da conversa de José (última mensagem < 24h)
WHEN digita "Olá José! Segue nosso catálogo de inverno 2026." e clica em Enviar
THEN a mensagem aparece no chat com status "Enviada"
AND uma entrada é criada em interactions com direction=out, channel=whatsapp

GIVEN que a última mensagem de José tem mais de 24 horas
WHEN Amanda tenta enviar mensagem livre
THEN vê aviso "Janela de 24h expirada. Não é possível enviar mensagem livre. Templates pré-aprovados serão disponibilizados em breve."
AND o botão Enviar fica desabilitado
```

---

#### US-035 — Vincular conversa WhatsApp a um deal
**Como** Amanda,
**quero** vincular uma conversa WhatsApp a um deal específico,
**para** que as mensagens apareçam no histórico do deal e Renato possa acompanhar.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-033, US-034
**Observações técnicas:** Dropdown no painel da conversa: "Vincular a Deal" — busca deals do contato associado. Ao vincular, `interactions.deal_id` é preenchido. As mensagens passam a aparecer na aba Interações do deal. Desvinculação possível (deal_id = null).

**Critérios de Aceitação:**

```
GIVEN que Amanda está na conversa de José no inbox
WHEN clica em "Vincular a Deal" e seleciona "Pedido Inverno 2026 — José"
THEN as mensagens da conversa aparecem na aba Interações do deal
AND Renato pode ver o histórico da conversa ao abrir o deal

GIVEN que Amanda desvincula a conversa do deal
WHEN confirma a desvinculação
THEN interactions.deal_id = null e as mensagens saem da aba do deal (mas permanecem no inbox e no histórico do contato)
```

---

#### US-036 — Status de entrega das mensagens (sent/delivered/read)
**Como** Amanda,
**quero** ver se minha mensagem foi entregue e lida pelo cliente,
**para** saber se preciso tentar outro canal de contato.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-034, US-032
**Observações técnicas:** Webhook `statuses` da Meta atualiza `whatsapp_messages.status` (sent → delivered → read). Ícones no chat: ✓ enviado, ✓✓ entregue, ✓✓ azul = lido (padrão WhatsApp). Atualização via Supabase Realtime.

**Critérios de Aceitação:**

```
GIVEN que Amanda enviou mensagem para José
WHEN o webhook recebe status "delivered" da Meta
THEN o ícone da mensagem muda de ✓ para ✓✓ em tempo real no chat de Amanda

GIVEN que José abre e lê a mensagem
WHEN o webhook recebe status "read"
THEN o ícone muda para ✓✓ azul
```

---

#### US-037 — Notificação de nova mensagem WhatsApp
**Como** Amanda,
**quero** receber notificação quando chega nova mensagem WhatsApp,
**para** não deixar cliente esperando resposta.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-033, US-032
**Observações técnicas:** Webhook cria `notifications` para o owner do contato (ou para todos os vendedores se contato sem dono). Badge na navbar atualizado via Supabase Realtime. Toast de notificação no browser com preview do texto. Opcional (v2): notificação push browser via Web Push API.

**Critérios de Aceitação:**

```
GIVEN que Amanda está logada no CRM e José envia mensagem
WHEN o webhook processa a mensagem
THEN Amanda vê toast "Nova mensagem de José: 'Oi, quero ver o catálogo...'"
AND o badge de não-lidas incrementa (+1)

GIVEN que Amanda abre a conversa de José
WHEN lê as mensagens
THEN o badge decrementa e as mensagens são marcadas como lidas no sistema
```

---

#### US-038 — Histórico completo de conversa WhatsApp no contato/deal
**Como** Renato,
**quero** ver o histórico completo de mensagens WhatsApp de um lojista no CRM,
**para** revisar o que foi prometido antes de assinar um contrato grande.

**Prioridade:** 🟡 Importante
**Esforço:** M
**Depende de:** US-035
**Observações técnicas:** Aba "Interações" na tela do contato e do deal. Mensagens WhatsApp exibidas em formato de chat (bolhas), intercaladas com notas, chamadas e e-mails na timeline. Ordenadas cronologicamente. Paginação: carrega últimas 50 interações, "Ver mais" carrega anteriores.

**Critérios de Aceitação:**

```
GIVEN que Renato abre o deal "Pedido Inverno 2026 — José"
WHEN acessa a aba Interações
THEN vê todas as mensagens WhatsApp do deal em ordem cronológica, com remetente, hora e status
AND vê notas e chamadas intercaladas na mesma timeline

GIVEN que há mais de 50 interações
WHEN Renato clica em "Ver mais"
THEN carrega as 50 interações anteriores sem recarregar a página
```

---

#### US-039 — Buscar contato por número de telefone (identificação automática)
**Como** Amanda,
**quero** que o CRM identifique automaticamente o contato quando uma mensagem chega,
**para** não precisar buscar manualmente quem enviou.

**Prioridade:** 🟡 Importante
**Esforço:** M
**Depende de:** US-032, US-017
**Observações técnicas:** Webhook: ao receber mensagem, busca `contacts` por `phone = número_remetente`. Se encontrado: vincula `interaction.contact_id`. Se não encontrado: cria interação com `contact_id = null` e exibe no inbox como "Número desconhecido" com botão de cadastro. Normalização de telefone: remover formatação, sempre armazenar com +55.

**Critérios de Aceitação:**

```
GIVEN que José (cadastrado com phone=+5516999990001) envia mensagem
WHEN o webhook processa
THEN a interação é criada automaticamente com contact_id=José
AND a conversa aparece no inbox com o nome "José" e não como número

GIVEN que número desconhecido +5511998887777 envia mensagem
WHEN o webhook processa
THEN interação criada com contact_id=null
AND no inbox aparece como "+5511998887777 — Contato não cadastrado" com botão "+ Cadastrar"
```

---

### Épico F: Dashboard & Relatórios

---

#### US-040 — Dashboard com KPIs principais
**Como** Renato,
**quero** ver os KPIs principais do comercial em um dashboard,
**para** ter visibilidade do negócio sem precisar cruzar planilhas.

**Prioridade:** 🔴 Essencial
**Esforço:** G
**Depende de:** US-006, US-007, US-011
**Observações técnicas:** Rota `/dashboard` (página inicial pós-login). Cards: Total de deals ativos (Atacado / Varejo), Valor total em pipeline (R$), Taxa de conversão do mês (won / total fechados), Deals fechados esta semana, Tarefas vencidas (equipe). Filtro de período: semana atual / mês atual / mês anterior / customizado. Dados via API routes com queries otimizadas (índices em `deals.status`, `deals.pipeline_id`, `deals.closed_at`).

**Critérios de Aceitação:**

```
GIVEN que Renato acessa /dashboard em 24/05/2026
WHEN a página carrega
THEN vê: 12 deals ativos Atacado, 8 deals ativos Varejo, R$ 48.500 em pipeline, taxa de conversão 34% no mês, 3 tarefas vencidas na equipe

GIVEN que Renato muda o filtro para "Mês Anterior"
WHEN seleciona Abril/2026
THEN todos os KPIs atualizam com dados de abril sem recarregar a página
```

---

#### US-041 — Performance por vendedor
**Como** Renato,
**quero** ver o desempenho individual de cada vendedor,
**para** fazer 1:1s com dados concretos e não com impressões.

**Prioridade:** 🔴 Essencial
**Esforço:** G
**Depende de:** US-040
**Observações técnicas:** Tabela em `/relatorios/performance`. Colunas: vendedor, deals ativos, valor em pipeline, conversão (%), deals ganhos no período, deals perdidos, tarefas concluídas, tarefas vencidas. Ordenável por qualquer coluna. Filtro por período e pipeline.

**Critérios de Aceitação:**

```
GIVEN que Renato acessa /relatorios/performance filtrando "Maio/2026"
WHEN a tabela carrega
THEN vê uma linha por vendedor com todos os KPIs do período
AND pode ordenar por "Conversão (%)" para ver quem está performando melhor

GIVEN que Vitor (role=vendedor) tenta acessar /relatorios/performance
WHEN tenta a rota
THEN é redirecionado com mensagem "Acesso restrito a gestores"
```

---

#### US-042 — Funil de conversão por stage
**Como** Renato,
**quero** ver quantos deals estão em cada stage e qual a taxa de avanço,
**para** identificar em qual stage os deals estão empacando.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-040
**Observações técnicas:** Gráfico de funil (ou tabela de estágios) em `/relatorios/funil`. Dados: contagem de deals + valor agregado por stage + tempo médio no stage (calculado a partir de audit_logs de movimentação). Separado por pipeline (Atacado / Varejo).

**Critérios de Aceitação:**

```
GIVEN que Renato acessa /relatorios/funil para o pipeline Atacado
WHEN a visualização carrega
THEN vê por stage: quantidade de deals, valor total e tempo médio (em dias) que deals ficam naquele stage

GIVEN que há um stage com tempo médio > 14 dias
WHEN Renato visualiza o funil
THEN o stage é destacado visualmente (cor laranja/vermelho) como gargalo
```

---

#### US-043 — Notificações e central de alertas
**Como** Vitor,
**quero** ver todas as minhas notificações em um lugar,
**para** não perder alertas importantes de tarefas vencidas e novas mensagens.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-027, US-037
**Observações técnicas:** Rota `/notificacoes` ou dropdown na navbar. Lista de notificações com: tipo (task_overdue/new_message/deal_update), mensagem, link para o recurso, data, status (lida/não-lida). Marcar como lida individualmente ou "marcar todas como lidas". Supabase Realtime para badge em tempo real.

**Critérios de Aceitação:**

```
GIVEN que Vitor tem 3 notificações não lidas
WHEN clica no ícone de sino na navbar
THEN vê dropdown com as 3 notificações com tipo, preview e timestamp
AND pode clicar em cada uma para ir diretamente ao recurso

GIVEN que Vitor clica em "Marcar todas como lidas"
WHEN confirma
THEN o badge zera e todas as notificações aparecem como lidas
```

---

#### US-044 — Relatório de motivos de perda
**Como** Renato,
**quero** ver um relatório agrupado por motivo de perda de deals,
**para** decidir se o problema é preço, concorrência ou processo de vendas.

**Prioridade:** 🟡 Importante
**Esforço:** M
**Depende de:** US-011, US-040
**Observações técnicas:** Gráfico de barras ou pizza em `/relatorios/perdas`. Agrupado por motivo de perda + período + pipeline. Tabela detalhada abaixo com deals individuais.

**Critérios de Aceitação:**

```
GIVEN que há 15 deals perdidos em maio com motivos variados
WHEN Renato acessa /relatorios/perdas filtrando maio/2026
THEN vê gráfico com distribuição por motivo (ex: Preço 40%, Concorrência 33%, Sem resposta 27%)
AND tabela detalhada com cada deal, responsável e data de perda
```

---

#### US-045 — Exportar relatório para CSV
**Como** Renato,
**quero** exportar os dados de performance para CSV,
**para** enviar o relatório mensal para a diretoria da Techmalhas.

**Prioridade:** 🟢 Nice-to-have
**Esforço:** M
**Depende de:** US-041, US-044
**Observações técnicas:** Botão "Exportar CSV" nas telas de relatório. Geração server-side com `papaparse` ou stream de dados. Filename com data. Sem exportação de dados LGPD sensíveis (telefone/e-mail de PF).

**Critérios de Aceitação:**

```
GIVEN que Renato está em /relatorios/performance com filtro maio/2026
WHEN clica em "Exportar CSV"
THEN o browser faz download de "performance-maio-2026.csv" com os dados da tabela
AND o CSV não inclui telefones ou e-mails pessoais de clientes
```

---

### Épico G: Configurações do Sistema

---

#### US-046 — Gerenciar pipelines (criar/editar/arquivar)
**Como** admin,
**quero** criar e editar os pipelines de Atacado e Varejo,
**para** configurar o funil de vendas da Techmalhas antes de começar a usar o sistema.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-004
**Observações técnicas:** Tela `/configuracoes/pipelines`. Campos: nome, tipo (atacado/varejo). MVP inicia com 2 pipelines pré-criados (seeding). Admin pode criar pipelines adicionais. Arquivar pipeline não apaga deals existentes — apenas oculta da UI de criação de novos deals. Não é possível deletar pipeline com deals ativos.

**Critérios de Aceitação:**

```
GIVEN que o admin acessa /configuracoes/pipelines
WHEN edita o nome do pipeline "Atacado" para "Atacado B2B — Lojistas"
THEN o nome é atualizado em todas as views (Kanban header, filtros, relatórios)

GIVEN que o admin tenta arquivar o pipeline "Varejo" que tem 5 deals ativos
WHEN tenta confirmar o arquivamento
THEN vê erro "Impossível arquivar: existem 5 deals ativos neste pipeline. Feche ou mova os deals antes."
```

---

#### US-047 — Gerenciar stages de um pipeline
**Como** admin,
**quero** criar, reordenar e editar os stages de cada pipeline,
**para** adaptar o funil à realidade do processo de vendas da Techmalhas.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-046
**Observações técnicas:** Sub-tela de `/configuracoes/pipelines/:id/stages`. Drag-and-drop para reordenar (atualiza `order_index`). Campos: nome, cor (color picker), posição. Não é possível deletar stage com deals — apenas renomear ou mesclar (mesclar = backlog v2). Mínimo 2 stages por pipeline.

**Critérios de Aceitação:**

```
GIVEN que o admin está configurando o pipeline de Atacado
WHEN cria stage "Apresentação de Coleção" entre "Qualificação" e "Proposta Enviada"
THEN o stage aparece no Kanban na posição correta
AND deals existentes nos stages anteriores não são afetados

GIVEN que o admin tenta deletar stage "Qualificação" que tem 3 deals
WHEN tenta confirmar a deleção
THEN vê erro "Stage possui 3 deals ativos. Mova-os antes de remover o stage."
```

---

#### US-048 — Configurar tarefas obrigatórias por stage
**Como** Renato,
**quero** definir quais tarefas obrigatórias são criadas automaticamente quando um deal entra em um stage,
**para** padronizar o processo sem depender da memória de cada vendedor.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-047, US-026
**Observações técnicas:** Sub-seção em `/configuracoes/pipelines/:id/stages/:stage_id`. Lista de `stage_required_tasks`: título, tipo (call/email/meeting/task), prazo padrão em horas (`default_due_hours`). Admin/gestor podem adicionar, editar e remover. Remoção de tarefa obrigatória de stage não remove instâncias já criadas em deals existentes.

**Critérios de Aceitação:**

```
GIVEN que Renato está configurando o stage "Proposta Enviada" do pipeline Atacado
WHEN adiciona tarefa obrigatória "Enviar proposta por e-mail", tipo=email, prazo=48h
THEN a tarefa aparece na lista de obrigatórias do stage
AND ao mover próximo deal para "Proposta Enviada", a tarefa é criada automaticamente no deal com due_at = now() + 48h

GIVEN que Renato remove a tarefa obrigatória do stage
WHEN um deal já existente no stage tem a tarefa criada anteriormente
THEN a tarefa existente no deal não é removida (apenas novos deals não a recebem)
```

---

#### US-049 — Configurações de integração WhatsApp
**Como** admin,
**quero** configurar as credenciais da Meta Cloud API (Phone Number ID, Token, Webhook Secret),
**para** ativar a integração WhatsApp sem precisar editar arquivos de servidor.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-032, US-004
**Observações técnicas:** Tela `/configuracoes/integracao-whatsapp`. Campos: Phone Number ID, Business Account ID, Access Token (mascarado após salvo), Webhook Verify Token. Valores salvos em variáveis de ambiente (via Vercel API ou arquivo `.env` — decidir na arquitetura). Botão "Testar conexão" que chama `GET https://graph.facebook.com/v19.0/{phone_number_id}`. NUNCA exibir o Access Token completo após salvamento.

**Critérios de Aceitação:**

```
GIVEN que o admin preenche as credenciais da Meta Cloud API
WHEN clica em "Testar conexão"
THEN vê mensagem "Conexão bem-sucedida. Número: +55 16 XXXX-XXXX (Techmalhas)"
AND as credenciais são salvas de forma segura

GIVEN que o admin salva as credenciais e retorna à tela
WHEN visualiza as configurações
THEN o Access Token aparece como "••••••••[últimos 4 caracteres]" e não em texto claro
```

---

#### US-050 — Log de auditoria do sistema
**Como** admin,
**quero** consultar o log de auditoria do sistema,
**para** rastrear ações críticas como deleção de dados, mudança de roles e operações LGPD.

**Prioridade:** 🟡 Importante
**Esforço:** M
**Depende de:** US-004, US-020
**Observações técnicas:** Tela `/configuracoes/auditoria` visível apenas para admin. Tabela com colunas: data/hora, usuário, ação, recurso, ID do recurso, IP. Filtros: usuário, ação (LGPD_ERASURE/ROLE_CHANGE/LOGIN/DEAL_MOVE/etc.), período. Sem deleção de logs — append-only.

**Critérios de Aceitação:**

```
GIVEN que o admin acessa /configuracoes/auditoria
WHEN filtra por ação "LGPD_ERASURE" no último mês
THEN vê todos os apagamentos de dados realizados com usuário, data e IP de origem

GIVEN que qualquer usuário tenta deletar um registro de audit_log via API
WHEN a requisição chega ao servidor
THEN recebe HTTP 405 (Method Not Allowed) — logs são somente-leitura
```

---

## 5. Matriz de Dependências

| Story | Depende de | Bloqueia |
|---|---|---|
| US-001 | — | US-002, US-003, US-005 |
| US-002 | US-001 | US-003 |
| US-003 | US-001, US-002 | US-004, US-006, US-007, US-016, US-032, US-046 |
| US-004 | US-003 | US-022, US-046, US-049, US-050 |
| US-006 | US-003 | US-007, US-009, US-012, US-013, US-015 |
| US-007 | US-006 | US-009, US-012, US-014, US-015 |
| US-008 | US-006, US-007, US-019 | US-009, US-010, US-011 |
| US-009 | US-006, US-007, US-011 | US-013 |
| US-010 | US-008 | US-011, US-013, US-019, US-030 |
| US-011 | US-010 | US-014, US-040 |
| US-017 | US-016 | US-018, US-021, US-039 |
| US-018 | US-017 | US-019, US-020, US-024 |
| US-024 | US-010, US-018 | US-025, US-026, US-027, US-028, US-029 |
| US-026 | US-009, US-024, US-048 | hard block no pipeline |
| US-032 | US-003 | US-033, US-034, US-036, US-037, US-039 |
| US-033 | US-032 | US-034, US-035, US-038 |
| US-034 | US-033 | US-035, US-036 |
| US-046 | US-004 | US-047 |
| US-047 | US-046 | US-048 |
| US-048 | US-047, US-026 | hard block ativo |

**Caminho crítico (sequência mínima para MVP funcional):**
US-001 → US-002 → US-003 → US-004 → US-046 → US-047 → US-048 → US-006 → US-008 → US-024 → US-026 → US-032 → US-033 → US-034

---

## 6. Riscos e Perguntas em Aberto

⚠️ **Decisão necessária no Checkpoint 1**

1. **Número WhatsApp Business da Techmalhas:** A Meta Cloud API exige um número de telefone dedicado verificado na Meta Business Suite. A Techmalhas já tem número registrado como WhatsApp Business? Se não, o processo de verificação pode levar 2–4 semanas e bloquear o Épico E.

2. **Limites da janela de 24h WhatsApp (US-034):** Para clientes que não enviaram mensagem recente, o envio exige templates pré-aprovados pela Meta (HSM). A Techmalhas precisa criar e submeter templates antes do go-live. Quem é responsável por criar e submeter os templates à Meta? Sem isso, Amanda não pode contatar clientes inativos.

3. **Volume esperado de mensagens WhatsApp por dia:** O design atual usa Supabase Realtime para updates de status. Se o volume for > 1.000 mensagens/dia, avaliar se Supabase Realtime tem performance adequada ou se é necessário Redis + WebSocket próprio.

4. **Roles: Vitor precisa ver o pipeline de Varejo?** Definição atual: Vitor (vendedor Atacado) não vê o pipeline de Varejo por padrão. Isso está correto? Se o mesmo vendedor atender ambos os canais, o modelo de permissões precisa ser ajustado (ex: role por pipeline, não apenas global).

5. **LGPD — Contatos importados via CSV (US-021):** O checkbox de "consentimento em lote" que Renato assina na importação é juridicamente suficiente para a Techmalhas? Recomendo consultar com assessoria jurídica antes de implementar — caso contrário, cada contato importado precisa de e-mail de opt-in individual.

6. **Integração Dapic — campo `dapic_id`:** O campo está reservado no schema, mas sem integração real. Existe alguma necessidade de consulta de estoque ou pedidos no Dapic já no MVP? Se sim, escopo muda significativamente.

7. **Supabase Auth — domínio autorizado para Google OAuth:** A restrição de e-mails ao domínio `@techmalhas.com.br` pressupõe que a equipe usa e-mails corporativos. Confirmar se todos os usuários iniciais têm e-mail neste domínio, ou definir lista de e-mails autorizados como alternativa.

8. **Quantos usuários simultâneos no lançamento?** Supabase free tier tem limite de 500MB de banco e 50K MAU. Com o plano Pro ($25/mês) os limites sobem bastante. Definir plano antes de go-live para dimensionar corretamente.

9. **Configuração de credenciais WhatsApp (US-049):** Salvar tokens na interface administrativa vs. apenas via variáveis de ambiente do Vercel. A abordagem de UI é mais confortável para o admin, mas requer criptografia extra no banco. Confirmar qual abordagem o arquiteto prefere.

10. **Multi-número WhatsApp:** MVP assume 1 número WhatsApp para toda a Techmalhas. Se no futuro Atacado e Varejo precisarem de números separados, a tabela `whatsapp_messages` e o webhook precisarão de `phone_number_id` como chave discriminadora — incluir esse campo já no schema do MVP para evitar migração futura.

---

## 7. Out of Scope (Backlog v2/v3)

| Feature | Versão | Justificativa |
|---|---|---|
| Instagram DM | v2 | Instagram Graph API tem restrições de aprovação demoradas; Meta Cloud API para WhatsApp é prioridade clara das personas. Vitor e Amanda usam primariamente WhatsApp |
| Disparos em massa (WhatsApp/SMS/Voz) | v2 | Exige templates pré-aprovados Meta + compliance anti-spam. Alto risco de banimento do número. Fora do caso de uso diário do MVP |
| Agentes IA conversacionais | v3 | Requer base de dados de histórico madura para treino/contexto. Prematuro sem pelo menos 6 meses de dados no CRM |
| App mobile nativo (iOS/Android) | v2 | Next.js 15 já é responsivo. PWA como intermediário. App nativo tem custo de manutenção 2x sem persona que justifique no MVP |
| Integração Dapic completa | v2 | ERP de nicho sem API pública documentada; campo `dapic_id` reservado no schema para futura integração sem breaking change |
| Multitenancy | v3 | Techmalhas é cliente único. Multitenancy adiciona complexidade de RLS e billing sem ROI no MVP |
| Templates de mensagens WhatsApp salvos | v2 | Exige interface de gestão de templates + aprovação Meta. Vitor e Amanda conseguem trabalhar com mensagens livres na janela de 24h no MVP |
| Distribuição automática de leads (round-robin) | v2 | Necessita dados de carga de trabalho por vendedor — `last_assigned_at` já está no schema para implementação futura sem migração |
| Relatório RFM detalhado (Recência/Frequência/Valor) | v2 | Badge "Cliente Recorrente" no MVP cobre o caso de José. RFM completo requer 6+ meses de dados históricos para ser significativo |
| Integração checkout / carrinho abandonado | v3 | Techmalhas não tem e-commerce próprio documentado. Depende de decisão de plataforma de vendas online |
| Respostas rápidas / snippets de mensagem | v2 | Amanda consegue digitar mensagens no MVP. Snippets são otimização de produtividade, não bloqueio crítico |
| Gestão de coleções sazonais (Copa 2026, Inverno) | v2 | Contexto importante, mas gerenciável via campo de tags em deals no v2. Não bloqueia o processo de vendas no MVP |
| Tabela de preços por canal no CRM | v2 | Preços são gerenciados no Dapic. Replicar no CRM sem sincronização cria risco de inconsistência. Vitor já conhece a tabela de cor |
| Exportação CSV de contatos com dados pessoais | fora do escopo | LGPD — exportar telefone/e-mail de clientes em massa sem finalidade específica é risco regulatório. Avaliar com jurídico antes de implementar |
| Notificações push (browser Web Push API) | v2 | Badge + toast no MVP cobrem o caso de Amanda/Vitor logados. Push offline é complexidade de service worker desnecessária no MVP |

---

*Documento produzido por Patrícia Produto — Estrategista de Produto, Squad CRM Techmalhas*
*Versão 1.0 — 24/05/2026*
*Próximo passo: Checkpoint 1 com Tania para validação das perguntas em aberto (Seção 6) antes de iniciar Sprint 1*
