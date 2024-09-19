import { getBehaviorAverageStatus } from "./get-behavior-average-status.ts"

interface FormulaTypeProps {
  behaviorMonthsNotes: (number | null)[]
}

export interface BehaviorAveragePerPeriod {
  average: number
  behaviorsCount: number
}

export const defineBehaviorByFormulaType = {
  period: ({ behaviorMonthsNotes }: FormulaTypeProps) => {
    const TOTAL_MONTH_PER_PERIOD = 6 // 6 months
    const behaviorAveragePerPeriod: BehaviorAveragePerPeriod[] = []

    for (let i = 0; i < behaviorMonthsNotes.length; i += TOTAL_MONTH_PER_PERIOD) {
      const behaviorPerPeriod = behaviorMonthsNotes.map(behavior => Number(behavior)).slice(i, i + 6)
      const behaviorAverage = behaviorPerPeriod.reduce((previousNote, currentNote) => previousNote + currentNote, 0) / behaviorPerPeriod.length
      behaviorAveragePerPeriod.push({
        average: behaviorAverage,
        behaviorsCount: behaviorPerPeriod.length
      });
    }

    const behaviorAverageStatus = behaviorAveragePerPeriod.map(behaviorAverage => getBehaviorAverageStatus(Number(behaviorAverage.average.toFixed(3))))
    const behaviorsCount = behaviorAveragePerPeriod.reduce((previousBehavior, currentBehavior) => previousBehavior + currentBehavior.behaviorsCount, 0)

    return {
      behaviorAverageStatus,
      behaviorsCount
    }
  },

  module: ({ behaviorMonthsNotes }: FormulaTypeProps) => {
    const behaviorsAverage = Number(behaviorMonthsNotes.reduce((previousNote, currentNote) => Number(previousNote) + Number(currentNote), 0)) / behaviorMonthsNotes.length
    const behaviorAverageStatus = getBehaviorAverageStatus(Number(behaviorsAverage.toFixed(3)) || 0)

    const behaviorsCount = behaviorMonthsNotes.length

    return {
      behaviorAverageStatus: [behaviorAverageStatus],
      behaviorsCount
    }
  } 
}