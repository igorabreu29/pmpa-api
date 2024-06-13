import { describe, it, expect } from 'vitest'
import { calculatesAverageWithWeight } from './calculates-average-with-weight.ts'

describe('Calculate Average With Weight', () => {
  it ('should be able to calculate average from period with weight 1', () => {
    const assessmentsPerPeriod = [
      {
        average: 7.5,
        module: 1
      },
      {
        average: 8,
        module: 1
      },
    ]

    const result = calculatesAverageWithWeight({
      assessmentAverage: 6.5,
      assessmentsQuantityPerPeriod: assessmentsPerPeriod.length,
      behaviorAveragePerPeriod: 5.5,
      weight: 1
    })

    const expected = 4
    expect(result).toEqual(expected)
  })
 
  it ('should be able to calculate average from period with weight 2', () => {
    const assessmentsPerPeriod = [
      {
        average: 7.5,
        module: 3
      },
      {
        average: 8,
        module: 3
      },
    ]

    const result = calculatesAverageWithWeight({
      assessmentAverage: 6.5,
      assessmentsQuantityPerPeriod: assessmentsPerPeriod.length,
      behaviorAveragePerPeriod: 5.5,
      weight: 2
    })

    const expected = 8
    expect(result).toEqual(expected)
  })

  it ('should be able to calculate average from period without behavior average', () => {
    const assessmentsPerPeriod = [
      {
        average: 7.5,
        module: 3
      },
      {
        average: 8,
        module: 3
      },
    ]

    const result = calculatesAverageWithWeight({
      assessmentAverage: 6.5,
      assessmentsQuantityPerPeriod: assessmentsPerPeriod.length,
      behaviorAveragePerPeriod: 0,
      weight: 2
    })

    const expected = 6.5

    expect(result).toEqual(expected)
  })
})