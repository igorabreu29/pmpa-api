import { describe, expect, it } from "vitest";
import { formuleType } from "./get-behavior-average-by-course-formule.ts";

describe('Behavior Average By Formule', () => {
  it ('should be able to get behavior average with period formule', () => {
    const behaviorMonthsNotes = [
      5, 6, 7, 8, 6, 6, 6, 7, 8
    ]

    expect(formuleType['period']({ behaviorMonthsNotes })).toMatchObject({
      behaviorAverageStatus: expect.arrayContaining([
        {
          behaviorAverage: 6.333,
          status: 'approved'
        },
        {
          behaviorAverage: 7,
          status: 'approved'
        }
      ])
    })
  })

  it ('should be able to get behavior average with module formule', () => {
    const behaviorMonthsNotes = [
      5, 6, 7, 8, 6, 6, 6, 7, 8
    ]

    const formuleTypeModule = formuleType['module']({ behaviorMonthsNotes })

    expect(formuleTypeModule).toMatchObject({
      behaviorAverageStatus: {
        behaviorAverage: 6.556,
        status: 'approved'
      },
      behaviorsCount: 9
    })
  })
})