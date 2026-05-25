/** Mapeia nome do estágio do pipeline para classe CSS v5 (.stage-chip-*). */
export function getStageChipClass(stageName: string): string {
  const n = stageName.toLowerCase()
  if (n.includes('novo') || n.includes('lead')) return 'stage-chip-new'
  if (n.includes('contato')) return 'stage-chip-contact'
  if (n.includes('proposta')) return 'stage-chip-proposal'
  if (n.includes('negoci')) return 'stage-chip-negotiation'
  if (n.includes('ganho') || n.includes('won')) return 'stage-chip-won'
  if (n.includes('perd') || n.includes('lost')) return 'stage-chip-lost'
  return 'stage-chip-new'
}
