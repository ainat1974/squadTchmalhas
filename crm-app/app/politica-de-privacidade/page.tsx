import Link from 'next/link'
import { BrandMark } from '@/components/brand/BrandMark'

export const metadata = {
  title: 'Política de Privacidade — Techmalhas',
}

export default function PoliticaPrivacidadePage() {
  return (
    <div className="bg-canvas min-h-screen text-fg-primary">
      <header className="border-b border-sutil bg-card px-6 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <BrandMark variant="sidebar" />
          <Link
            href="/login"
            className="text-sm text-brand-gold hover:underline"
          >
            Acessar CRM
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 prose prose-invert">
        <h1 className="text-2xl font-semibold text-fg-primary">
          Política de Privacidade — Techmalhas
        </h1>
        <p className="text-sm text-fg-muted">Versão mínima · atualizado em maio/2026</p>

        <section className="mt-8 space-y-4 text-sm leading-relaxed text-fg-secondary">
          <h2 className="text-lg font-semibold text-fg-primary">1. Quem somos</h2>
          <p>
            A <strong>Techmalhas</strong> (CNPJ e endereço completos disponíveis mediante solicitação)
            é a controladora dos dados pessoais tratados neste CRM e nos canais de atendimento
            (site, webchat e WhatsApp Business).
          </p>

          <h2 className="text-lg font-semibold text-fg-primary">2. Dados coletados</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Nome, e-mail, telefone e mensagens enviadas via webchat ou WhatsApp</li>
            <li>Dados de navegação no site (URL da página, IP, user-agent) ao iniciar o chat</li>
            <li>Dados comerciais inseridos pela equipe (empresa, CNPJ/CPF quando aplicável)</li>
          </ul>

          <h2 className="text-lg font-semibold text-fg-primary">3. Finalidade</h2>
          <p>
            Atendimento comercial, registro de pedidos e orçamentos, relacionamento B2B/B2C,
            cumprimento de obrigações legais e melhoria dos nossos serviços.
          </p>

          <h2 className="text-lg font-semibold text-fg-primary">4. Base legal (LGPD)</h2>
          <p>
            Consentimento (art. 7º, I) para comunicações de marketing; execução de contrato ou
            procedimentos preliminares (art. 7º, V) para atendimento e vendas; legítimo interesse
            (art. 7º, IX) para segurança e prevenção a fraudes, quando aplicável.
          </p>

          <h2 className="text-lg font-semibold text-fg-primary">5. Retenção</h2>
          <p>
            Mantemos os dados enquanto durar o relacionamento comercial e pelo prazo legal
            aplicável (mínimo 5 anos para registros fiscais quando houver transação). Dados de
            chat inativos podem ser anonimizados após 24 meses.
          </p>

          <h2 className="text-lg font-semibold text-fg-primary">6. Seus direitos</h2>
          <p>
            Você pode solicitar acesso, correção, exclusão, portabilidade, revogação do consentimento
            e informações sobre compartilhamento. Entre em contato com nosso encarregado (DPO):
          </p>
          <p className="rounded-lg border border-sutil bg-card p-4">
            <strong>E-mail DPO:</strong>{' '}
            <a href="mailto:privacidade@techmalhas.com.br" className="text-brand-gold hover:underline">
              privacidade@techmalhas.com.br
            </a>
          </p>

          <h2 className="text-lg font-semibold text-fg-primary">7. Compartilhamento</h2>
          <p>
            Utilizamos provedores de infraestrutura (Vercel, Supabase) e, quando configurado,
            Meta (WhatsApp Cloud API). Não vendemos dados pessoais a terceiros.
          </p>

          <h2 className="text-lg font-semibold text-fg-primary">8. Segurança</h2>
          <p>
            Aplicamos controle de acesso, criptografia em trânsito (HTTPS) e registro de auditoria
            nas operações sensíveis do CRM.
          </p>
        </section>

        <p className="mt-10 text-xs text-fg-muted">
          Esta é uma versão resumida para operação do webchat. Uma política completa pode ser
          publicada posteriormente com revisão jurídica.
        </p>
      </main>
    </div>
  )
}
