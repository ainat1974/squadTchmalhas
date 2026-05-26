# Widget Irroba — Snippet final + instalação (2026-05-26)

> **Autor:** Arnaldo Arquiteto (system-architect, Squad CRM Techmalhas)
> **Status:** Pronto para instalação — Realtime e2e validado em produção (`PASS 1948ms`, 2026-05-26 12:52 UTC).
> **Substitui:** `WIDGET-IRROBA-SNIPPET.md` (draft) e consolida `irroba-webchat-integracao-tecnica.md` (ADR-008).
> **Pré-requisitos confirmados hoje:** migrations 004/005 aplicadas no Supabase, `/widget.js` HTTP 200 em produção, `POST /api/v1/webchat/sessions` → 201, `POST /api/v1/webchat/messages` (visitante) → 201, publication Realtime contém `webchat_messages` e `webchat_sessions`.

---

## a) Snippet pronto pra colar

Copie **exatamente** este bloco (HTML real, sem placeholders) e cole no template da loja Irroba — não precisa editar nada:

```html
<!-- CRM Techmalhas — chat ao vivo -->
<script
  async
  defer
  src="https://squad-tchmalhas.vercel.app/widget.js"
  data-base="https://squad-tchmalhas.vercel.app"
  data-position="right"></script>
```

**O que cada atributo faz:**

| Atributo | Valor | Explicação |
|----------|-------|------------|
| `src` | `https://squad-tchmalhas.vercel.app/widget.js` | Arquivo do launcher (já em prod, GET 200 com `Cache-Control: max-age=86400`) |
| `data-base` | `https://squad-tchmalhas.vercel.app` | Domínio que o iframe `/embed/chat` vai abrir (pode mudar quando migrar para `crm.techmalhas.com.br`) |
| `data-position` | `right` | Lado do launcher (`right` ou `left` — Patrícia validou `right` no MVP) |
| `async defer` | — | Não bloqueia render — LCP da loja preservado |

---

## b) Instalação no painel Irroba — passo a passo

A Irroba **não tem campo público de "scripts personalizados livres"**. Existem 3 caminhos comprovados (ordem de preferência):

### Caminho 1 — Suporte Irroba injeta no template global (preferido)

1. Entrar no painel Irroba: <https://admin.irroba.com.br/> (ou domínio admin recebido por e-mail).
2. Menu lateral → **Suporte** → **Abrir chamado** (ou WhatsApp oficial do suporte Irroba).
3. Solicitar o seguinte texto (copie e cole):

   > "Por favor, incluir no `<head>` global do template da minha loja (igual ao Tawk.to e JivoChat) a seguinte linha:
   >
   > `<script async defer src="https://squad-tchmalhas.vercel.app/widget.js" data-base="https://squad-tchmalhas.vercel.app" data-position="right"></script>`
   >
   > É um chat ao vivo próprio da loja, hospedado em domínio Vercel verificado. Já testado em produção."

4. Anexar URL `https://squad-tchmalhas.vercel.app/widget.js` no chamado (eles vão querer auditar).
5. SLA esperado: 1–3 dias úteis.

### Caminho 2 — Google Tag Manager (se já estiver instalado)

Verificação rápida: abrir a loja em aba anônima → DevTools (F12) → **Network** → filtrar `gtm.js`. Se aparecer, GTM existe.

1. Acessar <https://tagmanager.google.com/> com a conta vinculada à loja.
2. **Tags → Nova → Configuração de tag** → **Custom HTML**.
3. Colar o snippet da seção (a).
4. **Acionamento** → **All Pages — Page View**.
5. **Salvar** → **Enviar** → **Publicar**.

Tempo: ~30 min. Não depende do suporte Irroba.

### Caminho 3 — Layout Exclusivo (planos Pro/VIP Irroba)

Se a loja tem **Setup Profissional** ou **Layout Exclusivo**:

1. Painel Irroba → **Configurações** → **Aparência** → **Editar template**.
2. Localizar o arquivo `footer.tpl` (ou equivalente — Smarty/Twig dependendo da versão).
3. Inserir o snippet **imediatamente antes** do `</body>`.
4. Salvar e republicar template.

> Se nenhum dos três caminhos estiver disponível, recorrer ao **Plano B2** documentado no ADR (`irroba-webchat-integracao-tecnica.md` §7.2): subdomínio `chat.techmalhas.com.br` + link no menu da loja.

---

## c) Checklist pós-instalação

Executar **na ordem**, em aba anônima do navegador (sem cache, sem sessão):

1. **Abrir** a loja em janela anônima (`Ctrl+Shift+N` ou `Cmd+Shift+N`).
2. **Confirmar launcher dourado "TM"** no canto inferior direito (56×56 px, gradient `#E8C547→#C9A84C`).
3. **Clicar no launcher** → painel abre (400×560 px) com formulário "Olá! Como podemos ajudar hoje?".
4. **Preencher** Nome + E-mail + Mensagem + marcar consent LGPD → **Iniciar conversa** → ver thread carregar e badge "Conectado como …" em verde.
5. **Recarregar a página (F5)** → launcher volta a aparecer; reabrir → **sessão persiste** (TTL 30 min no `localStorage` do iframe + `sessionStorage` do host).
6. **(opcional)** Atendente loga em `https://squad-tchmalhas.vercel.app/whatsapp` ou `/chat`, responde à sessão → visitante vê a mensagem chegar **em tempo real, sem refresh** (Supabase Realtime → validado `PASS 1948ms` hoje).
7. **DevTools → Network** → confirmar `POST https://squad-tchmalhas.vercel.app/api/v1/webchat/sessions` retorna **201**, `POST .../messages` retorna **201**, e WebSocket `wss://ipmznhtviwxjvbjjuvxf.supabase.co/realtime/v1/websocket?apikey=…` fica em **101 Switching Protocols** (conectado).

---

## d) Troubleshooting curto

| Sintoma | Causa provável | Como resolver |
|---------|----------------|---------------|
| Launcher não aparece (sem erro) | CSP do template Irroba bloqueia script de domínio externo | Conferir DevTools → Console → procurar `Refused to load the script`. Pedir ao suporte Irroba liberação do domínio `squad-tchmalhas.vercel.app` na CSP, ou usar Caminho 2 (GTM). |
| Launcher aparece, mas iframe dá erro `Refused to frame …` | `frame-ancestors` no CRM não cobre o origin real da loja | Conferir origin exato no DevTools (ex.: `https://techmalhas.com.br` apex vs `https://www.techmalhas.com.br`) e ajustar `next.config.ts` (linha 29) — ver **gap arquitetural** abaixo. |
| `POST /sessions` retorna 403 "Origin não permitida" | `WEBCHAT_ALLOWED_ORIGINS` na Vercel não inclui o origin da loja | Acrescentar o origin exato (com `https://`, sem barra final) à variável na Vercel e redeploy. |
| Conversa não atualiza em tempo real (precisa refresh) | RLS anon de `webchat_messages` ou publication Realtime fora | Validado hoje OK. Se voltar a falhar: `SELECT polname FROM pg_policy WHERE polrelid='public.webchat_messages'::regclass` deve listar `webchat_messages_anon_select`. |
| Cores do launcher não conferem com marca | Gradient fixo no widget | Editar `crm-app/public/widget.js` linhas 33–37 (`background: linear-gradient(…)`). Depois: deploy + esperar TTL Cloudflare (24h) ou purge manual. |

---

## e) Variáveis de ambiente na Vercel

### Mínimo obrigatório

| Variável | Valor recomendado | Por quê |
|----------|-------------------|---------|
| `WEBCHAT_ALLOWED_ORIGINS` | `https://www.techmalhas.com.br,https://techmalhas.com.br` | Bloqueia `POST /api/v1/webchat/*` de origins não autorizados (middleware linha 58–71). **Se vazio, qualquer origem cria sessão** — vulnerabilidade séria. **Sem espaços, separar por vírgula, sem barra final.** |

> Os clientes Supabase (URL + anon key) **já estão configurados** via `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no Vercel — não precisa mexer.

### Opcionais — recomendados mas não bloqueantes

| Variável | Quando ligar | Em uma linha |
|----------|--------------|--------------|
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Após primeiras 24h em prod | Sobe rate-limit de 10/min/IP do fallback in-memory para o Upstash (sobrevive a serverless cold-start). |
| `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Se aparecer spam | Ativa Cloudflare Turnstile no `POST /sessions` (hoje turnstile é opcional via Zod e validador retorna `true` se secret ausente). |

---

## Gaps arquiteturais identificados

### Gap A (médio) — CSP `frame-ancestors` não cobre apex `techmalhas.com.br`

O `next.config.ts` (linha 29) hoje permite:

```
frame-ancestors 'self' https://*.irroba.com.br https://irroba.com.br https://*.techmalhas.com.br
```

`https://*.techmalhas.com.br` **só matcha subdomínios** (ex.: `www.`, `loja.`). Se a loja Irroba também responder no apex (`https://techmalhas.com.br` sem `www`), o iframe `/embed/chat` será bloqueado pelo navegador.

**Ação sugerida:** acrescentar `https://techmalhas.com.br` à lista. Edit de uma linha no `next.config.ts`, deploy Vercel. (Não fiz nesta sessão — task restringe alterar config; deixar a Tania/Fábio aprovar.)

### Gap B (baixo) — `WEBCHAT_ALLOWED_ORIGINS` ainda vazio na Vercel

Sem essa env var, qualquer site na internet pode abrir sessões webchat na Techmalhas (encurtando `POST /sessions` ao rate-limit por IP). Não bloqueia o MVP, mas é o primeiro hardening a fazer pós-instalação.

### Gap C (baixo) — `widget.js` aponta domínio bruto Vercel

Hoje `data-base="https://squad-tchmalhas.vercel.app"`. Funciona, mas o ideal é apontar para `https://crm.techmalhas.com.br` (subdomínio com SSL próprio + Cloudflare na frente) — assim:

- Visualmente parece "da casa" no devtools do visitante.
- Permite trocar provider de hosting sem mudar snippet no Irroba.
- Cookies de embed (se houver) ficam dentro do eTLD+1 da loja.

Custo: 1 CNAME + verificação de domínio Vercel (~15 min). Sem urgência para o go-live.

---

## Resumo executivo (para Tania)

- **Realtime confirmado em produção:** mensagem visitor → broadcast Postgres → entrega no canal Supabase em **~2 segundos**, ponta-a-ponta.
- **Snippet final** está na seção (a) acima — copie e siga o Caminho 1 (chamado ao suporte Irroba).
- **Antes do go-live**, defina `WEBCHAT_ALLOWED_ORIGINS` na Vercel (Gap B) e considere o ajuste de CSP do Gap A se a loja também responder em apex sem `www`.
- Outras variáveis (Upstash, Turnstile) podem entrar **na segunda semana**, após observar tráfego real.

---

*Documento gerado por Arnaldo Arquiteto após validação Realtime ponta-a-ponta. Próximo handoff sugerido: Tania abrir o chamado de inclusão do snippet no template Irroba e Fábio decidir sobre Gap A (CSP apex) e Gap B (WEBCHAT_ALLOWED_ORIGINS).*
