# ADR-009: Redesign do CRM com Paleta Real Techmalhas + Camada Premium (Sem Glassmorphism) + Dark Mode

**Data:** 2026-05-25 (rev. 1 — pós-decisão Tania sobre glass + dark mode)
**Status:** Aprovado nas premissas, aguardando go/no-go da Tania para iniciar T1
**Decisor:** Davi Designer (UX/UI do squad)
**Aprovador:** Tania (Techmalhas, PO)
**Auditoria base:** `brand-audit-techmalhas-site.md` (extração ao vivo via Chrome DevTools MCP)
**Implementação:** Fábio Fullstack (estimativa 14–17h, target **15h**, em branch `feat/design-system-v4`)
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
(micro-interações, sombras coloridas, dark mode polido) que
posicione o CRM como ferramenta moderna, **sem cair em over-design** ou perder
a identidade editorial do site.

**Decisões adicionais da Tania (revisão 1 deste ADR, 2026-05-25):**

1. ✅ Verde → Preto `#141414` (primary CTA) — aprovado.
2. ❌ **Glassmorphism rejeitado.** A Tania **não tolera paridade visual diferente entre desktop e mobile/iOS antigo/WebView** — o fallback `@supports not(backdrop-filter)` da v4 original criaria duas experiências visuais para a mesma feature, o que é inaceitável. **Substituído por `.surface-premium` sólida + `.border-gradient-brand` + hover lift pronunciado**, que funciona idêntico em 100% dos browsers do tráfego.
3. ✅ **Dark mode firmado dentro da v4** (não adiado para v4.1). Adiciona 1.5h ao plano de migração; matriz de contraste WCAG AA recalculada para todos os pares no tema escuro.

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
| F7 | Mobile-first (Vitor com celular em loja) | Paridade visual cross-device obrigatória; touch targets ≥ 44px; **glass rejeitado** porque depende de `backdrop-filter` (Safari < 17 e WebView in-app não suportam consistente) |
| F8 | Custos de implementação devem ser limitados | Estimativa precisa caber em 2 dias de trabalho do Fábio (**15h target**) |
| F10 | Tania não aceita inconsistência visual entre dispositivos | Forçou rejeição do glassmorphism (rev. 1 deste ADR) |
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

### Opção C (rev. 1) — Paleta literal **+ camada futurista cirúrgica SEM glassmorphism + dark mode firmado** (recomendado)

- ✅ **Prós:**
  - Marca real preservada (preto/branco/dourado/sage como tokens base).
  - Camada futurista cirúrgica via: `.surface-premium` sólida com inner highlight 3D, `.border-gradient-brand` (gold→sage), sombras coloridas duplas (gold-glow + ink-shadow), hover lift -3px, mesh gradient + 3 orbs no login, `ring-pulse` animado em focus, KPI glow gold no hover, skeleton shimmer com tint dourado, micro-interações ≤ 250ms.
  - **Paridade visual cross-device 100%** — nenhuma técnica depende de `backdrop-filter`, `mask-image` ou feature de browser moderno.
  - **Dark mode firmado** — não adiado, matriz WCAG AA validada nos dois temas.
  - WCAG AA preservado (matriz de contraste recalculada light + dark).
  - Aliases de compatibilidade (`bg-brand-500 → ink`) garantem que código existente não quebra durante a migração.
  - Estimativa 14–17h cabe em 2 dias do Fábio.
- ❌ **Contras:**
  - Mais surface de regressão (13 tarefas de migração).
  - Hind como nova font primary introduz risco mínimo de CLS (mitigado com `display: swap`).
  - Dark mode pode ter FOUC inicial (mitigado via script inline do `next-themes`).
- ⚠️ **Risco:** **médio-baixo** (risco do glass foi removido). Mitigado por: branch separada, commits incrementais (10 commits sugeridos), QA da Quésia ao final, deploy só após aprovação Tania.
- ⏱️ **Tempo:** **15h target** (faixa 14–17h).

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

**Adotar Opção C (rev. 1) — paleta literal do site + camada futurista cirúrgica SEM glassmorphism + dark mode firmado.**

### Justificativa técnica

1. **Marca real é fonte da verdade.** A Tania ver o CRM e o site da Techmalhas
   com a mesma DNA cromática (preto + dourado + sage) é mais valioso do que
   qualquer interpretação criativa do squad anterior. O preto domina o site (2.046×)
   por uma razão: a marca Techmalhas é editorial, sóbria, com confiança ganha
   em 30 anos. CRM deve refletir isso.

2. **Camada futurista é cirúrgica E cross-device.** As 10 técnicas premium
   adotadas (`.surface-premium`, `.border-gradient-brand`, sombras coloridas
   duplas, hover lift, mesh + orbs, micro-interações, stagger elaborado,
   focus ring com pulse 1×, skeleton shimmer dourado, KPI glow gold) **funcionam
   idênticas em 100% dos browsers do tráfego**. Glassmorphism foi explicitamente
   rejeitado pela Tania para garantir paridade visual entre desktop e iOS antigo /
   WebView in-app — força de design (F10) sem trade-off.

3. **Dark mode firmado não-opcional.** A Tania decidiu incluí-lo na v4 desde
   o início. WCAG AA recalculado para 9 pares no dark; primary faz swap
   inteligente para gold (ink sobre ink no dark some). Toggle opt-in com default
   light (preferência `_memory/preferences.md`), mas tema dark está pronto e
   navegável desde o primeiro deploy v4.

4. **Acessibilidade preservada e recalculada.** A matriz WCAG AA cobre 15
   combinações light + 9 dark; nenhuma regressão; alguns combos sobem para AAA
   (ex.: ink sobre paper passa de 18.7:1; texto principal dark 18.1:1).

5. **Retrocompatibilidade explícita.** Aliases no `tailwind.config.ts`
   garantem que `bg-brand-500` continua existindo — só muda **cor**. Fábio
   não precisa refatorar todos os call-sites; o sistema "vira de cor" com
   2 arquivos editados (T1 + T2).

6. **Custo cabe no operating model.** 15h estimadas = 2 dias úteis do Fábio,
   alinhado ao ADR-007 ("Implementação > 4h com escopo definido = Fábio").
   Sem glass economiza ~1h (sem `@supports`, sem testar Safari); dark mode
   firmado adiciona 1.5h.

### Não-decisões (escopo do v4)

- ✋ **Não estamos** redesenhando a IA conversacional (Amanda) nem o domínio do CRM (pipeline stages, canais, regras de tarefa obrigatória) — só o chrome visual.
- ✋ **Não estamos** trocando a stack de UI (Tailwind 4 + shadcn/ui permanece).
- ✋ **Não estamos** removendo Inter — fica como fallback no `next/font` (custo zero).
- ✋ **Não estamos** forçando dark mode como tema padrão — fica opt-in, default light. **Mas** o dark mode é parte da v4, não adiado.
- ✋ **Não estamos** usando glassmorphism em nenhum lugar — `backdrop-filter` proibido no codebase v4.

---

## Consequências

### Positivas

- ✅ **Alinhamento de marca total** entre site Techmalhas e CRM. Tania ganha argumento de "produto coerente" ao mostrar para qualquer pessoa.
- ✅ **Posicionamento premium cross-device** (surfaces sólidas com inner highlight + sombras coloridas duplas + border-gradient + mesh) — sinaliza competência do time de IA. **Mesma experiência visual em todos os dispositivos.**
- ✅ **Dark mode polido e firmado** disponível para Vitor/Ana que trabalham à noite ou preferem.
- ✅ **WCAG AAA em pontos críticos** light (texto principal 18.7:1; CTA primary 18.7:1) **e dark** (texto principal 18.1:1) — superior ao v3 em vários combos.
- ✅ **Font Hind** importada via `next/font/google` (mesmo mecanismo que Inter, sem complexidade adicional).
- ✅ **Skeletons shimmer com tint dourado-sutil** substituem `animate-pulse` (sensação de loading mais sofisticada, com marca presente até no loading).
- ✅ **Compatibilidade preservada** — código existente não precisa ser tocado se não quisermos.
- ✅ **Risco do `backdrop-filter` eliminado** — não há mais necessidade de testar/manter fallback Safari/WebView.

### Negativas / riscos aceitos

- ⚠️ **Surface de regressão.** 13 tarefas de migração; bug pode entrar em qualquer ponto. **Mitigação:** branch separada + commits incrementais + checklist de QA da Quésia.
- ⚠️ **Hind tem métricas diferentes de Inter.** Risco mínimo de CLS no primeiro paint. **Mitigação:** `display: 'swap'`, fallback Inter no stack, Lighthouse CLS deve permanecer < 0.05.
- ⚠️ **Dark mode FOUC** (flash de tema no primeiro paint). **Mitigação:** script inline do `next-themes` aplica classe antes da hidratação.
- ⚠️ **Inner-highlight branca no dark** ficaria estranha se aplicada literal. **Mitigação:** já tratado no CSS (`.dark .surface-premium` troca por inner-highlight gold sutil 12%).
- ⚠️ **Custo cognitivo da Tania durante demo.** Após deploy, a Tania vai abrir o CRM e ver tudo preto/dourado em vez de verde. **Mitigação:** demo guiada antes do merge; rollback em 1 commit se necessário.
- ⚠️ **Cap de animação 250ms** (mais conservador que v3 que tinha 500ms). Decisão deliberada para uso prolongado. **Exceção:** `ring-pulse` 600ms 1× (não infinito, OK pelo princípio da rariedade).
- ⚠️ **Dark mode dobra a surface de QA.** Quésia precisa validar ~60 pontos visuais em dois temas. **Mitigação:** checklist explícito no `migration-plan-v4.md` separa light/dark.

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

## Critérios de aceite (todos resolvidos pela Tania em 2026-05-25)

- [x] **Tania confirmou** que prefere preto/dourado/sage (paleta real) a verde floresta (v3).
- [x] **Tania confirmou** que aceita o investimento de 14–17h do Fábio para a migração (target 15h).
- [x] **Tania confirmou** que dark mode entra na v4 desde o início (opt-in com default light).
- [x] **Tania confirmou** que a estética "futurista cirúrgica" (mesh + orbs marcantes + surfaces premium + sombras coloridas duplas + dark mode) é apropriada — vs alternativa mais sóbria (Opção B).
- [x] **Tania rejeitou** glassmorphism por exigir fallback diferente em Safari/WebView — prioriza paridade visual cross-device. Substituído por `.surface-premium` sólida.
- [x] **Tania entende** que o redesign **não** muda a UX funcional (pipeline stages, canais, drag-drop continuam idênticos).

**Status: nenhuma pergunta pendente.** Fábio liberado para iniciar T1 na branch `feat/design-system-v4`.

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
