---
execution: subagent
agent: ux-designer
inputFile: squads/crm-techmalhas/output/wireframes.md
outputFile: squads/crm-techmalhas/output/design-system.md
model_tier: fast
---

# Step 05: Design System (cores, tipografia, componentes)

## Context Loading

Load these files before executing:
- `squads/crm-techmalhas/output/wireframes.md` — telas e componentes propostos
- `_opensquad/_memory/company.md` — identidade Techmalhas (slogan "Casual que dura. Conforto que você sente.")
- `squads/crm-techmalhas/pipeline/data/output-examples.md` — exemplo de tokens

## Instructions

### Process

1. **Definir paleta de cores Techmalhas** — extrair sensação da marca (casual, qualidade, brasileiro, durável) em cores. Primárias + neutras + semânticas (sucesso/aviso/erro/info) + cores das stages de pipeline.
2. **Validar contraste WCAG AA** — testar cada combinação fg/bg, mínimo 4.5:1 para texto normal, 3:1 para texto grande/UI.
3. **Definir tipografia** — Inter ou Geist como sistema; escala (xs, sm, base, lg, xl, 2xl, 3xl, 4xl); pesos (regular, medium, semibold, bold); line-heights.
4. **Definir escala de espaçamento** — base 4px (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20).
5. **Definir radii e shadows** — bordas (none, sm, md, lg, full); sombras (sm, md, lg, xl).
6. **Definir animações** — duração (fast 150ms, base 200ms, slow 300ms); easing.
7. **Mapear cada token para `tailwind.config.ts`** — entregar config pronta para Fábio Fullstack copiar.
8. **Listar componentes shadcn/ui necessários** com versão de customização.
9. **Produzir documento** seguindo Output Format.

## Output Format

```markdown
# Design System — CRM Techmalhas

> **TL;DR:** Paleta neutra com acento [cor] da Techmalhas, tipografia Inter, escala 4px, shadcn/ui customizado.

## 1. Princípios Visuais
[3-5 princípios]

## 2. Cores

### Marca
| Token | Hex | Uso |

### Semânticas
| Token | Hex | Contraste vs branco | Uso |

### Pipeline Stages
| Token | Hex | Bg / Texto |

## 3. Tipografia
[Escala, pesos, line-heights]

## 4. Espaçamento
[Escala completa]

## 5. Bordas e Sombras

## 6. Animações

## 7. Configuração tailwind.config.ts
\`\`\`typescript
[código completo]
\`\`\`

## 8. globals.css (CSS variables)
\`\`\`css
[código completo]
\`\`\`

## 9. Componentes shadcn/ui Necessários
[Lista com versão de customização]
```

## Output Example

```markdown
# Design System — CRM Techmalhas

> **TL;DR:** Paleta neutra (graphite + off-white) com acento vermelho da marca,
> tipografia Inter, escala de 4px, shadcn/ui customizado.

## 1. Princípios Visuais

1. **Legibilidade primeiro** — contraste alto, fontes grandes em mobile (16px base)
2. **Densidade contextual** — Kanban denso (cards compactos), Detalhe leve (whitespace)
3. **Consistência radical** — toda primitiva mesma altura (40px); mesmas bordas (md)
4. **Branding sutil** — vermelho Techmalhas em destaques, não em ações primárias (que usam azul ação)

## 2. Cores

### Marca
| Token | Hex | Uso |
|---|---|---|
| `color-brand-graphite` | `#1A1A1A` | Texto principal, ícones, header |
| `color-brand-offwhite` | `#FAFAFA` | Background do app |
| `color-brand-accent` | `#E63946` | Slogan, badge "Novo", elementos da marca |

### Semânticas (todas validadas WCAG AA contra branco)
| Token | Hex | Contraste | Uso |
|---|---|---|---|
| `color-action-primary` | `#2563EB` | 4.6:1 ✅ | CTA principal, links |
| `color-action-success` | `#16A34A` | 4.7:1 ✅ | Deal ganho, sucesso |
| `color-action-warning` | `#D97706` | 4.5:1 ✅ | Próximo de vencer |
| `color-action-danger` | `#DC2626` | 5.9:1 ✅ | Excluir, perdido |
| `color-action-info` | `#0891B2` | 4.7:1 ✅ | Informação contextual |

### Pipeline Stages
| Token | Hex bg | Texto |
|---|---|---|
| `color-stage-new` | `#E2E8F0` | `#0F172A` |
| `color-stage-contact` | `#DBEAFE` | `#1E3A8A` |
| `color-stage-proposal` | `#FEF3C7` | `#78350F` |
| `color-stage-negotiation` | `#FED7AA` | `#7C2D12` |
| `color-stage-won` | `#16A34A` | `#FFFFFF` |
| `color-stage-lost` | `#DC2626` | `#FFFFFF` |

## 3. Tipografia
- **Família:** Inter (sistema), fallback `-apple-system, BlinkMacSystemFont, sans-serif`
- **Escala (mobile / desktop):**
  - `text-xs`: 12px / 12px
  - `text-sm`: 14px / 14px
  - `text-base`: 16px / 16px
  - `text-lg`: 18px / 18px
  - `text-xl`: 20px / 20px
  - `text-2xl`: 24px / 24px
  - `text-3xl`: 30px / 30px
- **Pesos:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Line-heights:** 1.5 para corpo, 1.2 para títulos

## 4. Espaçamento (base 4px)
0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px

## 5. Bordas e Sombras
- **Radius:** `none`, `sm` (4px), `md` (8px), `lg` (12px), `full` (9999px)
- **Shadows:** `sm`, `md`, `lg`, `xl` (presets do Tailwind)

## 6. Animações
- **Duração:** fast 150ms, base 200ms, slow 300ms
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind default)

## 7. Configuração tailwind.config.ts

\`\`\`typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          graphite: '#1A1A1A',
          offwhite: '#FAFAFA',
          accent: '#E63946',
        },
        action: {
          primary: '#2563EB',
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
          info: '#0891B2',
        },
        stage: {
          new: { bg: '#E2E8F0', fg: '#0F172A' },
          contact: { bg: '#DBEAFE', fg: '#1E3A8A' },
          proposal: { bg: '#FEF3C7', fg: '#78350F' },
          negotiation: { bg: '#FED7AA', fg: '#7C2D12' },
          won: { bg: '#16A34A', fg: '#FFFFFF' },
          lost: { bg: '#DC2626', fg: '#FFFFFF' },
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
} satisfies Config;
\`\`\`

## 8. globals.css
\`\`\`css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { @apply bg-brand-offwhite text-brand-graphite font-sans; }
}
\`\`\`

## 9. Componentes shadcn/ui Necessários
| Componente | Customização |
|---|---|
| Button | variants: default (azul ação), destructive (vermelho), outline, ghost; size: sm, default, lg |
| Card | padding default `p-4`, radius `md`, shadow `sm` |
| Sheet (drawer) | side: right (desktop), bottom (mobile) |
| Dialog | usar para confirmações destrutivas |
| Form, Input, Label, Select, Textarea | tokens da paleta |
| Badge | variants para stages |
| Toast | colors semânticas |
| Avatar, AvatarImage, AvatarFallback | iniciais coloridas |
| Tabs | para drawer de lead detail |
| DropdownMenu | menu de ações nos cards |
```

## Veto Conditions

Reject and redo if ANY are true:
1. Alguma combinação fg/bg não passa em WCAG AA (4.5:1)
2. Cores nomeadas por hex em vez de token semântico
3. Falta configuração `tailwind.config.ts` pronta para copiar
4. Pipeline stages sem cor diferenciada

## Quality Criteria

- [ ] Paleta com cores de marca + semânticas + stages
- [ ] Todas as combinações WCAG AA verificadas
- [ ] Tipografia, espaçamento, bordas, sombras documentados
- [ ] `tailwind.config.ts` completo
- [ ] `globals.css` com variáveis CSS
- [ ] Componentes shadcn listados com customização
