# Decisão de Arquitetura — Checkpoint 2

**Data:** 2026-05-24 17:30
**Aprovado por:** Tania (Techmalhas)

## Decisões

### Arquitetura Geral
Aprovada integralmente. Stack: Next.js 15 + TypeScript estrito + Prisma 6.x + Supabase (Postgres + Auth + Realtime) + Vercel.

### Custo Mensal
Aprovado. Estimativa R$ 296–R$ 504/mês compreendida e aceita.
Composição: Vercel Pro (~R$104) + Supabase Pro (~R$130) + Meta WhatsApp pay-as-you-go (~R$52–260) + domínio (~R$10).

### Integração Instagram
Desenvolver módulo completo agora, ativar via feature toggle quando Meta aprovar (2–4 semanas).
Tania verificará o setup da Página do Facebook em paralelo ao desenvolvimento.

### Integração Dapic
Campos `dapic_id` e `dapic_pedido_id` reservados no ERD. Integração real no v2 após consulta ao suporte Dapic.

## Ajustes Solicitados em ADRs
Nenhum. Arquitetura aprovada sem alterações.

## Próximos Passos
Pipeline prosseguirá para Steps 08–10 (Database, Backend API, Frontend) com Fábio Fullstack,
implementando segundo a arquitetura aprovada.

⚠️ A partir deste ponto, mudanças estruturais (stack, modelo de dados, integrações)
exigirão refatoração custosa.
