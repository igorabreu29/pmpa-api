import { describe, expect, it } from "vitest";
import { formulaType } from "./get-behavior-average-by-course-formula.ts";

describe('Behavior Average By Formula', () => {
  it ('should be able to get behavior average with period formula', () => {
    const behaviorMonthsNotes = [
      5, 6, 7, 8, 6, 6, 6, 7, 8
    ]

    expect(formulaType['period']({ behaviorMonthsNotes })).toMatchObject({
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

  it ('should be able to get behavior average with module formula', () => {
    const behaviorMonthsNotes = [
      5, 6, 7, 8, 6, 6, 6, 7, 8
    ]

    const formulaTypeModule = formulaType['module']({ behaviorMonthsNotes })

    expect(formulaTypeModule).toMatchObject({
      behaviorAverageStatus: {
        behaviorAverage: 6.556,
        status: 'approved'
      },
      behaviorsCount: 9
    })
  })
})