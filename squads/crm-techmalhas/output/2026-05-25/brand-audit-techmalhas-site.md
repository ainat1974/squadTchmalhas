# Auditoria de Marca — Site techmalhas.com.br (referência real)

> **Data:** 2026-05-25
> **Método:** Inspeção ao vivo via Chrome DevTools MCP (`evaluate_script` em `document.querySelectorAll('*')`)
> **Objetivo:** Estabelecer a paleta de cores e tipografia **reais** do site público da Techmalhas, para servir como fonte da verdade no redesign do CRM (ADR-009 a definir pelo Davi).

---

## 1. Paleta real extraída (top usos por frequência)

### 1.1 Cores de texto (`color`)

| Hex | RGB | Frequência | Função no site |
|---|---|---|---|
| `#141414` | rgb(20, 20, 20) | **2046×** | Texto principal (dominante) |
| `#FFFFFF` | rgb(255, 255, 255) | 123× | Texto sobre fundo escuro |
| `#000000` | rgb(0, 0, 0) | 113× | Bordas, ícones de máximo contraste |
| `#6C6A77` | rgb(108, 106, 119) | 54× | Texto secundário, metadados |
| `#676767` | rgb(103, 103, 103) | 36× | Texto descritivo (preço barrado, etc.) |
| `#ADADAD` | rgb(173, 173, 173) | 23× | Texto desabilitado, placeholders |
| `#E79501` | rgb(231, 149, 1) | 13× | **Acento âmbar/dourado** (estrelas, "Mais vendidos") |
| `#212529` | rgb(33, 37, 41) | 13× | Variante de preto (Bootstrap default) |

### 1.2 Cores de fundo (`background-color`)

| Hex | RGB | Frequência | Função no site |
|---|---|---|---|
| `#FFFFFF` | rgb(255, 255, 255) | 78× | Background body / cards |
| `#141414` | rgb(20, 20, 20) | 58× | Header / botões principais |
| `#869791` | rgb(134, 151, 145) | **15×** | **Verde sage muted** — fundos de seção de destaque |
| `#000000` | rgb(0, 0, 0) | 7× | Bordas/divisores grossos |
| `#D6D6D6` | rgb(214, 214, 214) | 7× | Backgrounds neutros, separadores |
| `#F0F0F0` | rgb(240, 240, 240) | 1× | Botão secundário |
| `#F9F2C4` | rgb(249, 242, 196) | 1× | Banner de aviso amarelo claro |
| `#CC4833` | rgb(204, 72, 51) | 1× | **Terracota** — call-to-action ocasional |
| `#F3F6F4` | rgb(243, 246, 244) | 1× | Verde-acinzentado claríssimo |
| `#2FC400` | rgb(47, 196, 0) | 1× | Selo "OK" / disponibilidade |

### 1.3 Fontes (`font-family`)

| Família | Frequência | Origem |
|---|---|---|
| **Hind** | 2125× | Google Fonts — sans-serif geométrica, ótima legibilidade |
| Material Icons | 136× | Ícones |
| sans-serif (fallback) | 101× | — |
| Montserrat | 45× | Google Fonts — títulos secundários |
| Poppins | 7× | Google Fonts — uso pontual |

---

## 2. Paleta sintetizada (para o design system)

### 2.1 Cores fundamentais (extraídas do site)

```css
/* ─── Brand Core (literais do site) ──────────────── */
--brand-ink:        #141414;  /* Preto Techmalhas (dominante, 2046×) */
--brand-paper:      #FFFFFF;  /* Branco puro */
--brand-gold:       #E79501;  /* Âmbar / dourado — acento principal */
--brand-sage:       #869791;  /* Verde sage muted — destaques de seção */
--brand-terracotta: #CC4833;  /* Terracota — CTA ocasional */

/* ─── Brand Neutrals (escala extraída) ──────────── */
--neutral-900:      #141414;  /* mesmo que brand-ink */
--neutral-800:      #212529;
--neutral-700:      #676767;
--neutral-600:      #6C6A77;
--neutral-500:      #ADADAD;
--neutral-400:      #D6D6D6;
--neutral-300:      #F0F0F0;
--neutral-200:      #F7F7F7;
--neutral-100:      #F9FAFB;  /* derivado */
--neutral-paper:    #FFFFFF;
```

### 2.2 Variantes hover/light (calculadas)

```css
/* Hover: 10% darker via HSL */
--brand-ink-hover:        #000000;
--brand-gold-hover:       #C97D00;
--brand-sage-hover:       #6F7F7B;
--brand-terracotta-hover: #A83A28;

/* Light backgrounds: para badges/chips */
--brand-gold-light:       #FFF5E1;
--brand-sage-light:       #EEF2F0;
--brand-terracotta-light: #FBE5E0;
```

---

## 3. Tipografia recomendada

### 3.1 Cabeçalho da decisão

- **Primária:** `Hind` (Google Fonts, mesmo do site)
- **Display (títulos grandes, hero):** `Hind` weight 700 — para coerência
- **Mono (números KPI):** `JetBrains Mono` ou `IBM Plex Mono` (não está no site, mas adiciona um toque "futurista" que evita TUM look "old web")

### 3.2 Fallback stack

```css
font-family:
  'Hind',
  'Inter',                /* fallback elegante caso Hind falhe */
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  sans-serif;
```

> **Justificativa:** o site usa Hind como dominante. Mantemos Hind no CRM para coerência de marca. Inter fica como fallback porque já estava configurada (zero esforço de migração no `next/font`).

---

## 4. Estética geral do site (observações qualitativas)

| Característica | Valor observado | Implicação para CRM |
|---|---|---|
| **Aesthetic** | Minimalista editorial / fashion | CRM deve ser limpo, com whitespace generoso |
| **Border radius dominante** | 0px (alguns botões 3px) | Adotar `--radius-sm: 4px`, `--radius-md: 8px` (CRM precisa de mais arredondado que site retail, mas evitar pills excessivos) |
| **Sombras** | Praticamente inexistentes no site | Sombras sutis no CRM (`shadow-sm` e `shadow-md`), reserve `shadow-xl` para modais/drawers |
| **Densidade** | Alta no grid de produtos, baixa no header | Bom benchmark: Kanban denso, drawers respiráveis |
| **CTA dominante** | Preto puro com texto branco (não verde) | **Mudar primary do CRM de verde floresta `#1A6B3C` para preto `#141414` é a maior coerência com a marca** |
| **Acento de destaque** | Âmbar `#E79501` (estrelas, "mais vendidos") | Usar `--brand-gold` para badges, highlights, "novo", "destaque" |
| **Verde como cor** | Apenas sage muted em seções, não como cor de ação | Verde sage pode ser usado em backgrounds suaves; NÃO usar verde forte como primary |

---

## 5. Confronto: paleta atual do CRM vs paleta real do site

| Camada | CRM atual (deployed) | Site real (verdade) | Diferença |
|---|---|---|---|
| Primary CTA | `#1A6B3C` verde floresta | `#141414` preto | ❌ Radicalmente diferente |
| Accent | `#C97A2F` caramelo | `#E79501` dourado/âmbar | ⚠️ Mesma família, mas mais vibrante |
| Texto principal | `#1A1A1A` grafite | `#141414` ink | ✅ Praticamente idêntico |
| Background | `#F8F9FA` off-white | `#FFFFFF` branco puro | ⚠️ Sutil — site é mais branco puro |
| Font | Inter | Hind | ❌ Famílias diferentes (Hind é mais geométrica) |

**Conclusão:** o design system v3 do CRM (verde floresta + caramelo) foi uma interpretação criativa do designer, não uma extração da marca real. A decisão da Tania (2026-05-25) foi seguir a **paleta real do site** com evolução premium futurista.

---

## 6. Logo da marca

- **URL:** `https://img.irroba.com.br/filters:format(webp):fill(transparent):quality(80)/techmalh/catalog/logo-techmalhas-00.png`
- **Formato:** PNG transparente
- **Implicação:** logo funciona sobre fundo claro E escuro. No CRM, usar variante:
  - Sobre branco (sidebar light) → versão preta
  - Sobre preto (header dark, dark mode) → versão branca
  - Pedir à Tania ambas as variantes ou recriar como SVG no design system

---

## 7. Próximos passos (para o Davi)

1. Construir **design system v4** baseado nesta paleta literal + evolução premium (glassmorphism, micro-interações, gradientes sutis, sombras coloridas, dark mode polido)
2. Atualizar `crm-app/app/globals.css` com novos tokens HSL
3. Configurar Hind via `next/font/google` no `crm-app/app/layout.tsx`
4. Mockups das 5 telas-chave: Login, Dashboard, Pipeline Kanban, Leads, Chat
5. Documentar componentes que precisam de retrabalho (botões, cards, sidebar, KPI cards)
6. Acessibilidade WCAG AA mantida (testar contraste de todas as novas combinações)

---

## 8. Anexos visuais (capturados ao vivo)

- `reference-site-techmalhas-home.png` — viewport home do site
- `reference-site-techmalhas-fullpage.png` — página inteira do site (full scroll)
- `current-crm-login.png` — tela de login atual do CRM em produção
- `current-crm-dashboard.png` — dashboard atual do CRM (preview mode)
- `current-crm-kanban.png` — pipeline Kanban atual do CRM (preview mode)
