type BehaviorStatus = 'disapproved' | 'approved'

type Concept =
  | 'excellent'
  | 'very good'
  | 'good'
  | 'regular'
  | 'insufficient'
  | 'no income'

type GeralStatus =
  | 'approved'
  | 'disapproved'
  | 'approved second season'
  | 'disapproved second season'
  | 'second season'

type Status =
  | 'approved'
  | 'disapproved'
  | 'approved second season'
  | 'second season'

export const behaviorStatusMap: Record<BehaviorStatus, string> = {
  approved: 'Aprovado',
  disapproved: 'Reprovado',
}

export const conceptMap: Record<Concept, string> = {
  excellent: 'Excelente',
  'very good': 'Muito bom',
  good: 'Bom',
  regular: 'Regular',
  insufficient: 'Insuficiente',
  'no income': 'Sem renda',
}

export const overallStatusMap: Record<GeralStatus, string> = {
  approved: 'Aprovado',
  disapproved: 'Reprovado',
  'approved second season': 'Aprovado em segunda época',
  'disapproved second season': 'Reprovado em segunda época',
  'second season': 'Segunda época',
}

export const statusMap: Record<Status, string> = {
  approved: 'Aprovado',
  disapproved: 'Reprovado',
  'approved second season': 'Aprovado em segunda época',
  'second season': 'Segunda época',
}
