import { SettingsComingSoon } from '@/components/settings/SettingsComingSoon'

export default function SettingsPipelinesPage() {
  return (
    <SettingsComingSoon
      title="Configurar Pipelines"
      description="Edite as etapas do funil Atacado e Varejo e defina tarefas obrigatórias por etapa."
      features={[
        'Renomear pipelines Atacado B2B e Varejo B2C',
        'Adicionar, remover e reordenar etapas (drag & drop)',
        'Definir cor de cada etapa no Kanban',
        'Cadastrar tarefas obrigatórias que bloqueiam avanço do deal',
      ]}
    />
  )
}
