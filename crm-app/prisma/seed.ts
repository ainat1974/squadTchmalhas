/**
 * prisma/seed.ts — Seed de desenvolvimento CRM Techmalhas
 * 
 * Cria:
 * - 4 usuários (admin, gestor, vendedor_atacado, atendente_varejo)
 * - 2 pipelines com stages padrão e tarefas obrigatórias
 * - 7 lead sources
 * - 10 contatos (5 B2B + 5 B2C)
 * - 5 deals (3 atacado + 2 varejo)
 * - Activities de teste
 *
 * ATENÇÃO: Este seed manipula diretamente via Prisma (bypassa RLS).
 * Em produção, usuários são criados via Supabase Auth.
 *
 * Executar: pnpm tsx prisma/seed.ts
 */

import { PrismaClient, UserRole, PipelineType, ActivityType } from '@prisma/client'

const prisma = new PrismaClient()

// UUIDs fixos para referências entre entidades no seed
const SEED_IDS = {
  users: {
    admin:            'a0000000-0000-0000-0000-000000000001',
    gestor:           'a0000000-0000-0000-0000-000000000002',
    vendedorAtacado:  'a0000000-0000-0000-0000-000000000003',
    atendenteVarejo:  'a0000000-0000-0000-0000-000000000004',
  },
  leadSources: {
    whatsapp:         'b0000000-0000-0000-0000-000000000001',
    instagramDm:      'b0000000-0000-0000-0000-000000000002',
    instagramComent:  'b0000000-0000-0000-0000-000000000003',
    formularioSite:   'b0000000-0000-0000-0000-000000000004',
    chatSite:         'b0000000-0000-0000-0000-000000000005',
    manual:           'b0000000-0000-0000-0000-000000000006',
    indicacao:        'b0000000-0000-0000-0000-000000000007',
  },
  pipelines: {
    atacado:  'c0000000-0000-0000-0000-000000000001',
    varejo:   'c0000000-0000-0000-0000-000000000002',
  },
}

async function seedUsers() {
  console.log('🌱 Criando usuários...')
  
  const users = [
    {
      id:       SEED_IDS.users.admin,
      email:    'admin@techmalhas.com.br',
      fullName: 'Admin Techmalhas',
      role:     UserRole.admin,
    },
    {
      id:       SEED_IDS.users.gestor,
      email:    'renato@techmalhas.com.br',
      fullName: 'Renato Gestor',
      role:     UserRole.gestor,
    },
    {
      id:       SEED_IDS.users.vendedorAtacado,
      email:    'vitor@techmalhas.com.br',
      fullName: 'Vitor Vendedor',
      role:     UserRole.vendedor_atacado,
    },
    {
      id:       SEED_IDS.users.atendenteVarejo,
      email:    'amanda@techmalhas.com.br',
      fullName: 'Amanda Atendente',
      role:     UserRole.atendente_varejo,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where:  { id: user.id },
      update: {},
      create: user,
    })
  }
  console.log(`  ✅ ${users.length} usuários criados`)
}

async function seedLeadSources() {
  console.log('🌱 Criando lead sources...')

  const sources = [
    { id: SEED_IDS.leadSources.whatsapp,       name: 'WhatsApp Direto',      type: 'whatsapp'   as const },
    { id: SEED_IDS.leadSources.instagramDm,    name: 'Instagram DM',         type: 'instagram'  as const },
    { id: SEED_IDS.leadSources.instagramComent,name: 'Instagram Comentário', type: 'instagram'  as const },
    { id: SEED_IDS.leadSources.formularioSite, name: 'Formulário Site',      type: 'site_form'  as const },
    { id: SEED_IDS.leadSources.chatSite,       name: 'Chat ao Vivo Site',    type: 'site_chat'  as const },
    { id: SEED_IDS.leadSources.manual,         name: 'Manual (Vendedor)',    type: 'manual'     as const },
    { id: SEED_IDS.leadSources.indicacao,      name: 'Indicação',            type: 'referral'   as const },
  ]

  for (const source of sources) {
    await prisma.leadSource.upsert({
      where:  { id: source.id },
      update: {},
      create: source,
    })
  }
  console.log(`  ✅ ${sources.length} lead sources criados`)
}

async function seedPipelines() {
  console.log('🌱 Criando pipelines e stages...')

  // ─── Pipeline Atacado (B2B — Lojistas) ───────────────────
  const atacado = await prisma.pipeline.upsert({
    where:  { type: PipelineType.atacado },
    update: {},
    create: {
      id:          SEED_IDS.pipelines.atacado,
      name:        'Pipeline Atacado',
      type:        PipelineType.atacado,
      description: 'Oportunidades B2B com lojistas',
    },
  })

  const stagesAtacado = [
    { name: 'Novo Lead',         position: 0, color: '#6366f1', probability: 5  },
    { name: 'Contato Realizado', position: 1, color: '#3b82f6', probability: 15 },
    { name: 'Proposta Enviada',  position: 2, color: '#f59e0b', probability: 40 },
    { name: 'Negociação',        position: 3, color: '#f97316', probability: 70 },
    { name: 'Pedido Fechado',    position: 4, color: '#22c55e', probability: 100, isWonStage: true  },
    { name: 'Perdido',           position: 5, color: '#ef4444', probability: 0,   isLostStage: true },
  ]

  const createdStagesAtacado: Array<{ id: string; position: number; name: string }> = []
  for (const stage of stagesAtacado) {
    const created = await prisma.stage.upsert({
      where:  { pipelineId_position: { pipelineId: atacado.id, position: stage.position } },
      update: {},
      create: { ...stage, pipelineId: atacado.id },
    })
    createdStagesAtacado.push(created)
  }

  // Tarefas obrigatórias no stage "Proposta Enviada" (posição 2)
  const stagePropostaAtacado = createdStagesAtacado.find(s => s.position === 2)!
  await prisma.stageRequiredTask.createMany({
    skipDuplicates: true,
    data: [
      {
        stageId:        stagePropostaAtacado.id,
        title:          'Enviar tabela de preços atualizada',
        activityType:   ActivityType.task,
        dueDaysOffset:  1,
      },
      {
        stageId:        stagePropostaAtacado.id,
        title:          'Confirmar recebimento da proposta por WhatsApp',
        activityType:   ActivityType.whatsapp,
        dueDaysOffset:  2,
      },
    ],
  })

  // ─── Pipeline Varejo (B2C — Consumidores) ────────────────
  const varejo = await prisma.pipeline.upsert({
    where:  { type: PipelineType.varejo },
    update: {},
    create: {
      id:          SEED_IDS.pipelines.varejo,
      name:        'Pipeline Varejo',
      type:        PipelineType.varejo,
      description: 'Oportunidades B2C com consumidores finais',
    },
  })

  const stagesVarejo = [
    { name: 'Novo Lead',          position: 0, color: '#6366f1', probability: 5  },
    { name: 'Atendimento Ativo',  position: 1, color: '#3b82f6', probability: 20 },
    { name: 'Carrinho / Orçado',  position: 2, color: '#f59e0b', probability: 50 },
    { name: 'Compra Confirmada',  position: 3, color: '#22c55e', probability: 100, isWonStage: true  },
    { name: 'Desistiu',           position: 4, color: '#ef4444', probability: 0,   isLostStage: true },
  ]

  const createdStagesVarejo: Array<{ id: string; position: number }> = []
  for (const stage of stagesVarejo) {
    const created = await prisma.stage.upsert({
      where:  { pipelineId_position: { pipelineId: varejo.id, position: stage.position } },
      update: {},
      create: { ...stage, pipelineId: varejo.id },
    })
    createdStagesVarejo.push(created)
  }

  const stageCarrinhoVarejo = createdStagesVarejo.find((s) => s.position === 2)!
  await prisma.stageRequiredTask.createMany({
    skipDuplicates: true,
    data: [
      {
        stageId:       stageCarrinhoVarejo.id,
        title:         'Enviar link de pagamento',
        activityType:  ActivityType.task,
        dueDaysOffset: 1,
      },
    ],
  })

  console.log('  ✅ 2 pipelines com stages criados (atacado: 6 stages, varejo: 5 stages)')
  return { atacadoId: atacado.id, varejoId: varejo.id, stagesAtacado: createdStagesAtacado }
}

async function seedContacts() {
  console.log('🌱 Criando contatos...')

  const contacts = [
    // B2B — Lojistas (atacado)
    {
      fullName: 'José Moreira',      email: 'jose@modajoao.com.br',     phone: '+5511999991001',
      companyName: 'Moda João LTDA', isB2b: true, pipelineType: PipelineType.atacado,
      leadSourceId: SEED_IDS.leadSources.whatsapp,    assignedTo: SEED_IDS.users.vendedorAtacado,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-01'),
      tags: ['lojista', 'atacado', 'sp'],
    },
    {
      fullName: 'Fernanda Lima',     email: 'fernanda@boutiquefem.com', phone: '+5511999991002',
      companyName: 'Boutique Fem',   isB2b: true, pipelineType: PipelineType.atacado,
      leadSourceId: SEED_IDS.leadSources.instagramDm, assignedTo: SEED_IDS.users.vendedorAtacado,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-05'),
      tags: ['lojista', 'atacado', 'mg'],
    },
    {
      fullName: 'Roberto Alves',     email: 'roberto@altamoda.com',    phone: '+5521999991003',
      companyName: 'Alta Moda RJ',   isB2b: true, pipelineType: PipelineType.atacado,
      leadSourceId: SEED_IDS.leadSources.formularioSite, assignedTo: SEED_IDS.users.vendedorAtacado,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-10'),
      tags: ['lojista', 'atacado', 'rj'],
    },
    {
      fullName: 'Patricia Souza',    email: 'patricia@styles.com.br',  phone: '+5531999991004',
      companyName: 'Styles MG',      isB2b: true, pipelineType: PipelineType.atacado,
      leadSourceId: SEED_IDS.leadSources.indicacao,   assignedTo: SEED_IDS.users.vendedorAtacado,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-12'),
      tags: ['lojista', 'atacado', 'novo'],
    },
    {
      fullName: 'Carlos Mendes',     email: 'carlos@fashionbr.com',    phone: '+5511999991005',
      companyName: 'Fashion BR',     isB2b: true, pipelineType: PipelineType.atacado,
      leadSourceId: SEED_IDS.leadSources.manual,      assignedTo: SEED_IDS.users.vendedorAtacado,
      lgpdConsent: false,
      tags: ['lojista', 'atacado', 'lgpd-pendente'],
    },
    // B2C — Consumidores (varejo)
    {
      fullName: 'Ana Beatriz Costa', email: 'ana.beatriz@gmail.com',   phone: '+5511988881001',
      isB2b: false, pipelineType: PipelineType.varejo,
      leadSourceId: SEED_IDS.leadSources.instagramDm, assignedTo: SEED_IDS.users.atendenteVarejo,
      instagramId: '123456789', instagramUsername: 'ana.bea',
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-15'),
      tags: ['varejo', 'instagram', 'feminino'],
    },
    {
      fullName: 'Lucas Ferreira',    email: 'lucas.f@hotmail.com',     phone: '+5511988881002',
      isB2b: false, pipelineType: PipelineType.varejo,
      leadSourceId: SEED_IDS.leadSources.chatSite,    assignedTo: SEED_IDS.users.atendenteVarejo,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-16'),
      tags: ['varejo', 'chat', 'masculino'],
    },
    {
      fullName: 'Mariana Oliveira',  email: 'mari.oliveira@gmail.com', phone: '+5521988881003',
      isB2b: false, pipelineType: PipelineType.varejo,
      leadSourceId: SEED_IDS.leadSources.whatsapp,    assignedTo: SEED_IDS.users.atendenteVarejo,
      whatsappPhone: '+5521988881003',
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-17'),
      tags: ['varejo', 'whatsapp'],
    },
    {
      fullName: 'Joana Ribeiro',     email: null,                      phone: '+5531988881004',
      isB2b: false, pipelineType: PipelineType.varejo,
      leadSourceId: SEED_IDS.leadSources.instagramComent, assignedTo: SEED_IDS.users.atendenteVarejo,
      instagramId: '987654321', instagramUsername: 'joana_r',
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-18'),
      tags: ['varejo', 'instagram', 'comentario'],
    },
    {
      fullName: 'Pedro Nunes',       email: 'pedro.nunes@outlook.com', phone: '+5511988881005',
      isB2b: false, pipelineType: PipelineType.varejo,
      leadSourceId: SEED_IDS.leadSources.formularioSite, assignedTo: SEED_IDS.users.atendenteVarejo,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-20'),
      tags: ['varejo', 'formulario'],
    },
  ]

  const created = []
  for (const contact of contacts) {
    const c = await prisma.contact.create({ data: contact })
    created.push(c)
  }

  console.log(`  ✅ ${created.length} contatos criados (5 B2B + 5 B2C)`)
  return created
}

async function seedDeals(
  contacts: Awaited<ReturnType<typeof seedContacts>>,
  stagesAtacado: Array<{ id: string; position: number; name: string }>,
) {
  console.log('🌱 Criando deals...')

  const pipelineAtacado = await prisma.pipeline.findUnique({ where: { type: 'atacado' } })
  const pipelineVarejo  = await prisma.pipeline.findUnique({ where: { type: 'varejo'  } })
  const stagesVarejo    = await prisma.stage.findMany({ where: { pipelineId: pipelineVarejo!.id }, orderBy: { position: 'asc' } })

  const b2bContacts  = contacts.filter(c => c.isB2b)
  const b2cContacts  = contacts.filter(c => !c.isB2b)

  const deals = [
    // Atacado
    {
      title:      `Pedido inicial — ${b2bContacts[0]!.companyName}`,
      contactId:  b2bContacts[0]!.id,
      pipelineId: pipelineAtacado!.id,
      stageId:    stagesAtacado.find(s => s.position === 2)!.id, // Proposta Enviada
      assignedTo: SEED_IDS.users.vendedorAtacado,
      createdBy:  SEED_IDS.users.vendedorAtacado,
      value:      8500.00,
      currency:   'BRL',
    },
    {
      title:      `Negociação coleção inverno — ${b2bContacts[1]!.companyName}`,
      contactId:  b2bContacts[1]!.id,
      pipelineId: pipelineAtacado!.id,
      stageId:    stagesAtacado.find(s => s.position === 3)!.id, // Negociação
      assignedTo: SEED_IDS.users.vendedorAtacado,
      createdBy:  SEED_IDS.users.vendedorAtacado,
      value:      15000.00,
      currency:   'BRL',
    },
    {
      title:      `Primeiro contato — ${b2bContacts[2]!.companyName}`,
      contactId:  b2bContacts[2]!.id,
      pipelineId: pipelineAtacado!.id,
      stageId:    stagesAtacado.find(s => s.position === 1)!.id, // Contato Realizado
      assignedTo: SEED_IDS.users.vendedorAtacado,
      createdBy:  SEED_IDS.users.vendedorAtacado,
      value:      null,
      currency:   'BRL',
    },
    // Varejo
    {
      title:      `Compra vestido floral — ${b2cContacts[0]!.fullName}`,
      contactId:  b2cContacts[0]!.id,
      pipelineId: pipelineVarejo!.id,
      stageId:    stagesVarejo.find(s => s.position === 2)!.id, // Carrinho / Orçado
      assignedTo: SEED_IDS.users.atendenteVarejo,
      createdBy:  SEED_IDS.users.atendenteVarejo,
      value:      349.90,
      currency:   'BRL',
    },
    {
      title:      `Atendimento WhatsApp — ${b2cContacts[2]!.fullName}`,
      contactId:  b2cContacts[2]!.id,
      pipelineId: pipelineVarejo!.id,
      stageId:    stagesVarejo.find(s => s.position === 1)!.id, // Atendimento Ativo
      assignedTo: SEED_IDS.users.atendenteVarejo,
      createdBy:  SEED_IDS.users.atendenteVarejo,
      value:      null,
      currency:   'BRL',
    },
  ]

  const created = []
  for (const deal of deals) {
    const d = await prisma.deal.create({ data: deal })
    created.push(d)
  }

  console.log(`  ✅ ${created.length} deals criados (3 atacado + 2 varejo)`)

  // Criar atividades de follow-up para o primeiro deal
  await prisma.activity.create({
    data: {
      dealId:     created[0]!.id,
      contactId:  b2bContacts[0]!.id,
      assignedTo: SEED_IDS.users.vendedorAtacado,
      createdBy:  SEED_IDS.users.vendedorAtacado,
      type:       ActivityType.call,
      title:      'Ligar para confirmar recebimento da proposta',
      isMandatory: false,
      isDone:     false,
      dueDate:    new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
    },
  })

  console.log('  ✅ 1 activity de follow-up criada')
}

async function main() {
  console.log('\n🚀 Iniciando seed do CRM Techmalhas...\n')

  await seedUsers()
  await seedLeadSources()
  const { stagesAtacado } = await seedPipelines()
  const contacts = await seedContacts()
  await seedDeals(contacts, stagesAtacado)

  console.log('\n✅ Seed completo!')
  console.log('\n📋 Credenciais de teste (criar via Supabase Auth Dashboard):')
  console.log('   admin@techmalhas.com.br    → role: admin')
  console.log('   renato@techmalhas.com.br   → role: gestor')
  console.log('   vitor@techmalhas.com.br    → role: vendedor_atacado')
  console.log('   amanda@techmalhas.com.br   → role: atendente_varejo')
  console.log('\n⚠️  IMPORTANTE: Os usuários acima precisam ser criados manualmente')
  console.log('   no Supabase Auth Dashboard com os mesmos emails.')
  console.log('   O trigger 003 sincronizará automaticamente para public.users.')
  console.log('   Depois use o Prisma Studio para ajustar os roles conforme necessário.\n')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })