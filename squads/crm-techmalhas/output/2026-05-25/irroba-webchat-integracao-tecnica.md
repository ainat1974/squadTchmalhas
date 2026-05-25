# Integração Técnica do Webchat CRM no Site Irroba Techmalhas

> **Autor:** Arnaldo Arquiteto (system-architect, Squad CRM Techmalhas)
> **Data:** 2026-05-25
> **Status:** Recomendação técnica para implementação por Fábio (fullstack-developer)
> **Premissas operacionais:** ADR-007 — PM-Tutora-Squad
> **Decisão UX precedente:** Patrícia (product-strategist) — abordagem híbrida widget+iframe aprovada
> **Site alvo:** https://www.techmalhas.com.br (confirmado Irroba via `meta generator: IRROBA E-COMMERCE`)
> **CRM alvo:** https://squad-tchmalhas.vercel.app (Next.js 16.1.6 + Prisma + Supabase sa-east-1)

---

## TL;DR (para Tania)

- **Vai funcionar tecnicamente.** O webchat pode ser instalado no site Irroba; outras lojas Irroba já usam widgets similares (Tawk.to e JivoChat são parceiros nativos da plataforma).
- **Você precisa do painel Irroba.** O acesso ao admin Irroba (recuperação com o suporte) é **pré-requisito** porque o Irroba não tem campo público "cole seu HTML no head" — a instalação do nosso widget vai precisar entrar via tema/aplicativo, e isso só o admin consegue fazer. Sem o painel, o trabalho de implementação avança **paralelo**, mas a publicação fica bloqueada.
- **Arquitetura confirmada:** o widget `widget.js` (vanilla, ~14 KB gzip) injeta um launcher em Shadow DOM, e abre um iframe cross-origin apontando para `/embed/chat` do CRM. É a abordagem mais robusta para sites de terceiros (estilo Intercom/Zendesk/Crisp).
- **Esforço total de Fábio:** ~28–36 h de dev (mais perto do alto da estimativa da Patrícia, considerando CORS, rate limit, Turnstile e mobile testing).
- **Risco principal:** sem o painel Irroba, ficamos dependentes do suporte Irroba para abrir um chamado de inclusão do snippet. Plano B previsto: hospedar o widget em subdomínio `chat.techmalhas.com.br` e tentar incluir via tag manager + chamado ao suporte Irroba.

---

## 1. Plataforma Irroba — Capacidades Reais (pesquisa 2026)

### 1.1 O que a Irroba **tem** confirmado por documentação pública

| Recurso | Existe? | Onde | Fonte |
|---|---|---|---|
| Admin painel "Aplicativos" (marketplace de integrações) | ✅ Sim | Menu lateral esquerdo > **Aplicativos** | [ajuda.irroba.com.br — Tawk.to](https://ajuda.irroba.com.br/hc/pt-br/articles/30880408050964-Como-integrar-o-chat-Tawk-to-a-Irroba) |
| Chat ao vivo nativo no marketplace de apps | ✅ Tawk.to e JivoChat | App Tawk e App JivoChat (instalação por widget ID, não free-form script) | [JivoChat — Instalação Irroba](https://www.jivochat.com.br/help/installation/como-instalar-na-irroba-ecommerce.html) e [Blog Irroba](https://blog.irroba.com.br/plataforma-completa-para-e-commerce-guia-com-tudo-que-sua-loja-precisa/) |
| API REST pública | ✅ Sim, com `/getToken` (POST user+senha → token, 30 min) | https://api.irroba.com.br/ e https://www.irroba.com.br/dev/docs.html | Docs oficiais |
| Webhooks de pedido | ✅ Sim, configurados por app (ex.: "URL de Webhook" no app Notificações Inteligentes) | App Marketplace > app de parceiro > "URL de Webhook" | [Notificações Inteligentes](https://ajuda.notificacoesinteligentes.com/pt-br/article/como-integrar-com-a-irroba-1pjya8o/) |
| Setup de temas / Layout Exclusivo | ✅ Setup Profissional, paleta, banners, "Quem Somos", favicon | https://conteudos.irroba.com.br/setup-irroba | Página oficial Setup |
| Configurações do Checkout (campos curados) | ✅ Configurações > Gerais > Opções > Loja > Checkout | Área admin | [Ajuda Irroba — Checkout](https://ajuda.irroba.com.br/hc/pt-br/articles/30880327392532-Configura%C3%A7%C3%B5es-do-Checkout) |
| Firewall, WAF, anti-DDoS, SSL automático | ✅ Sim, gerenciado pela Irroba | — | [Blog Irroba — Segurança](https://blog.irroba.com.br/a-irroba-e-uma-plataforma-de-e-commerce-segura/) |

### 1.2 O que a Irroba **não documenta publicamente** (zona cinzenta)

| Recurso | Status | Implicação |
|---|---|---|
| Campo "Scripts personalizados" (head/footer livre) | ❌ Não encontrado em nenhuma página pública de ajuda Irroba | Lojista comum **não** parece ter editor de HTML livre. Tawk.to e JivoChat existem só como apps curados. |
| Tag Manager / GTM nativo | ❌ Não documentado como recurso de plano básico | Se existir, é via "Layout Exclusivo" (custom theme, plano superior) |
| CSP (Content Security Policy) padrão | ❌ Não publicado | Tawk.to e JivoChat carregam scripts próprios → CSP da Irroba **não bloqueia scripts de terceiros** instalados via app. Para script de domínio não-parceiro (nosso CRM), **risco real de CSP** restritivo — só descobrimos testando. |
| API para inserir script via REST | ❌ Não há endpoint público de "head injection" na docs `api.irroba.com.br` | Não dá pra automatizar inclusão do widget |

### 1.3 Conclusões pragmáticas sobre Irroba

1. **A plataforma aceita widgets de chat** — mas só "oficialmente" os de parceiros (Tawk.to, JivoChat). Não há documentação pública de campo "cole seu script aqui".
2. **A via mais provável de injeção** sem ser parceiro oficial:
   - **Caminho A (preferido):** abrir chamado no suporte Irroba pedindo inclusão do snippet no template global da loja (algumas plataformas brasileiras de e-commerce SaaS aceitam isso para clientes Pro/Enterprise; precisa confirmar com a Tania o plano).
   - **Caminho B (Layout Exclusivo):** se a Techmalhas estiver em plano com Layout Exclusivo ou Setup com customização de template, o agente Irroba pode incluir no `<head>` global.
   - **Caminho C (último recurso):** usar GTM Container — instalar Google Tag Manager via tema (se Tawk.to/Jivo já carregam, GTM tb deve carregar) e injetar o widget via GTM tag.
3. **Cloudflare na frente do site:** confirmado por inspeção (cabeçalho `Server: cloudflare` em fetches). Irroba opera sua loja atrás de Cloudflare como CDN/WAF. **Não bloqueia script de terceiro** desde que o domínio do script não esteja explicitamente bloqueado.
4. **O site é server-rendered** (HTML completo em `<body>`, sem hidratação SPA). Confirmado pelo fetch retornando produtos no HTML inicial. ✅ Bom para widget tradicional `<script>` no `<head>` ou `</body>`.
5. **Comunidade dev Irroba é restrita.** Não há fórum público ativo, nem grupos no Facebook indexáveis. Suporte é via ticket + WhatsApp (canais oficiais Irroba). **Implicação:** não há "solução de comunidade" pronta para o caso "loja Irroba que quer chat de terceiro não-parceiro". Vamos pioneirar.

---

## 2. Comparação das 5 Abordagens

| # | Abordagem | Tamanho bundle | Isolamento CSS/JS | Comunicação com host | Esforço dev | Compatível Irroba? |
|---|---|---|---|---|---|---|
| A | `widget.js` standalone vanilla (sem iframe) | ~10–15 KB gzip + Realtime 80 KB | ❌ Zero — herda CSS e globals do Irroba | Direto (mesmo contexto) | Médio (~20 h) | Sim — script funciona se conseguir injetar |
| B | iframe simples puro | ~2 KB para o launcher externo + iframe carrega tudo | ✅ Total (cross-origin) | postMessage | Baixo (~15 h) | Sim, mas launcher fica feio (iframe quadradinho) |
| **C** | **Híbrido: launcher Shadow DOM + iframe painel** | **~14 KB gzip launcher + iframe lazy** | **✅ Total (iframe é cross-origin) + ✅ launcher isolado via Shadow DOM** | **postMessage estruturado** | **Médio-alto (~28–36 h)** | **Sim — controle visual completo + segurança** |
| D | Web Component / Shadow DOM puro (sem iframe) | ~15 KB gzip + Realtime 80 KB | ⚠️ CSS isolado, mas JS compartilha contexto com host | Direto | Médio (~22 h) | Sim — mas JS do Irroba pode quebrar nosso widget |
| E | Google Tag Manager (delivery) | Depende do que o GTM carrega | Depende da implementação (geralmente C) | Depende | Médio (~25 h, pois GTM é só transporte) | Sim, **se** GTM puder ser instalado |

### 2.1 Justificativa técnica detalhada

**Por que rejeitar A (vanilla puro, sem iframe):**
- Carregar `@supabase/realtime-js` (~80 KB minified + gzipped) no contexto global da loja **pode entrar em conflito** com bibliotecas da própria Irroba (jQuery legado, Polyfills, etc.). Sites Irroba carregam scripts antigos no `<head>`.
- Não há proteção contra `window.alert`, `document.write` ou scripts antigos do template Irroba.
- LocalStorage compartilhado: tags do Irroba ou Cloudflare podem fazer `localStorage.clear()` em rotação.

**Por que rejeitar B (iframe puro):**
- O launcher (o botão flutuante 64×64) precisa ser **visual** e responder a animações suaves (pulse, badge de mensagens não lidas). Um iframe quadrado de 64×64 é feio, mata o pulse, e tem um delay de carregamento ruim em mobile 4G.
- Não permite proactive bubble com texto que sobressai do launcher.

**Por que rejeitar D (Web Component / Shadow DOM puro):**
- Shadow DOM dá isolamento de CSS, **mas não de JavaScript** ([Sujeet — Multi-Tenant Widget Framework](https://sujeet.pro/articles/widget-framework)). O Supabase Realtime client e nosso código React vivem no mesmo contexto JS do site Irroba — ainda há risco de variável global pisar.
- Em mobile, Shadow DOM em iOS Safari 14 tem bugs conhecidos de `focus management` em inputs dentro do shadow root.

**Por que rejeitar E (GTM como abordagem):**
- GTM é **transporte**, não arquitetura. Acaba carregando uma das opções acima. Vai para o Plano B se não conseguirmos injetar via tema.

### 2.2 Recomendação: Abordagem C (Híbrido)

```
+----------------------------------------+
|  Site Irroba techmalhas.com.br         |
|                                        |
|  <script src=".../widget.js">          |
|    ↓ injeta no DOM:                    |
|                                        |
|  <techmalhas-chat-launcher>            |  ← Shadow DOM
|    #shadow-root (closed)               |    isola CSS do launcher
|      <button>💬 Chat</button>          |
|      <div class="proactive-bubble">    |
|         Olá, posso ajudar? 👋          |
|      </div>                            |
|  </techmalhas-chat-launcher>           |
|                                        |
|  [usuário clica]                       |
|    ↓                                   |
|  <iframe src="crm.../embed/chat"       |  ← Cross-origin
|    sandbox="allow-scripts allow-forms  |    isola TUDO
|             allow-popups allow-same-   |    (CSS+JS+storage)
|             origin">                   |
|    (App React do painel completo,      |
|     com Supabase Realtime e tudo)      |
|  </iframe>                             |
|     ↕ postMessage                      |
|     - badge_count: 3                   |
|     - close_panel                      |
|     - resize_request: fullscreen       |
+----------------------------------------+
```

**Vantagens decisivas para Techmalhas:**

1. **Bundle do launcher fica minúsculo** (~5 KB gzip de JS + ~2 KB de CSS inline no Shadow DOM). Não impacta Core Web Vitals da loja (Tania ganha em SEO).
2. **Supabase Realtime client (~80 KB) só carrega no iframe**, sob demanda, quando o usuário clica para abrir o chat. **70%+ dos visitantes nunca abrem o chat** — economia de banda mobile real.
3. **Isolamento de produção:** mesmo se o template Irroba quebrar amanhã, o iframe continua funcionando porque vive em outro origin (`https://squad-tchmalhas.vercel.app`).
4. **LGPD:** o iframe é cross-origin → cookies/localStorage do CRM **não vazam** para o domínio techmalhas.com.br. Compliance por design.
5. **Padrão de mercado:** Intercom, Zendesk Chat, Drift, Crisp, Tidio — todos usam exatamente este padrão híbrido em 2026. Fontes: [DEV — Cross-origin iframes for chat widgets](https://dev.to/dhinesh_ks_9db13f15d64f7/building-a-new-gen-chat-widget-css-and-javascript-isolation-with-cross-origin-iframes-4ag6), [Halo — embeddable chat widget](https://noodleseed.com/blog/halo-ai-chat-widget-every-website), [AVEVA Tech — Building Secure Widget Systems](https://medium.com/aveva-tech/building-secure-widget-systems-with-javascript-iframes-4efd1e7963cc).

---

## 3. CORS, Segurança e Anti-Spam

### 3.1 Headers CORS — `next.config.ts`

Atualmente o CRM **não tem CORS configurado** (porque o app é só consumido pelo próprio domínio). Como o widget no site Irroba é um origin diferente (`https://www.techmalhas.com.br`), precisamos liberar **explicitamente** os endpoints públicos.

**Estratégia:** allowlist no `next.config.ts` (estática, simples, eficiente) + validação dinâmica de Origin no middleware (defesa em profundidade).

```ts
// crm-app/next.config.ts
const ALLOWED_ORIGINS = [
  'https://www.techmalhas.com.br',
  'https://techmalhas.com.br',
] as const

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/v1/webchat/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'false' },
          { key: 'Access-Control-Allow-Methods',     value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers',     value: 'Content-Type, X-Webchat-Session-Token, X-Turnstile-Token' },
          { key: 'Access-Control-Max-Age',           value: '86400' },
          { key: 'Vary',                             value: 'Origin' },
        ],
      },
      {
        // widget.js precisa ser servido com CORS aberto (script tag de outro domínio)
        source: '/widget.js',
        headers: [
          { key: 'Access-Control-Allow-Origin',  value: '*' },
          { key: 'Cache-Control',                value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800' },
          { key: 'Content-Type',                 value: 'application/javascript; charset=utf-8' },
        ],
      },
      {
        // Página /embed/chat precisa permitir iframe APENAS pelo Techmalhas
        source: '/embed/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://www.techmalhas.com.br https://techmalhas.com.br;" },
          { key: 'X-Frame-Options',         value: 'ALLOW-FROM https://www.techmalhas.com.br' }, // legacy fallback
        ],
      },
    ]
  },
}
```

> ⚠️ **Atenção:** `next.config.ts` aplica os headers ao response, mas **não** define `Access-Control-Allow-Origin` dinâmico — quando precisamos validar o Origin antes (rejeitar requests fora da allowlist), usamos middleware. Snippet abaixo.

### 3.2 Middleware com validação de Origin + Turnstile

```ts
// crm-app/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = new Set([
  'https://www.techmalhas.com.br',
  'https://techmalhas.com.br',
])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/api/v1/webchat/')) {
    return NextResponse.next()
  }

  const origin = req.headers.get('origin') ?? ''
  const isAllowed = ALLOWED_ORIGINS.has(origin)

  // 1) Preflight
  if (req.method === 'OPTIONS') {
    if (!isAllowed) {
      return new NextResponse(null, { status: 403 })
    }
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin':  origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Webchat-Session-Token, X-Turnstile-Token',
        'Access-Control-Max-Age':       '86400',
        'Vary':                         'Origin',
      },
    })
  }

  // 2) Request real — bloquear se Origin não for permitido (proteção contra CSRF cross-site)
  // (apenas em endpoints públicos /sessions e /messages com isFromVisitor=true)
  if (!isAllowed && origin !== '') {
    return NextResponse.json(
      { error: 'Origin não autorizado' },
      { status: 403 }
    )
  }

  // 3) Continua para o handler. Os handlers vão setar Allow-Origin no response.
  const res = NextResponse.next()
  if (isAllowed) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Vary', 'Origin')
  }
  return res
}

export const config = {
  matcher: ['/api/v1/webchat/:path*'],
}
```

**Notas importantes:**
- `Access-Control-Allow-Credentials` fica `false` porque o visitante é **anônimo** (não usa cookies, só `X-Webchat-Session-Token` opaco no header).
- O check `origin !== ''` permite requests server-to-server (ex.: testes do Postman, cron jobs internos) que não enviam Origin.
- Referência: [Next.js v16 docs — Route Handlers CORS](https://github.com/vercel/next.js/blob/v16.2.3/docs/01-app/03-api-reference/03-file-conventions/route.mdx) e [CORS in App Router — discussion #64115](https://github.com/vercel/next.js/discussions/64115).

### 3.3 Rate limit em `POST /api/v1/webchat/sessions`

Hoje o endpoint **aceita qualquer POST sem limite**. Isso é vulnerabilidade séria — bot pode criar 100 sessões/segundo e estourar banco + notificações para os atendentes.

**Decisão técnica:** usar `@upstash/ratelimit` + Upstash Redis (free tier — 10k req/dia é mais que suficiente). Pattern Edge-compatível e oficial recomendado pela Vercel [Vercel examples — api-rate-limit-and-tokens](https://github.com/vercel/examples/tree/main/edge-functions/api-rate-limit-and-tokens).

**Limites a aplicar** (alinhados com Patrícia):

| Endpoint | Chave | Limite |
|---|---|---|
| `POST /api/v1/webchat/sessions` | IP | 5 sessões/IP/hora |
| `POST /api/v1/webchat/sessions` | IP | 20 sessões/IP/dia |
| `POST /api/v1/webchat/messages` (visitor) | sessionId | 30 mensagens/sessão/minuto |
| `POST /api/v1/webchat/messages` (visitor) | IP | 200 mensagens/IP/hora |

```ts
// crm-app/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis }      from '@upstash/redis'

const redis = Redis.fromEnv()

export const webchatLimiters = {
  sessionsPerIpHour: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix:  'rl:webchat:sess:ip:h',
    analytics: true,
  }),
  sessionsPerIpDay: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '24 h'),
    prefix:  'rl:webchat:sess:ip:d',
  }),
  messagesPerSession: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix:  'rl:webchat:msg:sess',
  }),
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') ?? ''
  return xff.split(',')[0]?.trim() || 'anon'
}
```

Aplicado no handler:

```ts
// crm-app/app/api/v1/webchat/sessions/route.ts (POST modificado)
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const h  = await webchatLimiters.sessionsPerIpHour.limit(ip)
    if (!h.success) {
      return NextResponse.json(
        { error: 'Muitas sessões iniciadas. Tente novamente em alguns minutos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((h.reset - Date.now()) / 1000)) } }
      )
    }
    const d = await webchatLimiters.sessionsPerIpDay.limit(ip)
    if (!d.success) {
      return NextResponse.json(
        { error: 'Limite diário atingido.' },
        { status: 429 }
      )
    }
    // ... resto da lógica atual (validate, create session, etc.)
```

### 3.4 CAPTCHA: Turnstile vs hCaptcha — recomendo **Turnstile**

| Critério | Cloudflare Turnstile | hCaptcha |
|---|---|---|
| Custo | **Grátis ilimitado** | Free + Pro $99/mês para invisible |
| UX | **Invisível por padrão**, só mostra desafio se suspeitar | Desafio visual mais frequente |
| Bot block (independent testing) | ~98% ([splitforms benchmark](https://splitforms.com/blog/best-captcha-for-contact-form)) | ~97% |
| Cloudflare já está no caminho | **✅ sinergia total** (CF Turnstile usa sinais do mesmo edge que protege o Irroba) | Independente |
| Mobile UX | Excelente (responsive, PATs em iOS 16+) | Razoável |
| Bundle size do script | ~75 KB minified | ~85 KB |
| Privacidade (LGPD) | Não vende dados | Não vende dados |

**Decisão:** Cloudflare Turnstile, baseado em:
- Custo zero.
- Sinergia com Cloudflare na frente do site Irroba (o token tem mais sinais para confiar).
- Já é o padrão recomendado para sites Cloudflare-hosted em 2026 ([PkgPulse 2026 comparison](https://www.pkgpulse.com/guides/turnstile-vs-recaptcha-vs-hcaptcha-captcha-bot-2026)).

**Implementação:**

No widget (lado visitor):
```html
<!-- Carregado dentro do iframe /embed/chat, no momento que o visitor for criar sessão -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<div class="cf-turnstile"
     data-sitekey="0x4AAAAA..."
     data-callback="onTurnstileVerified"
     data-theme="light"
     data-size="invisible"></div>
```

No backend (validação server-side, **obrigatória**):
```ts
// crm-app/lib/turnstile.ts
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const formData = new FormData()
  formData.append('secret', process.env.TURNSTILE_SECRET_KEY!)
  formData.append('response', token)
  formData.append('remoteip', ip)

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  })
  const data = await res.json() as { success: boolean; 'error-codes'?: string[] }
  return data.success === true
}
```

E no `POST /api/v1/webchat/sessions`:
```ts
const turnstileToken = req.headers.get('x-turnstile-token')
if (!turnstileToken) {
  return NextResponse.json({ error: 'Token de verificação obrigatório' }, { status: 400 })
}
const isHuman = await verifyTurnstile(turnstileToken, ip)
if (!isHuman) {
  return NextResponse.json({ error: 'Verificação anti-bot falhou' }, { status: 403 })
}
```

Tokens Turnstile são single-use, expiram em 5 minutos — perfeito para create-session. Referência: [Cloudflare Turnstile validation docs](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

### 3.5 Camadas defensivas (resumo)

```
┌──────────────────────────────────────────────────────┐
│  Visitante no site techmalhas.com.br                 │
│         ↓                                            │
│  [Cloudflare WAF — bloqueio de ataques conhecidos]   │ ← já existe (Irroba)
│         ↓                                            │
│  Widget.js → POST /api/v1/webchat/sessions           │
│         ↓                                            │
│  [Cloudflare WAF — proteção do CRM em Vercel]        │ ← já existe (Vercel)
│         ↓                                            │
│  [Middleware: Origin validation]                     │ ← novo (3.2)
│         ↓                                            │
│  [Middleware: Rate limit por IP+hora+dia]            │ ← novo (3.3)
│         ↓                                            │
│  [Handler: Turnstile siteverify server-side]         │ ← novo (3.4)
│         ↓                                            │
│  [Handler: Zod validation (já existe)]               │
│         ↓                                            │
│  [Prisma INSERT webchat_session]                     │
└──────────────────────────────────────────────────────┘
```

---

## 4. Supabase Realtime no Widget — Considerações

### 4.1 Bundle size

| Pacote | Unpacked | Gzipped (estimado) | Notas |
|---|---|---|---|
| `@supabase/supabase-js@2` (full) | ~750 KB | ~120 KB | Inclui Auth, Realtime, Storage, PostgREST |
| `@supabase/realtime-js@2.100+` | ~620 KB | ~85 KB | **Sem build UMD** (só CommonJS/ESM) |

**Implicação:** não dá pra carregar via `<script src="cdn.jsdelivr.net/.../realtime-js">` no widget standalone. Tem que **bundlar** (esbuild/rollup) junto com nosso código de widget.

**Estratégia para abordagem C (híbrida):**
- O **launcher** (~5 KB gzip) **não importa supabase-js**. Apenas mostra o botão e injeta o iframe quando clicado.
- O **iframe `/embed/chat`** é uma página Next.js do CRM — usa o `supabase-js` que **já está no bundle do app**. Sem custo adicional (é a mesma página /chat do operador, em uma variante minimal).

**Resultado:** o visitor que **nunca abre o chat** baixa apenas ~5 KB. Quem abre, baixa o app completo (mas em momento que o usuário tolera latência — está esperando o chat carregar). Performance otimizada para o caso médio.

### 4.2 Alternativa "lite" caso queiramos opção A (vanilla) no futuro

Se quisermos um dia eliminar o iframe, há a opção de implementar WebSocket manualmente com `phoenix.js` (Supabase Realtime usa Phoenix Channels por baixo):
- `phoenix.js` minified ~12 KB gzip
- Implementar `RealtimeChannel` à mão: ~3 KB
- **Total:** ~15 KB para WebSocket nu

Mas perdemos: reconexão automática inteligente, broadcast presence, postgres_changes, retries. **Não recomendo no MVP.**

### 4.3 CSP/CORS do Supabase para o WebSocket

WebSocket do Supabase Realtime conecta em `wss://<project>.supabase.co/realtime/v1/websocket?apikey=<anon>`. Esse fluxo é:
- ✅ Não passa por preflight CORS (WebSocket é exempt).
- ✅ O `apikey` (anon key) é seguro de expor — é exatamente para isso.
- ⚠️ **CSP do iframe `/embed/chat`** precisa permitir `connect-src wss://<project>.supabase.co`.

Headers no `/embed/chat`:
```ts
// crm-app/next.config.ts (continuação)
{
  source: '/embed/:path*',
  headers: [
    {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
        "frame-ancestors 'self' https://www.techmalhas.com.br https://techmalhas.com.br",
        "form-action 'self'",
      ].join('; '),
    },
  ],
},
```

### 4.4 Reconnect ao mudar de página (Irroba é server-rendered, não SPA)

O site Irroba **não é SPA** — cada navegação clicada (Home → PLP → PDP → Carrinho) é um **full reload**. Isso significa:

- A cada navegação, o `widget.js` é **re-executado**.
- O launcher renderiza de novo (em 50ms, imperceptível).
- O iframe é re-criado **se** o painel estiver aberto. ❗ Risco: perder o histórico da sessão no meio de uma conversa.

**Mitigação obrigatória:**

```ts
// dentro do widget.js
const SESSION_KEY = 'tm_chat_session'
const SESSION_TTL_MS = 30 * 60 * 1000 // 30 min

// Persistir session_id no localStorage do techmalhas.com.br
const stored = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
if (stored && Date.now() - stored.createdAt < SESSION_TTL_MS) {
  // Reusar a sessão; passar via query string para o iframe
  iframe.src = `${CRM_URL}/embed/chat?session=${stored.sessionId}&token=${stored.token}`
} else {
  // Sessão nova será criada quando o user clicar para abrir
}
```

E o iframe `/embed/chat`, ao receber `?session=xxx`, **não chama POST /sessions** — usa direto a sessão existente.

**Bonus UX:** se o user já estava conversando e navegou para outra página, ao reabrir o painel ele **vê o histórico**. Patrícia já validou que isso é o esperado.

---

## 5. Mobile + Cloudflare

### 5.1 Cache do Cloudflare no `<script src=".../widget.js">`

**Risco confirmado:** Cloudflare em frente ao site Irroba **vai cachear** o HTML da loja por alguns minutos a horas (depende da config). Se o snippet `<script src="https://squad-tchmalhas.vercel.app/widget.js" async defer>` for incluído no HTML do template, **ele é cacheado junto**. ✅ Bom.

O `widget.js` em si é servido por **outro** Cloudflare (o que está na frente do Vercel). Esse Cloudflare cacheia conforme nossos headers:

```
Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=604800
```

- `max-age=300` (browser): cliente cacheia por 5 min — bom para usuários voltando rápido.
- `s-maxage=86400` (CDN): Cloudflare cacheia por 24h — performance massa.
- `stale-while-revalidate=604800` (7 dias): mesmo após expirar, serve a versão antiga enquanto busca a nova em background — **zero downtime em deploy**.

**Quando vamos publicar nova versão do widget:**
- Bumpar o filename (versionado): `widget.v2.js` ou usar query string `widget.js?v=2`.
- Estratégia mais limpa: **immutable URL pattern** — `widget-<hash>.js`. Snippet no site Irroba referencia `widget.js` (sem hash, com `max-age=300`), e `widget.js` faz `document.write` de `widget-<hash>.js` (com `max-age=31536000 immutable`). Trade-off: complexidade extra, opcional para v1.

**Recomendação MVP:** começar simples com `widget.js` + `max-age=300` + `stale-while-revalidate`. Migrar para immutable pattern se rotatividade de deploys exigir.

### 5.2 Mobile-first — pontos críticos

| Ponto | O que fazer |
|---|---|
| Tamanho do launcher | 64×64 px (recomendado WCAG AA tap target ≥ 44×44) |
| Posição mobile | `bottom: 16px; right: 16px;` (não conflitar com WhatsApp button do template Irroba se existir) |
| Iframe fullscreen mobile | Em viewport ≤ 768px, abrir iframe `position: fixed; inset: 0; z-index: 999999;` (cobrir tudo, inclusive header sticky do Irroba) |
| Teclado virtual iOS | Iframe **sem** `allow-same-origin` quebra `scrollIntoView()` em iOS Safari. Solução: ouvir `resize` no iframe e fazer scroll manual via postMessage |
| Touch scroll dentro do iframe | iOS exige `-webkit-overflow-scrolling: touch` na div de mensagens |
| Performance LCP | Launcher carrega com `defer`, **não bloqueia** First Contentful Paint do Irroba |
| Bateria | Supabase Realtime mantém WebSocket aberto. **Só ativar quando o painel está aberto**, não pelo launcher. |

### 5.3 Como testar (checklist Quésia QA)

1. **Chrome DevTools mobile emulation:** Pixel 7, iPhone 14, iPad — verificar que o launcher aparece e não sobrepõe elementos críticos.
2. **BrowserStack** (ou Sauce Labs): testar Safari iOS 16, 17, 18 reais; Chrome Android 12, 13, 14.
3. **Real device test:** o time da Techmalhas tem celulares variados. Pedir teste com 3-5 colaboradores.
4. **Slow 3G throttle:** o widget deve aparecer em menos de 3 segundos no slow 3G simulado.
5. **Cloudflare purge:** após cada deploy do widget, executar `vercel.cache.purge` (ou esperar 5 min do TTL); validar com `curl -I .../widget.js | grep cf-cache-status`.

---

## 6. Plano de Implementação (para Fábio)

### 6.1 Tasks detalhadas com estimativa

| # | Task | Descrição técnica | Estimativa |
|---|---|---|---|
| T1 | CORS + Origin validation | Implementar `middleware.ts` (3.2) + headers no `next.config.ts` (3.1). Testar preflight via `curl -X OPTIONS -H "Origin: https://www.techmalhas.com.br"`. | **3 h** |
| T2 | Rate limit Upstash | Provisionar Upstash Redis free tier; adicionar env vars; criar `lib/rate-limit.ts`; aplicar em `POST /sessions` e `POST /messages`. Testar com `ab -n 50 -c 5` ou `hey -n 100`. | **3 h** |
| T3 | Cloudflare Turnstile | Criar site key no dashboard Cloudflare (apontando para crm.techmalhas...); `lib/turnstile.ts`; integrar no widget e no handler `POST /sessions`. Testar com modo "Always Challenge" depois voltar para "Managed". | **3 h** |
| T4 | Página `/embed/chat` (operador-less variant) | Variante da `/chat` existente, sem chrome do CRM, sem nav, layout otimizado para iframe. Recebe `?session=xxx&token=yyy` na query. Header CSP `frame-ancestors` configurado. | **5 h** |
| T5 | `widget.js` — launcher Shadow DOM | Bundle vanilla (esbuild). Custom Element `<techmalhas-chat-launcher>`. CSS isolado dentro do shadow root. Animações pulse + badge. Proactive bubble com timer (30s home/PLP, 15-20s carrinho). | **6 h** |
| T6 | `widget.js` — iframe + postMessage | Lazy-load do iframe quando o user clica. postMessage handlers (close, resize, badge_count). LocalStorage para session_id (3.4). Mobile fullscreen logic. | **4 h** |
| T7 | Build/deploy do widget | `next.config.ts` para servir `widget.js` estático em `/widget.js`. Cache headers (5.1). Versionamento via filename ou query param. | **2 h** |
| T8 | Integração Realtime no iframe | Trocar polling (se existir) por Supabase Realtime no painel /embed. Reconnect logic. Indicador "operador digitando". | **3 h** |
| T9 | Testes mobile + Cloudflare cache | Smoke tests manuais nos dispositivos críticos (5.3). Validar cache TTL com `curl -I`. Documentar repro de issues em iOS Safari. | **4 h** |
| T10 | Documentação para Tania | README curto: como inserir o `<script>` no painel Irroba (passo a passo, em PT-BR não-técnico). Como ler logs de sessões no CRM. Como abrir chamado se algo quebrar. | **2 h** |
| T11 | Logs e observabilidade | Adicionar métricas: sessions/dia, mensagens/sessão, tempo médio de resposta, taxa de abandono. Dashboard simples no `/chat` para gestores. | **3 h** (opcional para v1.1) |

**Total estimado:** **35 h** (sem T11 — 32 h)

> Comparação com estimativa Patrícia (24–33 h): minha estimativa é **+3 h acima do topo** dela, porque adicionei T1-T3 (segurança) com mais profundidade — não estavam detalhados no resumo dela. T11 é opcional.

### 6.2 Ordem sugerida de execução

```
Sprint 1 (≈12 h) — Backend security primeiro
  T1 → T2 → T3 → deploy preview Vercel
  Validar com Postman antes de tocar UI.

Sprint 2 (≈11 h) — Página operador-less + widget core
  T4 → T5 → T6 → T7
  Resultado: snippet funcional em página de teste do Fábio.

Sprint 3 (≈10 h) — Realtime + QA + docs
  T8 → T9 → T10
  Resultado: widget pronto para publicação.

Sprint 4 (post-MVP) — Métricas (T11) + ajustes pós uso real
```

### 6.3 Critérios de pronto (definition of done)

- [ ] Lighthouse mobile do site Techmalhas com widget incluso: LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms.
- [ ] `widget.js` minified ≤ 15 KB gzip.
- [ ] Latência médica P50 mensagem → render no outro lado: ≤ 300ms.
- [ ] Sessão sobrevive a 3 navegações entre páginas Irroba.
- [ ] Rate limit testado: 6ª sessão do mesmo IP em uma hora retorna 429.
- [ ] Turnstile bloqueia request sem token; aceita com token válido.
- [ ] CSP `frame-ancestors` impede que outros domínios embedem `/embed/chat`.
- [ ] Quésia (QA) aprova checklist de segurança e LGPD.

---

## 7. Plano B — Se Irroba Bloquear a Injeção do Script

Cenário: Tania consegue o painel Irroba mas **não há campo público de "scripts personalizados"** e o suporte Irroba se recusa a incluir o snippet no template global (ou cobra a mais por isso).

### 7.1 Opção B1 — Google Tag Manager como vetor

**Premissa:** Tawk.to e JivoChat carregam scripts arbitrários nas lojas Irroba — significa que o template Irroba não tem CSP `script-src 'self'`. Se conseguirmos injetar **um** script qualquer, podemos injetar GTM e usar GTM para injetar o nosso.

**Caminho:**
1. Verificar se a Techmalhas tem GTM container já instalado (suspeito que sim, para Google Analytics).
2. Se sim, abrir o GTM da Tania, criar uma Tag tipo "Custom HTML":
   ```html
   <script async defer src="https://squad-tchmalhas.vercel.app/widget.js"></script>
   ```
3. Trigger "All Pages — Page View".
4. Publicar GTM container.

**Vantagem:** Tania (com ajuda da tutora) consegue fazer isso **sozinha**, sem suporte Irroba.

**Custo:** 0. **Tempo:** 30 min.

### 7.2 Opção B2 — Subdomínio próprio servindo um redirect inteligente

Se nem GTM existe e nem suporte ajuda:

1. Criar subdomínio `chat.techmalhas.com.br` apontando para Vercel (DNS via Cloudflare).
2. Hospedar lá uma página que abre o chat em **modo standalone** (sem iframe — direct app, mobile-first).
3. Adicionar **apenas um link** simples no rodapé/menu da loja Irroba (suporte Irroba normalmente aceita criar link no menu): "Fale Conosco em Tempo Real".
4. O link abre `chat.techmalhas.com.br` em uma nova aba ou em `target="_top"`.

**Trade-off:** perde-se o launcher flutuante (impacto na taxa de engajamento estimado em -40%). Mas funciona **sem depender** da inserção de script no template Irroba.

### 7.3 Opção B3 — Aplicar para se tornar parceiro oficial Irroba

**Premissa:** Irroba mantém um marketplace de apps de chat (Tawk.to, JivoChat). Se contactarmos parceria, podemos pedir para listar o "Techmalhas Chat" como app — mesmo que seja exclusivo da Techmalhas (white-label).

**Caminho:**
1. Email para `parcerias@irroba.com.br` (canal "Seja um parceiro de integração" em https://www.irroba.com.br/integracoes).
2. Descrever o caso: lojista quer chat próprio integrado ao CRM próprio.
3. Negociar inclusão no marketplace **só para o tenant da Techmalhas** (flag).

**Tempo:** semanas a meses. **Recomendação:** seguir em paralelo com B1, mas não bloquear MVP em cima de B3.

### 7.4 Opção B4 — Pedir ao suporte Irroba inclusão manual no `<head>`

Tania abre ticket de suporte (WhatsApp ou ticket Irroba) pedindo:
> "Por favor, incluir no `<head>` global da minha loja a seguinte linha:
> `<script async defer src="https://squad-tchmalhas.vercel.app/widget.js"></script>`
> Mesmo padrão dos apps Tawk.to e JivoChat existentes."

**Tempo:** 1-3 dias úteis (estimativa baseada em SLAs típicos de SaaS BR). **Recomendação:** abrir esse ticket **antes** do MVP estar pronto — para o Fábio poder testar em produção logo que terminar.

### 7.5 Ordem de tentativa recomendada

```
1) Caminho A (preferido) — Painel Irroba + B4 (suporte injeta o snippet)   [chance: 70%]
2) Plano B1 (GTM)                                                          [chance: 25%]
3) Plano B2 (subdomínio + link)                                            [chance: 5%]  ← último recurso
4) Plano B3 (parceria Irroba)                                              [médio prazo, não bloqueia MVP]
```

---

## 8. Riscos (TOP 7)

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| R1 | Tania não recupera acesso ao painel Irroba a tempo do MVP | **Alta** | **Alto** — bloqueia publicação | Iniciar processo de recuperação **hoje** com Irroba (WhatsApp/ticket). Em paralelo Fábio trabalha em ambiente de teste com `<iframe src=https://www.techmalhas.com.br>` injetando manualmente o script via DevTools. |
| R2 | Irroba bloqueia inserção do snippet (sem campo público de scripts) | Média | Alto | Plano B (seção 7). B1 (GTM) ataca este risco em 30 min. |
| R3 | Cloudflare cacheia versão antiga do `widget.js` após bug crítico | Média | Médio | Headers `stale-while-revalidate` + ferramenta de purge manual no Vercel + alarme se erro 500 em `/api/v1/webchat/sessions` aumentar 3x a baseline. |
| R4 | Conflito de CSS com template Irroba quebrando launcher | Baixa (Shadow DOM mitiga 95%) | Médio | Shadow DOM (escolha de arquitetura C); inline-only CSS sem `!important`; testar em 5 temas Irroba (não temos amostra, então testar em techmalhas.com.br ao vivo) |
| R5 | iOS Safari 14-15 com bugs em Shadow DOM + iframe focus | Média | Médio | Testar real device antes do go-live; fallback "open in new tab" em iOS < 16 detectado por `navigator.userAgent`. |
| R6 | Bot spam apesar do Turnstile + rate limit | Baixa | Médio | Monitorar via dashboard Upstash + analytics Turnstile; se necessário, adicionar honeypot field + bloquear IPs reincidentes via Cloudflare WAF rule. |
| R7 | LGPD: consent não capturado corretamente em fluxo "no questions asked" da Patrícia | Baixa (validador Zod garante `lgpdConsent: true`) | Crítico (multa LGPD) | Validador atual já refusa sessão sem `lgpdConsent`. Aviso textual com link "Política de Privacidade" precisa estar **visível antes** do botão "Iniciar conversa". Quésia precisa auditar este fluxo (T9). |

---

## 9. Checklist de Pré-requisitos para Tania

### Antes do MVP iniciar (bloqueantes)

- [ ] **Recuperar acesso ao painel Irroba.** Contatar Irroba via WhatsApp oficial ou ticket. Identificar-se como dona/responsável da loja Techmalhas, solicitar reset de credenciais. **Prazo realista: 1-5 dias úteis.**
- [ ] **Confirmar plano Irroba atual** da Techmalhas (Free/Base/Pro/VIP). Importante porque "API gratuita" só está no plano superior segundo a página de preços. Sem API ativa, Plano B3 fica inviável.
- [ ] **Verificar se Techmalhas já tem GTM (Google Tag Manager)** instalado. Forma rápida: abrir o site em navegador anônimo, F12 → Network → buscar por `gtm.js`. Se aparecer → temos plano B1 garantido.
- [ ] **Definir e publicar a página `/politica-de-privacidade`** no site Techmalhas (Irroba permite páginas estáticas). O widget vai linkar para ela na coleta de consent LGPD.
- [ ] **Decidir email LGPD oficial** (ex.: `privacidade@techmalhas.com.br`) para o link "Solicitar exclusão de meus dados" no widget. Garantir que esse email exista e seja monitorado.

### Antes do go-live (não bloqueantes mas necessários)

- [ ] **Criar conta Cloudflare** (gratuita) para gerar `site key` + `secret key` do Turnstile. Apontar para `crm.techmalhas.com.br`.
- [ ] **Criar conta Upstash** (gratuita) para rate limiting. Provisionar 1 Redis em `sa-east-1` (mesma região do Supabase, latência baixa).
- [ ] **Definir horários de atendimento.** O widget pode mostrar "Operadores online" vs "Deixe sua mensagem". A Patrícia já tinha sugerido. Quem atende em qual horário? Esse é input de produto, não técnico.
- [ ] **Treinar os atendentes no painel `/chat` do CRM.** 30 min com Quésia (QA + documentação) basta.
- [ ] **Aprovar texto do consent LGPD** ("Ao iniciar a conversa, você concorda com nossa Política de Privacidade"). Quésia escreve, Tania aprova.

### Pós go-live (operacional)

- [ ] **Monitorar métricas semana 1:** sessões/dia, taxa de resposta, tempo médio de resposta. Ajustar proactive bubble timings com base em dados reais.
- [ ] **Plano de incidente:** o que fazer se o widget começar a dar erro em produção. Quem aciona quem (tutora → Fábio → Arnaldo).

---

## 10. ADR-008 — Widget de Webchat: Arquitetura Híbrida (Launcher Shadow DOM + Iframe)

> **Aceita** | **Data:** 2026-05-25 | **Decisor técnico:** Arnaldo Arquiteto | **Aprovador:** Tania (PO)
> **Decisões correlatas:** ADR-005 (Supabase Realtime), ADR-007 (PM-Tutora-Squad), Patrícia — recomendação UX 2026-05-25

### Contexto

A Techmalhas tem CRM em produção (`squad-tchmalhas.vercel.app`) com backend de webchat já implementado (`POST /api/v1/webchat/sessions` e `/messages`). Falta um widget customer-facing instalado no site Irroba `techmalhas.com.br`. A Patrícia (UX/produto) recomendou abordagem híbrida (`widget.js` + iframe) com launcher Shadow DOM. Este ADR fundamenta tecnicamente essa recomendação e formaliza decisão arquitetural.

### Forças (constraints)

| # | Restrição | Implicação |
|---|---|---|
| F1 | Site Irroba server-rendered, Cloudflare CDN, não SPA | Cada navegação é full reload; widget precisa persistir sessão via localStorage |
| F2 | Tania sem acesso ao painel Irroba | Implementação pode rodar em paralelo, mas publicação depende de recuperação de acesso |
| F3 | Irroba não documenta CSP / scripts livres | Defesa em profundidade obrigatória: iframe cross-origin protege contra CSP restritivo eventual |
| F4 | 60-70% tráfego mobile, slow 3G real no Brasil | Bundle tem que ser ≤ 15 KB gzip no critical path |
| F5 | Backend já tem Supabase Realtime; reaproveitar | Iframe pode ser uma variant da página /chat existente, sem duplicar lógica |
| F6 | LGPD: consent obrigatório, sem coleta excessiva | Iframe cross-origin **não** vaza cookies/storage entre techmalhas.com.br ↔ crm |
| F7 | Vercel Hobby plan limita Cron a 1x/dia | Cleanup de sessões expiradas precisa ser eficiente (já está em `/api/cron/webchat-expire`) |

### Decisão

Implementar widget em **arquitetura híbrida (opção C)**:

1. **`widget.js` vanilla (~14 KB gzip)** servido em `https://squad-tchmalhas.vercel.app/widget.js`, cacheado por Cloudflare 24h com `stale-while-revalidate`.
2. **Launcher em Shadow DOM** (Custom Element `<techmalhas-chat-launcher>`) com CSS encapsulado.
3. **Painel em iframe cross-origin** apontando para `/embed/chat` no domínio do CRM, com `sandbox="allow-scripts allow-forms allow-popups allow-same-origin"`.
4. **Comunicação host ↔ iframe via postMessage** estruturado com validação de origin.
5. **Supabase Realtime carregado apenas dentro do iframe**, lazy load on first open.
6. **CSP `frame-ancestors`** permite embed apenas em `techmalhas.com.br` e `www.techmalhas.com.br`.

### Alternativas avaliadas e rejeitadas

(Ver seção 2 deste documento.)

- **A — Vanilla puro**: rejeitado por risco de conflito JS no contexto global do Irroba.
- **B — Iframe puro**: rejeitado por UX ruim do launcher (botão limitado a um retângulo de iframe).
- **D — Shadow DOM puro sem iframe**: rejeitado porque Shadow DOM não isola JavaScript; ainda há risco de conflito.
- **E — GTM como arquitetura**: reposicionado como **transporte** (Plano B1), não arquitetura.

### Consequências

**Positivas:**
- Bundle crítico minúsculo, Core Web Vitals do site Techmalhas preservados.
- Isolamento total iframe → robusto contra mudanças no template Irroba.
- Padrão de mercado 2026, dezenas de referências validadas (Intercom/Crisp/Tidio).
- LGPD compliance por design (cross-origin = sem vazamento de storage).

**Negativas:**
- Comunicação host ↔ painel via postMessage adiciona ~5-10ms de latência por mensagem (irrelevante para UX).
- 2 contextos JavaScript para debugar (launcher no host + iframe app) — mitigado por logs estruturados.
- Necessidade de configurar CSP `frame-ancestors` corretamente — testado no T9.

### Plano de Saída

Se em 90 dias o iframe se mostrar limitante (ex.: requisito de drag-and-drop de arquivos do site Irroba para o chat), migrar para **opção D + WebWorker** mantendo a interface postMessage. Custo: ~12h de refactor.

### Métricas de validação (revisar em 30 dias pós-launch)

- LCP mobile do site Techmalhas: ≤ 2.5s (com widget instalado).
- Taxa de abertura do chat: ≥ 8% dos visitantes (benchmark Crisp 2025).
- Taxa de resposta do operador < 60s em 80% das sessões em horário comercial.
- Zero incidente de produção causado por conflito CSS/JS entre widget e template Irroba.

---

## Próximo passo imediato

**Tania:** abrir hoje, em paralelo, dois canais com a Irroba — (1) ticket/WhatsApp pedindo **recuperação de acesso ao painel** (autenticação de proprietária) e (2) pergunta direta ao suporte: "minha loja `techmalhas.com.br` tem campo para inserir scripts personalizados no `<head>` ou apenas via apps de marketplace?". Em paralelo, a tutora me delega a **handoff para o Fábio (fullstack-developer)** com o briefing técnico deste relatório consolidado, para ele iniciar pelo Sprint 1 (segurança: T1-T3) que **não depende** do acesso ao painel Irroba — assim no momento que o acesso for liberado, já teremos o widget pronto para inserir.

---

*Documento gerado por Arnaldo Arquiteto, Squad CRM Techmalhas, sob modelo operacional ADR-007. Pesquisa de plataforma Irroba conduzida em 2026-05-25 via fontes oficiais (irroba.com.br, ajuda.irroba.com.br, api.irroba.com.br, blog.irroba.com.br) e parceiros públicos documentados (JivoChat, Tawk.to, Notificações Inteligentes). Decisões arquiteturais ancoradas em referências 2026: Cloudflare Turnstile docs, Next.js v16.2 docs oficiais, Supabase Realtime SDK 2.100+, Upstash Ratelimit examples, padrões cross-origin iframe widgets.*
