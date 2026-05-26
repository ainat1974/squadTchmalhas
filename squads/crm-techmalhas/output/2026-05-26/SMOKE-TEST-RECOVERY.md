# Smoke Test — Sprint Recovery (15 fluxos)

**Data:** 2026-05-26 · Marque ✅ / ❌ após validação manual em preview ou produção.

| # | Fluxo | Resultado | Notas |
|---|-------|-----------|-------|
| 1 | Login e-mail/senha → redirect pipeline | ⏳ manual | |
| 2 | Login Google OAuth | ⏳ manual | |
| 3 | Criar contato em `/leads/new` | ⏳ manual | rota protegida |
| 4 | Criar deal em `/deals/new` | ⏳ manual | rota protegida |
| 5 | Mover deal sem tarefa obrigatória pendente | ⏳ manual | |
| 6 | Mover deal COM tarefa obrigatória → 409 | ⏳ manual | |
| 7 | Concluir tarefa e mover novamente | ⏳ manual | |
| 8 | Abrir `/deals/[id]` | ⏳ manual | |
| 9 | Fechar Won → KPI dashboard atualiza | ⏳ manual | |
| 10 | Fechar Lost com motivo | ⏳ manual | |
| 11 | Enviar WhatsApp em `/whatsapp` | ⏳ manual | |
| 12 | Webhook WhatsApp (mock/staging) | ⏳ manual | |
| 13 | `/embed/chat` form + thread | ✅ auto | página 200; API sessão 201 + mensagem visitante 201 (26/05) |
| 14 | `/politica-de-privacidade` acessível | ✅ auto 200 | |
| 15 | Logout + `/dashboard` → `/login` | ✅ auto | `/dashboard` → 307 login sem cookie |

**Mínimo go-live:** 12/15 passando.
