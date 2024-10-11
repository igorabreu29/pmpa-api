import { describe, expect, it } from "vitest";
import { generateBehaviorAverage } from "./generate-behavior-average.ts";

describe('Behavior Average', () => {
  it ('should be able to generate average behavior with formula equals module', () => {
    const behaviorMonths = [
      {
        may: 7,
        jun: 7,
        july: 8,
        august: 7,
        september: 7,
        october: 7,
        november: 7,
        december: 7,
        module: 1
      },
      {
        january: 7,
        february: 9.2,
        march: 2.2,
        april: 8.53,
        module: 1
      }
    ]

    const behaviorAverageByModule = generateBehaviorAverage({ behaviorMonths })

    expect(behaviorAverageByModule).toMatchObject({
      behaviorAverageStatus: [{
        behaviorAverage: 6.994, 
        status: 'approved'
      }],
      behaviorsCount: 12
    })
  })

  it ('should be able to generate average behavior with formula equals period', () => {
    const behaviorMonths = [
      {
        august: 7,
        september: 7,
        october: 7,
        november: 8,
        december: 8,
        january: 9.5,
        module: 1
      },
      {
        february: 7.5,
        march: 6.2,
        module: 2
      },
    ]

    const behaviorAverageByPeriod = generateBehaviorAverage({ isPeriod: true, behaviorMonths })

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