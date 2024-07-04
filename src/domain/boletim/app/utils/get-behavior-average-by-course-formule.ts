import { getBehaviorAverageStatus } from "./get-behavior-average-status.ts"

interface FormuleTypeProps {
  behaviorMonthsNotes: (number | null)[]
}

export interface BehaviorAveragePerPeriod {
  average: number
  behaviorsCount: number
}

export const formuleType = {
  period: ({ behaviorMonthsNotes }: FormuleTypeProps) => {
    const TOTAL_TIME_PER_PERIOD = 6
    const behaviorAveragePerPeriod: BehaviorAveragePerPeriod[] = []

    for (let i = 0; i < behaviorMonthsNotes.length; i += TOTAL_TIME_PER_PERIOD) {
      const behaviorPerPeriod = behaviorMonthsNotes.map(behavior => Number(behavior)).slice(i, i + 6)
      const behaviorAverage = behaviorPerPeriod.reduce((previousNote, currentNote) => previousNote + currentNote, 0) / behaviorPerPeriod.length
      behaviorAveragePerPeriod.push({
        average: behaviorAverage,
        behaviorsCount: behaviorPerPeriod.length
      });
    }

    const behaviorAverageStatus = behaviorAveragePerPeriod.map(behaviorAverage => getBehaviorAverageStatus(Number(behaviorAverage.average.toFixed(3))))

    return {
      behaviorAverageStatus,
      behaviorsCount: behaviorAveragePerPeriod.reduce((previousBehavior, currentBehavior) => previousBehavior + currentBehavior.behaviorsCount , 0)
    }
  },

  module: ({ behaviorMonthsNotes }: FormuleTypeProps) => {
    const behaviorsAverage = Number(behaviorMonthsNotes.reduce((previousNote, currentNote) => Number(previousNote) + Number(currentNote), 0)) / behaviorMonthsNotes.length
    const behaviorAverageStatus = getBehaviorAverageStatus(Number(behaviorsAverage.toFixed(3)))

    const behaviorsCount = behaviorMonthsNotes.length

    return {
      behaviorAverageStatus,
      behaviorsCount
    }
  } 
}