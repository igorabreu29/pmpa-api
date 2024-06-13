import { describe, expect, it } from "vitest";
import { generateAssessmentAverage } from "./generate-assessment-average.ts";

describe('Generate Assessment Average', () => {
  it ('should be able to receive assessment inform if the student with vfe', () => {
    const assessmentAverage = generateAssessmentAverage({ vf: 7, avi: 7, avii: 0, vfe: 5 })

    expect(assessmentAverage).toMatchObject({
      vf: 7,
      avi: 7,
      avii: 0,
      vfe: 5,
      average: 5.5,
      status: 'approved second season',
      isRecovering: true
    })
  })

  it ('should be able to receive assessment inform', () => {
    const assessmentAverage = generateAssessmentAverage({ vf: 7, avi: 7, avii: 0, vfe: null })

    expect(assessmentAverage).toMatchObject({
      vf: 7,
      avi: 7,
      avii: 0,
      vfe: null,
      average: 7,
      status: 'approved',
      isRecovering: false
    })
  })
})