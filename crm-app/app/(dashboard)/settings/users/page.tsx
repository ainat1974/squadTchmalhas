import { SettingsComingSoon } from '@/components/settings/SettingsComingSoon'

export default function SettingsUsersPage() {
  return (
    <SettingsComingSoon
      title="Gestão de Usuários"
      description="Convide a equipe e defina perfis de acesso (RBAC) no CRM."
      features={[
        'Listar usuários ativos (Renato, Vitor, Amanda, etc.)',
        'Convidar por e-mail via Supabase Auth',
        'Atribuir perfis: admin, gestor, vendedor_atacado, atendente_varejo',
        'Desativar usuário com reatribuição de leads',
      ]}
    />
  )
}
