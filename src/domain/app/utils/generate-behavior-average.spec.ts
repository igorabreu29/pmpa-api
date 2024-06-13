import { describe, expect, it } from "vitest";
import { generateBehaviorAverage } from "./generate-behavior-average.ts";

describe('Behavior Average', () => {
  it ('should be able to generate average behavior with formule equals module', () => {
    const behaviorMonths = [
      {
        january: 7,
        february: 7,
        march: 8,
        april: 7,
      },
    ]

    const behaviorAverageByModule = generateBehaviorAverage({ formule: 'module', behaviorMonths })

    expect(behaviorAverageByModule.behaviorAverageStatus).toMatchObject({
      status: 'approved',
      behaviorAverage: 7.25
    })
  })

  it ('should be able to generate average behavior with formule equals period', () => {
    const behaviorMonths = [
      {
        august: 7,
        september: 7,
        october: 7,
        november: 8,
        december: 8,
      },
      {
        january: 9.5,
        february: 7.5,
        march: 6.2,
      },
    ]

    const behaviorAverageByPeriod = generateBehaviorAverage({ formule: 'period', behaviorMonths })

    expect(behaviorAverageByPeriod.behaviorAverageStatus).toMatchObject([
      {
        behaviorAverage: 7.75,
        status: 'approved'
      },
      {
        behaviorAverage: 6.85,
        status: 'approved'
      },
    ])
  })
})