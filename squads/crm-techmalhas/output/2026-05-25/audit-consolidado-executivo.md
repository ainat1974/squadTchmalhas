# Auditoria Consolidada — CRM Techmalhas
**Data:** 2026-05-26 · **Consolidado por:** tutora (a partir de 5 relatórios especializados)  
**Fontes:** Patrícia (produto) · Davi (design) · Fábio (código) · Quésia (QA) · Arnaldo (arquitetura)

---

## TL;DR executivo (para Tania)

1. **Veredicto unânime: NÃO está pronto para produção real com Vitor, Amanda e Renato.** Está pronto para **demo interna, treinamento e validação visual** nas telas já migradas para v5.
2. **MVP de produto ~21% completo** (Patrícia: 8 de 38 stories 🔴 entregues integralmente). O pilar prometido — **WhatsApp como inbox vivo** — não tem UI; webchat avançou, mas canibalizou capacidade do MVP original.
3. **Qualidade e segurança têm buracos P0 convergentes:** zero testes reais, `ignoreBuildErrors`, webchat sem proteção adequada, política LGPD 404, hard block de tarefas é “teatro”, KPIs do dashboard mentem (deals nunca fecham como `won`).
4. **Arquitetura e banco estão sólidos** (Arnaldo: schema + RLS no Postgres OK). O débito é **operacional** — boundary da API, crons, RBAC incompleto, Prisma bypassa RLS — não de redesign.
5. **Para go-live real:** fechar **~10–14 dias úteis** de Sprint Recovery (1 dev) ou **~3 semanas** se mantiver webchat/widget em paralelo sem 2º dev. Recomendação: **pausar widget Irroba** até R1–R5 (produto P0) + pacote segurança (Fábio/Arnaldo P0).

---

## Status da auditoria

| Auditor | Arquivo | Veredicto resumido |
|---------|---------|-------------------|
| Patrícia Produto | `audit-patricia-produto.md` | Não — falta MVP (WhatsApp UI, deal detail, hard block) |
| Davi Designer | `audit-davi-design.md` | Parcial — DS v5 ok; 3 telas legadas v3 + a11y mobile |
| Fábio Fullstack | `audit-fabio-codigo.md` | C+ impl. — 7 P0 técnicos (~14h) |
| Quésia Qualidade | `audit-quesia-qualidade.md` | Não — 0% cobertura; smoke + LGPD P0 |
| Arnaldo Arquiteto | `audit-arnaldo-arquitetura.md` | Sim com ressalvas — interno hoje; público após P0 |

---

## Top 10 problemas críticos (consenso multi-auditor)

Prioridade quando **2+ auditores** apontam o mesmo item — sobe na fila.

| # | Problema | Quem apontou | Impacto |
|---|----------|--------------|---------|
| **1** | **Inbox WhatsApp sem UI** (webhook ok, sem tela para Amanda/Vitor) | Patrícia P0 | Quebra promessa do MVP; time continua no WhatsApp Business |
| **2** | **Detalhe de deal + fechar Ganho/Perdido inexistente** (`/deals/[id]` ausente) | Patrícia, Fábio, Quésia | KPIs sempre zerados; Renato não confia no dashboard |
| **3** | **Hard block de tarefa obrigatória não implementado** (badge só visual) | Patrícia, Quésia, Fábio | Diferencial Techmalhas vs Clint vira teatro |
| **4** | **`/leads/new` → 404** (“+ Novo Contato”) | Patrícia, Quésia | Frustração em 5s de uso |
| **5** | **Pacote segurança/LGPD no boundary** (webchat post anônimo, `lgpdConsent` hardcoded, política 404, audit sem `await`) | Arnaldo, Fábio, Quésia | Risco regulatório + abuso público |
| **6** | **`typescript.ignoreBuildErrors: true`** (23 erros TS escondidos) | Fábio, Arnaldo | Build verde mentindo; regressões invisíveis |
| **7** | **Zero testes automatizados** (Vitest/Playwright instalados, nenhum arquivo) | Quésia, Fábio | Sem rede de segurança para go-live |
| **8** | **Proteção de rotas / sessão** (cookies SSR no-op; middleware ausente — debate ADR vs QA) | Fábio P0, Quésia P0, Arnaldo “layout ok” | Sessão expira sem aviso; QA exige hardening |
| **9** | **Crons divergentes** (`whatsapp-retry` e `webchat-expire` 1×/dia vs `*/5` e `*/15`) | Arnaldo | Retry WA 24h; sessões zumbi no banco |
| **10** | **Design legado v3 em telas críticas** (landing, `leads/[id]`, `ObligatoryTaskBlocker`) + tap targets mobile | Davi | Porta de entrada e detalhe de lead fora da marca v5 |

---

## Sobreposições importantes (reforço = prioridade)

| Tema | Evidência | Ação única recomendada |
|------|-----------|------------------------|
| Deals nunca `won` | `dashboard/page.tsx` — conversão 0%; sem US-011 | R2: tela deal + PATCH status |
| Webchat embed vs ADR-008 | Backend existe; Turnstile/Upstash/CORS/widget pendentes (Arnaldo) vs `/embed/chat` já criado (pós-auditoria) | Alinhar ADR com código; fechar rate limit Redis |
| RLS vs Prisma | Arnaldo: RLS no banco, app usa `postgres` role | Manter RBAC rigoroso em **todas** mutations; não confiar só em RLS |
| Scope creep webchat | Patrícia §1 + Arnaldo ADR-008 | Checkpoint: webchat **depois** de WhatsApp inbox + deal close |
| `test-report.md` fictício | Quésia §1 | Remover ou marcar como aspiracional; criar 5 E2E P0 |

---

## Roadmap recomendado (4 sprints)

### Sprint 1 — Recovery P0 Produto (1–1,5 semana, 1 dev)
**Objetivo:** time consegue usar o CRM no dia a dia.

| ID | Entrega | Stories / refs |
|----|---------|----------------|
| R1 | Inbox WhatsApp (lista + thread + envio) | US-033, 034, 036, 037 |
| R2 | `/deals/[id]` + Ganho/Perdido | US-010, 011 |
| R3 | Hard block real + auto-tarefas por stage | US-026, 048 |
| R4 | Formulários Novo Contato / Novo Deal | US-008, 017 |
| R5 | Bugs Fábio §7 (cookies, upsert phone, logAudit, throw ApiError) | técnico |

### Sprint 2 — Segurança, LGPD e qualidade (1 semana)
**Objetivo:** aguentar tráfego público (formulário + webchat).

| Item | Esforço est. |
|------|--------------|
| Página `/politica-de-privacidade` + link webchat | 4h |
| Hardening webchat (token sessão, rate limit Upstash, validar Origin) | 8–12h |
| Remover `ignoreBuildErrors`; zerar 23 erros TS | 8h |
| Smoke test 15 itens (Quésia §5) + registrar | 15min + fixes |
| Suite mínima: 5 E2E P0 (login, lead, kanban, block, webchat) | 16h |

### Sprint 3 — Design debt + P1 produto (1 semana)
| Item | Ref |
|------|-----|
| Migrar `app/page.tsx`, `leads/[id]`, `ObligatoryTaskBlocker` para v5 | Davi P0-1 |
| Tap targets ≥44px; remover `backdrop-blur` no mobile | Davi P0-2/3 |
| Notification center, perfil/troca senha | Patrícia R6–R8 |
| Corrigir crons no `vercel.json` | Arnaldo |

### Sprint 4 — Widget Irroba + integrações (após Sprint 1–2)
| Item | Ref |
|------|-----|
| `widget.js` Shadow DOM + iframe + postMessage | ADR-008 |
| Turnstile + CSP/CORS produção | ADR-008 |
| Índices FK performance advisor | Arnaldo §2.3 |

---

## Métricas de saúde do projeto

| Dimensão | Nota | Comentário |
|----------|------|------------|
| Arquitetura / dados | **B** | Schema e ADRs coerentes |
| Implementação código | **C+** | Padrões bons, detalhes perigosos |
| Produto vs MVP | **D+** | 21% stories 🔴 completas |
| Design System v5 | **B−** | Tokens ok; migração incompleta |
| QA / testes | **F** | 0% cobertura real |
| Pronto para cliente real | **Não** | Unânime |
| Pronto para demo interna | **Sim** | Com ressalvas documentadas |

---

## Veredicto final consolidado

> **O CRM Techmalhas tem fundação técnica correta e visual v5 promissor, mas não cumpre ainda o contrato de produto com a equipe Techmalhas.**  
> Liberar Vitor e Amanda hoje = alta chance de churn na semana 1 (Patrícia).  
> Abrir webchat/formulário ao público sem Sprint 2 = risco LGPD e abuso (Arnaldo + Quésia).  
> **Caminho recomendado:** Sprint 1 (produto P0) → Sprint 2 (segurança/QA) → piloto interno 1 semana → depois widget Irroba.

---

## Arquivos desta rodada

```
squads/crm-techmalhas/output/2026-05-25/
├── audit-patricia-produto.md
├── audit-davi-design.md
├── audit-fabio-codigo.md
├── audit-quesia-qualidade.md
├── audit-arnaldo-arquitetura.md
└── audit-consolidado-executivo.md   ← este arquivo
```

---

*Próximo checkpoint sugerido com Tania: decisão sequencial (Recovery antes de webchat) vs paralelo com 2º dev — Patrícia §6.4.*
