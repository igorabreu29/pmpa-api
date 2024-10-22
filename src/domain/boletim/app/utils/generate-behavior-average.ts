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
  module: number
}

export interface GenerateBehaviorAverageProps {
  behaviorMonths: BehaviorMonths[]
  isPeriod?: boolean
  decimalPlaces?: number
}

export interface BehaviorsPerPeriod {
  [x: string]: number[]
}

export function generateBehaviorAverage({ behaviorMonths, isPeriod = false, decimalPlaces }: GenerateBehaviorAverageProps) {
  const behaviorsPerPeriod: BehaviorsPerPeriod = {}

  for (const behavior of behaviorMonths) {
    const { module: behaviorModule, ...months } = behavior

    if (!behaviorsPerPeriod[behaviorModule]) {
      behaviorsPerPeriod[behaviorModule] = []
    }

    const grades = Object.values(months).filter(item => item !== null && item !== undefined)

    behaviorsPerPeriod[behaviorModule].push(...grades)
  }

  return defineBehaviorByFormulaType[isPeriod ? 'period' : 'module']({ behaviorsPerPeriod, decimalPlaces })
}