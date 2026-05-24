# Quality Criteria — CRM Techmalhas

> Critérios de qualidade aplicáveis a TODOS os entregáveis do squad.
> Cada agente também define critérios específicos no seu próprio arquivo.

---

## Critérios Universais (todos os entregáveis)

- [ ] **Em português (Brasil)** para texto orientado ao usuário; código em inglês
- [ ] **Específico para Techmalhas** — nunca genérico ("uma empresa qualquer")
- [ ] **Considera dualidade Atacado/Varejo** quando aplicável
- [ ] **Cita fontes** quando faz afirmações sobre o Clint, Dapic ou Meta
- [ ] **Sem fluff** — direto ao ponto, sem encheção de linguiça
- [ ] **Versionável** — arquivo único, markdown, sem dependências externas

---

## Critérios por Tipo de Entregável

### 📋 Documentos de Requisitos (Patrícia Produto)

- [ ] User Stories no formato `Como [persona], quero [ação] para [benefício]`
- [ ] Cada story tem **critérios de aceitação** (Given/When/Then)
- [ ] Priorização clara: 🔴 Essencial / 🟡 Importante / 🟢 Nice-to-have
- [ ] Personas referenciadas com nome (Vitor, Amanda, Renato, José)
- [ ] **Estimativa de esforço** por story (P, M, G, GG)
- [ ] Backlog em ordem de execução (não alfabético)
- [ ] Dependências explícitas (story X precisa da Y)

### 🎨 Wireframes (Davi Designer)

- [ ] Cobre TODAS as telas-chave: Login, Pipeline, Lead Detail, Chat, Tasks, Dashboard
- [ ] Versão **mobile** (375px) e **desktop** (1280px) para cada tela
- [ ] Indica **estados**: loading, vazio, erro, sucesso
- [ ] Componentes nomeados com IDs (`btn-create-lead`, `card-deal-123`)
- [ ] Hierarquia visual clara (importância → tamanho/posição)
- [ ] Acessibilidade básica: contraste ≥ 4.5:1, foco visível, labels nos inputs

### 🏗️ Arquitetura (Arnaldo Arquiteto)

- [ ] **Diagrama de componentes** em ASCII ou Mermaid
- [ ] **ERD completo** com tipos de coluna, índices e constraints
- [ ] **API specification** (endpoints, métodos, payloads Zod, status codes)
- [ ] **ADRs (Architecture Decision Records)** para decisões controversas
  - Ex: Por que Prisma e não Drizzle?
  - Ex: Por que Supabase e não Neon?
- [ ] **Plano LGPD** — quais dados, retenção, consentimento, audit
- [ ] **Plano de deploy** — variáveis de ambiente, scripts, custos estimados
- [ ] **Diagrama de integração** com WhatsApp Cloud API (auth, webhook, send)

### 💻 Código (Fábio Fullstack)

- [ ] **TypeScript estrito** (`strict: true`, `noUncheckedIndexedAccess: true`)
- [ ] **Zod** valida toda entrada de API
- [ ] **Variáveis em `.env.example`** documentadas, nunca segredos no código
- [ ] **Estrutura de pastas** segue o framework (`app/`, `components/`, `lib/`, etc.)
- [ ] **Componentes < 200 linhas** — se passa, refatora
- [ ] **Imports absolutos** com alias `@/` configurado
- [ ] **Sem `any`** (use `unknown` + narrow)
- [ ] **Tratamento de erro** em toda chamada externa (DB, API Meta)
- [ ] **README** com instruções de setup local (`pnpm install` → `pnpm dev`)
- [ ] **Migrations** versionadas e idempotentes

### 🧪 Testes (Quésia Qualidade)

- [ ] **5 fluxos E2E** cobertos com Playwright
- [ ] **>70% coverage** em `lib/` (regras de negócio)
- [ ] Cada teste tem **descrição clara** do que valida (BDD-style)
- [ ] Testes rodam em CI (GitHub Actions) e localmente sem flakiness
- [ ] **Dados de teste** isolados (não polui DB principal)
- [ ] **Relatório de testes** em markdown com resultados + screenshots de falhas

### 📚 Documentação (Quésia Qualidade)

- [ ] **README.md** completo (overview, setup, scripts, deploy)
- [ ] **Guia do usuário** com capturas de tela (Kanban, criar lead, completar task)
- [ ] **Guia do admin** (gerenciar usuários, configurar pipeline, integrar WhatsApp)
- [ ] **Guia de operação** (logs, monitoramento, troubleshooting)
- [ ] **Changelog** com versão e data
- [ ] Linguagem **acessível** — sem jargão para guia do usuário

---

## Critérios de Reprovação (Veto)

Se QUALQUER um destes for verdadeiro, o entregável é rejeitado e refeito:

1. ❌ Genérico — funciona pra "qualquer empresa", não específico Techmalhas
2. ❌ Inclui feature fora do MVP aprovado (escopo creep)
3. ❌ Quebra LGPD (expõe dado pessoal sem consentimento ou log)
4. ❌ Hardcoda segredo (token, password, API key) em código
5. ❌ Wireframe sem versão mobile
6. ❌ Código sem TypeScript estrito ou com `any` sem justificativa
7. ❌ Documento sem TL;DR ou estrutura clara
8. ❌ Inventou dado/fato sobre Clint, Meta ou Dapic sem citar fonte
