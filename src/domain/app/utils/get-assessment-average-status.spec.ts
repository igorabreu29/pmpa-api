import { describe, expect, it } from "vitest";
import { getStudentAssessmentAverageStatus } from "./get-assessment-average-status.ts";

describe('Assessment Average Status', () => {
  it ('should be able to receive "approved second season" if the student is recovering and the average is greater than or equal 10', () => {
    const assessmentAverageStatus = getStudentAssessmentAverageStatus({ average: 12, isRecovering: true })

    expect(assessmentAverageStatus.status).toEqual('approved second season')
  })

  it ('should be able to receive "disapproved" if the student is recovering and the average is less than 10', () => {
    const behaviorAverageStatus = getStudentAssessmentAverageStatus({ average: 8, isRecovering: true })

    expect(behaviorAverageStatus.status).toEqual('disapproved')
  })

  it ('should be able to receive "approved" if the student is not recovering and the average is greater than or equal 7 and less than or equal 10', () => {
    const behaviorAverageStatus = getStudentAssessmentAverageStatus({ average: 8, isRecovering: false })

    expect(behaviorAverageStatus.status).toEqual('approved')
  })

  it ('should be able to receive "second season" if the student is not recovering and the average is less than 7', () => {
    const behaviorAverageStatus = getStudentAssessmentAverageStatus({ average: 5, isRecovering: false })

    expect(behaviorAverageStatus.status).toEqual('second season')
  })
})