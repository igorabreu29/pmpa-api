import type { BehaviorsPerPeriod } from "./generate-behavior-average.ts"
import { getBehaviorAverageStatus } from "./get-behavior-average-status.ts"

interface FormulaTypeProps {
  behaviorsPerPeriod: BehaviorsPerPeriod
  decimalPlaces?: number
}

export interface BehaviorAveragePerPeriod {
  average: number
  behaviorsCount: number
}

export const defineBehaviorByFormulaType = {
  period: ({ behaviorsPerPeriod, decimalPlaces }: FormulaTypeProps) => {
    const behaviorKeys = Object.keys(behaviorsPerPeriod)

    const behaviorAveragePerPeriod = behaviorKeys.map(item => {
      const behaviorAverage = behaviorsPerPeriod[item].reduce((grade, currentGrade) => grade + currentGrade, 0) / behaviorsPerPeriod[item].length

      return {
        average: behaviorAverage,
        behaviorsCount: behaviorsPerPeriod[item].length
      }
    })

    const behaviorAverageStatus = behaviorAveragePerPeriod.map(behaviorAverage => getBehaviorAverageStatus(Number(behaviorAverage.average.toFixed(decimalPlaces ?? 3))))
    const behaviorsCount = behaviorAveragePerPeriod.reduce((previousBehavior, currentBehavior) => previousBehavior + currentBehavior.behaviorsCount, 0)

    return {
      behaviorAverageStatus,
      behaviorsCount
    }
  },

  module: ({ behaviorsPerPeriod, decimalPlaces }: FormulaTypeProps) => {
    if (behaviorsPerPeriod[1]?.length) {
      const behaviorsAverage = Number(behaviorsPerPeriod[1].reduce((previousNote, currentNote) => Number(previousNote) + Number(currentNote), 0)) / behaviorsPerPeriod[1]?.length
      const behaviorAverageStatus = getBehaviorAverageStatus(Number(behaviorsAverage?.toFixed(decimalPlaces ?? 3)) || 0)
  
      const behaviorsCount = behaviorsPerPeriod[1].length

      return {
        behaviorAverageStatus: [behaviorAverageStatus],
        behaviorsCount: behaviorsCount
      }
    }

    return {
      behaviorAverageStatus: [],
      behaviorsCount: 0
    }
  } 
}