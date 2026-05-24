# Anti-Patterns — CRM Techmalhas

> Erros comuns que destroem CRMs SaaS. Todos os agentes devem evitá-los.

---

## ❌ Anti-Pattern 1: Clone Cego do Clint Digital

**O erro:** Copiar pixel a pixel o Clint sem questionar se faz sentido para Techmalhas.

**Por que mata o projeto:** O Clint nasceu para infoprodutores. Tem features (ex: integração checkout de infoproduto, agentes IA WhatsApp) que **não servem** para uma indústria de vestuário com dualidade atacado/varejo.

**O que fazer em vez:** Auditar o Clint, MAPEAR as features, AVALIAR cada uma contra as necessidades da Techmalhas, ADAPTAR.

---

## ❌ Anti-Pattern 2: Over-Engineering no MVP

**O erro:** Adicionar microservices, Redis cache, Kubernetes, multitenancy, GraphQL e Event Sourcing no V1.

**Por que mata o projeto:** Aumenta complexidade 10x, atrasa entrega, ninguém da Techmalhas conseguirá manter, custos disparam.

**O que fazer em vez:** Monolito Next.js + PostgreSQL + Vercel. Escala até centenas de usuários. Refatorar quando precisar (não antes).

---

## ❌ Anti-Pattern 3: User Stories Vagas

**O erro:** "Como usuário, quero gerenciar leads para vender mais."

**Por que mata o projeto:** Impossível estimar, testar ou priorizar. Vira "tudo sobre leads", escopo infla, MVP nunca sai.

**O que fazer em vez:** Personas com nome (Vitor, Amanda), ação específica ("arrastar deal entre stages"), benefício mensurável ("acompanhar pipeline sem trocar de tela"), critérios Given/When/Then.

---

## ❌ Anti-Pattern 4: Wireframe Só Desktop

**O erro:** Desenhar tudo em 1280px e dizer "depois faz responsivo".

**Por que mata o projeto:** Vendedores usam celular em campo. Kanban responsivo é DIFÍCIL — design precisa nascer mobile-first ou vai dar refatoração massiva.

**O que fazer em vez:** Desenhar mobile (375px) E desktop (1280px) para cada tela. Pensar em touch targets, scroll horizontal de colunas, drawer em vez de modal.

---

## ❌ Anti-Pattern 5: Ignorar LGPD até o final

**O erro:** "Depois a gente adiciona consentimento e audit log."

**Por que mata o projeto:** Refatorar dados pessoais depois é doloroso. Multa LGPD é alta. Dapic ERP tem dados sensíveis — qualquer integração precisa de cuidado.

**O que fazer em vez:** Desde o ERD, marcar campos pessoais. Tabela `audit_logs` no MVP. Banner de consentimento. RLS no Supabase.

---

## ❌ Anti-Pattern 6: TypeScript Frouxo

**O erro:** `strict: false`, `any` por toda parte, "depois eu tipo direito".

**Por que mata o projeto:** Bugs em runtime, refatoração impossível, novos devs (humanos ou IA) se perdem.

**O que fazer em vez:** `tsconfig.strict: true`, `noUncheckedIndexedAccess: true`, Zod parsing em toda entrada, `unknown` em vez de `any`, narrow types explícitos.

---

## ❌ Anti-Pattern 7: WhatsApp Não-Oficial (Web Scrape / Z-API / 360dialog não autorizado)

**O erro:** Usar bot que conecta WhatsApp Web ou APIs cinzas.

**Por que mata o projeto:** Meta bloqueia número, perde histórico, vira ilegal. Em campanhas de mass mailing, pior ainda.

**O que fazer em vez:** Meta Cloud API oficial. BSP (Business Solution Provider) certificado se precisar. Templates aprovados. Respeitar janela de 24h.

---

## ❌ Anti-Pattern 8: Dashboard Sem Acionabilidade

**O erro:** "Total de leads: 142" e mais nada.

**Por que mata o projeto:** Gestor vê o número mas não sabe O QUE FAZER. KPI sem ação = vaidade.

**O que fazer em vez:** Cada métrica linka para uma lista filtrada. "5 tarefas vencidas" → click → lista. "Conversão caiu 12%" → comparativo + breakdown por vendedor.

---

## ❌ Anti-Pattern 9: Pipeline Único para Atacado e Varejo

**O erro:** Forçar lojista B2B e consumidor final no mesmo funil.

**Por que mata o projeto:** Etapas diferentes, ticket diferente, ciclo diferente. Vira confusão visual.

**O que fazer em vez:** Tabela `pipelines` com `type`. UI permite switch entre eles. Stages configuráveis por pipeline.

---

## ❌ Anti-Pattern 10: Esquecer da Dapic

**O erro:** Construir o CRM como se a Techmalhas não tivesse ERP.

**Por que mata o projeto:** Cliente cadastrado no CRM tem que existir no Dapic para faturar. Pedido fechado tem que virar nota fiscal. Dupla digitação é falha operacional anunciada.

**O que fazer em vez:** Mesmo que integração com Dapic fique fora do MVP v1, o **modelo de dados** deve suportar referência (`contacts.dapic_id`, `deals.dapic_pedido_id`). Webhook ou cron de sync no v2.

---

## ❌ Anti-Pattern 11: Documentação Como Pensamento Tardio

**O erro:** "Vou documentar quando o código estiver pronto."

**Por que mata o projeto:** Nunca acontece. README desatualizado, novo dev/IA não consegue rodar localmente, suporte vira inferno.

**O que fazer em vez:** README desde o commit 1. `.env.example` atualizado. Inline docs em decisões complexas. Guias do usuário e admin como entregáveis do MVP.

---

## ❌ Anti-Pattern 12: Tasks Não-Obrigatórias Quando Tania Pediu Obrigatórias

**O erro:** Implementar tarefas como "lembrete amigável" que o vendedor pode ignorar.

**Por que mata o projeto:** Tania explicitamente pediu "obrigatoriedade em cumprir as tarefas pelos responsáveis". Ignorar isso = projeto fora do escopo combinado.

**O que fazer em vez:** Campo `activities.mandatory: boolean`. Quando true: bloqueia movimentação de deal, notifica gestor em overdue, aparece no dashboard como pendência crítica.
