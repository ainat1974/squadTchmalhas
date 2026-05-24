# Research Brief — CRM Techmalhas

> Compilação completa da pesquisa realizada durante a fase Discovery.
> Esta é a fonte de referência para todos os agentes do squad.

---

## 1. Sobre a Techmalhas

- **Razão Social:** RM Indústria e Comércio de Vestuário e Malhas LTDA
- **Marca:** Techmalhas®
- **Localização:** Franca / SP
- **Fundadores:** Renato (químico, paranaense) + Márcia (mineira, especialista em confecção)
- **História:** Fundada em 2019, consolidada em 2022 após reinvenção durante a pandemia
- **Slogan:** *"Casual que dura. Conforto que você sente. Vista Techmalhas."*
- **Modelo:** Indústria + comércio com **fabricação própria nacional**
- **Canais:** E-commerce próprio (techmalhas.com.br) + Instagram (@techmalhas)
- **Pagamento destaque:** PIX com 5% de desconto à vista
- **ERP em uso:** **Dapic**
- **CRM:** Não possui — projeto deste squad

## 2. Modelo de Negócio Dual

| Canal | Público | Necessidades de CRM |
|---|---|---|
| **Atacado** | Lojistas, revendedores | Pipeline de prospecção, cadências longas, contratos recorrentes, preço diferenciado |
| **Varejo** | Consumidor final | Carrinho abandonado, pós-venda, fidelização, tickets de suporte |

## 3. Linhas de Produto

- **Masculino:** Camisetas básicas (todas cores), Oversized, Polo, Dryfit, Regata, Manga longa, Jaqueta corta-vento, Calça Chimpa, Bermuda Moletom
- **Feminino:** Baby Look, Regata, Polo, Dryfit, Moletom canguru
- **Infantil:** Bermuda Dryfit
- **Sazonal:** Coleção Copa 2026 (linha Brasil)
- **Faixa de preço:** R$ 24–77 varejo / R$ 19–61 atacado

## 4. Auditoria — Clint Digital (CRM de referência)

**URL:** https://pages.clint.digital/parceiro | https://www.clint.digital

**Posicionamento original:** 1º CRM all-in-one para infoprodutores → expandido para varejo/indústria

**Planos (cobrança anual):**
| Plano | Valor/mês | Mínimo de usuários |
|---|---|---|
| Starter | R$ 523 | 2 |
| Growth | R$ 800 | 3 |
| Pro | R$ 1.177 | 4 |

### Features Mapeadas (com prioridade para Techmalhas)

| # | Feature | Prioridade MVP | Justificativa |
|---|---|---|---|
| 1 | Pipeline Kanban (funil de vendas) | 🔴 Essencial | Solicitado explicitamente pela Tania |
| 2 | Cadastro completo de leads/contatos | 🔴 Essencial | Base de todo CRM |
| 3 | Histórico completo de interações | 🔴 Essencial | Solicitado |
| 4 | WhatsApp API Oficial (Meta) | 🔴 Essencial | Solicitado |
| 5 | Dashboard de indicadores | 🔴 Essencial | Solicitado |
| 6 | Cadência de atividades / tarefas obrigatórias | 🔴 Essencial | "Obrigatoriedade em cumprir tarefas" |
| 7 | Distribuição automática de leads | 🟡 Backlog v2 | Útil mas não bloqueador |
| 8 | Respostas rápidas / templates | 🟡 Backlog v2 | Útil mas não bloqueador |
| 9 | Agendamento de mensagens | 🟡 Backlog v2 | Útil mas não bloqueador |
| 10 | Campanhas em massa (SMS, voz, WhatsApp) | 🟢 Backlog v3 | Fora do MVP |
| 11 | Instagram DM no CRM | 🟢 Backlog v3 | Fora do MVP |
| 12 | Agentes de IA WhatsApp | 🟢 Backlog v3 | Fora do MVP |
| 13 | Integração checkout (carrinho abandonado) | 🟢 Backlog v3 | Possível integração com e-commerce próprio |
| 14 | Webhooks e API pública | 🟡 Backlog v2 | Necessário para integrar Dapic depois |

### Gaps do Clint para Techmalhas

- ❌ Não integra com Dapic ERP nativamente
- ❌ Não pensado para dualidade Atacado/Varejo de vestuário
- ❌ Sem gestão de SKUs por modelo-cor-tamanho
- ❌ Custo recorrente alto (R$ 6 a 14 mil/ano)

## 5. Stack Tecnológica Definida

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack moderno, RSC, edge runtime |
| Linguagem | TypeScript estrito | Segurança de tipos |
| UI | TailwindCSS + shadcn/ui | Velocidade + acessibilidade |
| Validação | Zod | Schema runtime + types |
| DB | PostgreSQL via Supabase | Free tier generoso, auth incluído, RLS |
| ORM | Prisma 6.x OU Drizzle (Arnaldo decide) | TypeSafe queries |
| Hosting | Vercel | Deploy automático, edge, integração nativa com Next |
| WhatsApp | Meta Cloud API | API Oficial, gratuita até 1.000 conversas/mês |
| Auth | Supabase Auth | E-mail + Google OAuth |
| Compliance | LGPD | Consentimento, RLS, audit logs |

## 6. Personas-Alvo do CRM Techmalhas

### P1 — Vendedor de Atacado (Vitor)
- Atende lojistas via WhatsApp
- Precisa: pipeline visual, agenda de follow-up, histórico de pedidos
- Frustração: perder lead em planilha esquecida

### P2 — Atendente de Varejo (Amanda)
- Responde dúvidas no WhatsApp e Instagram
- Precisa: respostas rápidas, status do pedido, contato direto com cliente
- Frustração: trocar abas entre WhatsApp Web, e-commerce e ERP

### P3 — Gestor Comercial (Renato)
- Acompanha desempenho da equipe
- Precisa: dashboard, relatórios, controle de tarefas pendentes
- Frustração: não saber se a equipe está cumprindo os follow-ups

### P4 — Cliente Lojista (José da Loja)
- Compra em atacado, faz pedidos recorrentes
- Precisa: ser atendido rápido, receber novidades, ter histórico
- Frustração: ser tratado como cliente novo a cada compra

## 7. Glossário Técnico (vocabulário do squad)

- **Lead:** Contato em estágio inicial de funil, ainda não é cliente
- **Deal / Negócio:** Oportunidade de venda associada a um lead
- **Pipeline:** Funil visual com etapas configuráveis (Kanban)
- **Atividade:** Tarefa atribuída a um responsável (ligação, mensagem, reunião)
- **Cadência:** Sequência pré-definida de atividades (playbook)
- **RBAC:** Role-Based Access Control (admin, gestor, vendedor)
- **Cloud API:** API REST oficial da Meta para WhatsApp Business
- **Template Message:** Mensagem pré-aprovada pela Meta para iniciar conversas
- **24h Window:** Janela de 24h após resposta do cliente onde mensagens livres são permitidas
