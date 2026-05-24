# Decisão de Escopo — Checkpoint 1

**Data:** 2026-05-24 16:45
**Aprovado por:** Tania (Techmalhas)

---

## Decisões

### Escopo Geral
Aprovado com expansões. Todas as integrações abaixo entram no MVP:
- ✅ Pipeline Kanban dual (Atacado + Varejo como pipelines independentes)
- ✅ Cadastro de leads e contatos
- ✅ Histórico completo de interações
- ✅ Tarefas obrigatórias com hard block (mandatory=true bloqueia stage no backend)
- ✅ WhatsApp Cloud API (webhook, inbox, envio, templates)
- ✅ Dashboard de indicadores (KPIs por vendedor)
- ✅ Autenticação (e-mail + Google OAuth, Supabase Auth)
- ✅ LGPD (consentimento + audit_log)
- ✅ **NOVO — Formulário do site techmalhas.com.br → Lead no CRM** (webhook/API do site)
- ✅ **NOVO — Chat ao vivo no site techmalhas.com.br** (widget JS embarcado)
- ✅ **NOVO — Instagram Direct Messages no CRM** (Meta Messaging API)
- ✅ **NOVO — Captura de leads de comentários no Instagram** (Meta Graph API)

### Integração Dapic
**Campos reservados no ERD — integração real no v2.**
- Campos `dapic_id` (contacts) e `dapic_pedido_id` (deals) indexados no schema desde o MVP
- Rastreamento de pedidos no site: fica fora do MVP v1, entra no v2 junto com a integração Dapic
- Ação necessária antes do v2: Tania contata suporte da Dapic para verificar o que a API/webhook deles expõe

### Perfis de Usuário
**4 perfis (RBAC expandido):**
- `admin` — acesso total (configurações, usuários, todos os dados)
- `gestor` — visualiza equipe inteira, configura pipelines e tarefas obrigatórias, não pode gerenciar usuários
- `vendedor_atacado` — acessa pipeline de Atacado, leads B2B, não vê pipeline de Varejo por padrão
- `atendente_varejo` — acessa pipeline de Varejo, inbox WhatsApp/Instagram, não vê pipeline de Atacado por padrão

---

## Integrações Novas — Impacto Técnico

### Instagram (Meta Messaging API)
- ⚠️ **AÇÃO IMEDIATA**: verificar se o perfil @techmalhas no Instagram está conectado a uma Página do Facebook no Meta Business Manager
- ⚠️ A aprovação da Meta Messaging API pode levar 2–4 semanas — iniciar solicitação em paralelo com o desenvolvimento
- Tania informou: tem conta Instagram Business, mas não tem certeza sobre a Página do Facebook conectada
- O arquiteto (Step 06) deve incluir no plano de deploy o checklist de aprovação da Meta

### Chat ao Vivo no Site (techmalhas.com.br)
- Requer criação de widget JavaScript para embutir no site
- O widget se comunica com o backend CRM via WebSocket ou polling
- Conversas do chat entram na mesma inbox do CRM (canal: `web_chat`)
- Necessário verificar com o time do site como embutir o script (plataforma usada)

### Formulário do Site → Lead
- Implementação via webhook: formulário do site faz POST para `/api/v1/leads` do CRM
- Mais simples das três integrações — pode ser o primeiro a ser desenvolvido

---

## Ajustes no RBAC vs. Versão Original

| Perfil Original | Perfil Atualizado | Mudança |
|---|---|---|
| admin | admin | Sem alteração |
| gestor | gestor | Sem alteração |
| vendedor | vendedor_atacado | Especializado para Atacado (B2B) |
| — (não existia) | atendente_varejo | Novo perfil para Amanda (B2C, varejo) |

**Impacto nas user stories:** as stories do Épico A (Autenticação & Usuários) precisam ser atualizadas para refletir os 4 perfis. As stories de pipeline e dashboard devem considerar que `vendedor_atacado` e `atendente_varejo` veem contextos diferentes por padrão.

---

## Fora do Escopo v1 (Backlog v2/v3)

| Feature | Versão | Motivo |
|---|---|---|
| Rastreamento de pedidos (site) | v2 | Depende da integração Dapic |
| Integração Dapic completa (bidirecional) | v2/v3 | Depende da API/webhook do Dapic |
| Instagram DM via IA (respostas automáticas) | v3 | Fora do MVP |
| App mobile nativo | v2 | Pós-MVP |
| Campanhas em massa (SMS/WhatsApp/e-mail) | v3 | Fora do MVP |
| Distribuição automática de leads | v2 | Útil quando a equipe crescer |
| Respostas rápidas / templates salvos | v2 | Backlog confirmado |
| Multitenancy | v3 | Não necessário agora |

---

## Próximos Passos

Pipeline prosseguirá para Steps 04 (Wireframes) e 05 (Design System) com Davi Designer, e Step 06 (Arquitetura) com Arnaldo Arquiteto, considerando todas as decisões acima.

**Ações fora do squad que Tania precisa tomar em paralelo:**
1. 📱 Verificar se @techmalhas está conectado a uma Página do Facebook no Meta Business Manager
2. 📞 Contatar suporte Dapic para saber quais endpoints/webhooks eles expõem
3. 🌐 Verificar qual plataforma/CMS o techmalhas.com.br usa (para viabilizar o widget de chat)

⚠️ A partir deste ponto, o time implementará segundo o escopo acima. Mudanças de escopo após o Checkpoint 2 (Arquitetura) exigirão refatoração.
