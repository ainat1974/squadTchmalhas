# ADR-009: Redesign do CRM com Paleta Real Techmalhas + Camada Premium Futurista

**Data:** 2026-05-25
**Status:** Proposto
**Decisor:** Davi Designer (UX/UI do squad)
**Aprovador:** Tania (Techmalhas, PO)
**Auditoria base:** `brand-audit-techmalhas-site.md` (extração ao vivo via Chrome DevTools MCP)
**Implementação:** Fábio Fullstack (estimativa 14–18h em branch `feat/design-system-v4`)
**Validação:** Quésia QA (checklist em `migration-plan-v4.md`)

---

## Contexto

O CRM Techmalhas foi entregue na v3 (`output/2026-05-24-162435/v3/design-system.md`)
com uma paleta **verde floresta `#1A6B3C` + caramelo `#C97A2F`** que foi uma
*interpretação criativa* da identidade Techmalhas — não uma extração da marca real.

Na sprint de 2026-05-25, a tutora rodou uma auditoria literal do site público
`techmalhas.com.br` via Chrome DevTools MCP (`evaluate_script` percorrendo
`document.querySelectorAll('*')` agrupado por frequência) e descobriu que a
paleta da marca, de fato, é:

- **Preto `#141414`** (2.046× — texto principal **e** CTA dominante)
- **Branco `#FFFFFF`** (123× / 78× backgrounds)
- **Dourado `#E79501`** (acento — estrelas, "Mais vendidos")
- **Sage muted `#869791`** (verde acinzentado, fundos de seção)
- **Terracota `#CC4833`** (CTA ocasional)
- **Fonte Hind** (2.125× — não Inter)

**O verde floresta `#1A6B3C` do v3 não existe no site real.** A Tania, ao ver
a comparação lado-a-lado (`current-crm-login.png` vs `reference-site-techmalhas-home.png`),
aprovou a substituição da paleta para alinhar com a marca de verdade.

Adicionalmente, a Tania pediu que o redesign tenha **"aspecto digno da
competência do time de IA"** — ou seja, uma camada premium futurista
(glassmorphism, micro-interações, sombras coloridas, dark mode polido) que
posicione o CRM como ferramenta moderna, **sem cair em over-design** ou perder
a identidade editorial do site.

---

## Forças (constraints)

| # | Restrição | Implicação |
|---|---|---|
| F1 | Site real é a fonte da verdade da marca | Paleta v4 precisa derivar de auditoria literal, não de gosto pessoal |
| F2 | v3 já está em produção e o squad está mentalmente treinado | Mudar tudo radicalmente confunde Vitor/Ana (pipeline stages, canais devem ser preservados) |
| F3 | Tania não é técnica e nunca pediu "designer system" formalmente | Apresentar como evolução, não como reinvenção; minimizar trabalho do Fábio |
| F4 | Vitor usa CRM 6–8h/dia em campo | Camada futurista não pode cansar (cap 250ms em animações, glass com fallback) |
| F5 | WCAG AA é não-negociável (compromisso registrado no v3) | Toda nova combinação precisa ≥ 4.5:1 para texto |
| F6 | Tailwind 4 + shadcn/ui já configurados | Customizar via tokens HSL, não via override CSS direto |
| F7 | Mobile-first (Vitor com celular em loja) | Glass deve degradar para sólido em browsers antigos; touch targets ≥ 44px |
| F8 | Custos de implementação devem ser limitados | Estimativa precisa caber em 2 dias de trabalho do Fábio (16h target) |
| F9 | Quésia precisa conseguir validar visualmente | Checklist de QA precisa ser binário (visto/não visto), não subjetivo |

---

## Alternativas consideradas

### Opção A — Manter v3 verde floresta como está

- ✅ **Prós:** zero esforço, código deployado, time já calibrado.
- ❌ **Contras:** **diverge da marca real**. Tania olha o site e o CRM lado a lado e vê duas marcas diferentes. Comprometimento com identidade visual = 0. Não atende ao pedido explícito da Tania.
- ⚠️ **Risco:** baixo no curto prazo; **alto** quando a Techmalhas evoluir o site/loja e o CRM ficar visualmente órfão.
- ⏱️ **Tempo:** 0h.

### Opção B — Adotar paleta literal do site, sem camada futurista

- ✅ **Prós:** alinhamento de marca total; trabalho menor (~6h); zero risco de over-design.
- ❌ **Contras:** o site da Techmalhas tem estética **editorial/fashion** (minimalista, alta densidade, sem sombras). Aplicar literalmente em um CRM operacional cria sensação de "site de produto", não de **ferramenta de trabalho premium**. Não comunica a competência do time. Não atende a "digno do time de IA".
- ⚠️ **Risco:** baixo, mas Tania pediu explicitamente o tom premium.
- ⏱️ **Tempo:** ~6h.

### Opção C — Adotar paleta literal **+ camada futurista cirúrgica** (recomendado)

- ✅ **Prós:**
  - Marca real preservada (preto/branco/dourado/sage como tokens base).
  - Camada futurista (glass, sombras coloridas, mesh, dark mode) **opt-in por componente** — Sidebar e Login ganham; KanbanCards permanecem opacos para legibilidade.
  - WCAG AA preservado (matriz de contraste recalculada).
  - Aliases de compatibilidade (`bg-brand-500 → ink`) garantem que código existente não quebra durante a migração.
  - Estimativa 14–18h cabe em 2 dias do Fábio.
- ❌ **Contras:**
  - Mais surface de regressão (13 tarefas de migração).
  - `backdrop-filter` tem custo em Safari < 17 (mitigado com `@supports` fallback).
  - Hind como nova font primary introduz risco mínimo de CLS (mitigado com `display: swap`).
- ⚠️ **Risco:** **médio**. Mitigado por: branch separada, commits incrementais (10 commits sugeridos), QA da Quésia ao final, deploy só após aprovação Tania.
- ⏱️ **Tempo:** **16h estimado** (faixa 14–18h).

### Opção D — Redesign radical (system novo do zero, "design system 2.0")

- ✅ **Prós:** liberdade total para reimaginar UX.
- ❌ **Contras:**
  - **Treinar Vitor/Ana de novo** em pipeline stages, canais, mobile nav = perda de produtividade na operação real.
  - Quésia teria que revalidar **tudo** (testes de regressão completa).
  - Tempo estimado 40–60h.
  - Sem garantia de ROI (CRM já funciona; problema é só de identidade visual + delight).
- ⚠️ **Risco:** **alto**. Não justifica para uma evolução de chrome visual.
- ⏱️ **Tempo:** 40–60h.

---

## Decisão

**Adotar Opção C — paleta literal do site + camada futurista cirúrgica.**

### Justificativa técnica

1. **Marca real é fonte da verdade.** A Tania ver o CRM e o site da Techmalhas
   com a mesma DNA cromática (preto + dourado + sage) é mais valioso do que
   qualquer interpretação criativa do squad anterior. O preto domina o site (2.046×)
   por uma razão: a marca Techmalhas é editorial, sóbria, com confiança ganha
   em 30 anos. CRM deve refletir isso.

2. **Camada futurista é cirúrgica, não decorativa.** Cada uma das 9 técnicas
   premium adotadas (glass, sombras coloridas, mesh, micro-interações, stagger,
   dark mode, focus glow, shimmer, gradientes sutis) tem
   **quando usar / quando NÃO usar** documentado. KanbanCards permanecem opacos
   porque legibilidade densa importa mais que delight; Login e Sidebar ganham
   glass porque são pontos de "respiro" do produto.

3. **Acessibilidade preservada e recalculada.** A matriz WCAG AA cobre 15
   combinações novas; nenhuma regressão; alguns combos sobem para AAA
   (ex.: ink sobre paper passa de 18.7:1).

4. **Retrocompatibilidade explícita.** Aliases no `tailwind.config.ts`
   garantem que `bg-brand-500` continua existindo — só muda **cor**. Fábio
   não precisa refatorar todos os call-sites; o sistema "vira de cor" com
   2 arquivos editados (T1 + T2).

5. **Custo cabe no operating model.** 16h estimadas = 2 dias úteis do Fábio,
   alinhado ao ADR-007 ("Implementação > 4h com escopo definido = Fábio").

### Não-decisões (escopo do v4)

- ✋ **Não estamos** redesenhando a IA conversacional (Amanda) nem o domínio do CRM (pipeline stages, canais, regras de tarefa obrigatória) — só o chrome visual.
- ✋ **Não estamos** trocando a stack de UI (Tailwind 4 + shadcn/ui permanece).
- ✋ **Não estamos** removendo Inter — fica como fallback no `next/font` (custo zero).
- ✋ **Não estamos** tornando dark mode obrigatório — fica opt-in com default light (ADR registrado em `_memory/preferences.md`).

---

## Consequências

### Positivas

- ✅ **Alinhamento de marca total** entre site Techmalhas e CRM. Tania ganha argumento de "produto coerente" ao mostrar para qualquer pessoa.
- ✅ **Posicionamento premium** (glass, sombras coloridas, mesh) sem perder utilidade — sinaliza competência do time de IA.
- ✅ **Dark mode polido** disponível para Vitor/Ana que trabalham à noite ou preferem.
- ✅ **WCAG AAA em pontos críticos** (texto principal 18.7:1; CTA primary 18.7:1) — superior ao v3 em vários combos.
- ✅ **Font Hind** importada via `next/font/google` (mesmo mecanismo que Inter, sem complexidade adicional).
- ✅ **Skeletons shimmer** substituem `animate-pulse` (sensação de loading mais sofisticada).
- ✅ **Compatibilidade preservada** — código existente não precisa ser tocado se não quisermos.

### Negativas / riscos aceitos

- ⚠️ **Surface de regressão.** 13 tarefas de migração; bug pode entrar em qualquer ponto. **Mitigação:** branch separada + commits incrementais + checklist de QA da Quésia.
- ⚠️ **`backdrop-filter` em Safari antigo.** Custo de performance. **Mitigação:** fallback `@supports not` com `bg-card/95` sólido.
- ⚠️ **Hind tem métricas diferentes de Inter.** Risco mínimo de CLS no primeiro paint. **Mitigação:** `display: 'swap'`, fallback Inter no stack, Lighthouse CLS deve permanecer < 0.05.
- ⚠️ **Custo cognitivo da Tania durante demo.** Após deploy, a Tania vai abrir o CRM e ver tudo preto/dourado em vez de verde. **Mitigação:** demo guiada antes do merge; rollback em 1 commit se necessário.
- ⚠️ **Cap de animação 250ms** (mais conservador que v3 que tinha 500ms). Decisão deliberada para uso prolongado, mas pode parecer "menos delight" em demos curtas.

---

## Plano de saída (rollback)

Se a v4 introduzir problemas críticos detectados pela Quésia ou pela Tania:

1. **Quésia identifica** problema em validação final (antes do merge na main).
2. **Revertível em 1 commit:** `git revert <merge-commit>` retorna o `globals.css` e `tailwind.config.ts` para v3.
3. **Branch v4 fica congelada** para inspeção posterior; squad documenta lição aprendida.
4. **Custo de rollback:** ~15 min (commit + push + redeploy Vercel).

Após o deploy em produção, se um problema **operacional** for descoberto (Vitor reporta "não consigo ler X"):

1. **Toggle temporário:** adicionar feature flag `theme=v3` por URL (`?theme=v3`).
2. **Hotfix de token:** se for problema pontual de contraste, ajustar `--token` em `globals.css` (não requer redeploy do schema).
3. **Janela de rollback completo:** primeiros 7 dias após deploy, rollback é trivial (1 commit revert).

---

## Critérios de aceite (para Tania aprovar este ADR)

- [ ] **Tania confirma** que prefere preto/dourado/sage (paleta real) a verde floresta (v3).
- [ ] **Tania confirma** que aceita o investimento de 14–18h do Fábio para a migração.
- [ ] **Tania confirma** que dark mode pode ser opt-in (default light), sem priorizar adoção.
- [ ] **Tania confirma** que a estética "futurista cirúrgica" (glass + mesh no login + sombras coloridas) é apropriada — vs alternativa mais sóbria (Opção B).
- [ ] **Tania entende** que o redesign **não** muda a UX funcional (pipeline stages, canais, drag-drop continuam idênticos).

---

## Métricas de sucesso (a medir 14 dias após deploy)

| Métrica | Baseline (v3) | Target (v4) | Como medir |
|---|---|---|---|
| Lighthouse Performance (mobile) | ~85 | ≥ 85 | CI no PR |
| Lighthouse Accessibility | ~95 | 100 | CI no PR |
| Time-to-Interactive (login) | ~2.1s | ≤ 2.3s | Real User Monitoring (Vercel Analytics) |
| Bug reports relacionados a contraste | 0 | 0 | Tania/Quésia rastreiam |
| Sentimento "moderno/profissional" (Tania subjetivo) | 6/10 | ≥ 8/10 | Conversa após 7 dias de uso |
| Adoção de dark mode (% sessões com `class="dark"`) | n/a | 10–25% | Vercel Analytics custom event |

---

## Referências

- `brand-audit-techmalhas-site.md` — auditoria literal do site
- `design-system-v4.md` — especificação completa
- `wireframes-v4.md` — mockups das 5 telas-chave
- `globals-css-v4.patch.md` — patch CSS pronto
- `migration-plan-v4.md` — plano de execução (T1–T13)
- ADR-007 — modelo operacional PM-Tutora-Squad (justifica delegação para o Fábio)
- ADR-004 — estratégia de deploy (rollback rápido se necessário)
- `_opensquad/_memory/company.md` — contexto Techmalhas
- `_opensquad/_memory/preferences.md` — Tania prefere light como default

---

*ADR-009 — Davi Designer | CRM Techmalhas | 2026-05-25*
