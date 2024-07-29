import { defineBehaviorByFormulaType } from "./get-behavior-average-by-course-formula.ts"

export interface BehaviorMonths {
  january?: number | null
  february?: number | null
  march?: number | null
  april?: number | null
  may?: number | null
  jun?: number | null
  july?: number | null
  august?: number | null
  september?: number | null
  october?: number | null
  november?: number | null
  december?: number | null
}

export interface GenerateBehaviorAverageProps {
  behaviorMonths: BehaviorMonths[]
  isPeriod?: boolean
}

export function generateBehaviorAverage({ behaviorMonths, isPeriod = false }: GenerateBehaviorAverageProps) {
  const behaviorMonthsNotes: (number | null)[] = []

  for (const behaviorMonth of behaviorMonths) {
    const { ...months } = behaviorMonth
    const notes = Object.values(months).filter(item => item !== null && item !== undefined)
    
    behaviorMonthsNotes.push(...notes)
  }

  return defineBehaviorByFormulaType[isPeriod ? 'period' : 'module']({ behaviorMonthsNotes })
}