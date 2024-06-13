import { describe, expect, it } from "vitest"
import { makeAssessment } from "test/factories/make-assessment.ts"
import { Assessment } from "./assessment.ts"

describe('Assessment Entity', () => {
  it ('should be able to receive a id after create assessment', () => {
    const assessment = makeAssessment()
    
    expect(assessment.id).toBeTruthy()
  })

  it ('should be able to receive assessment', () => {
    const assessment = makeAssessment()

    expect(assessment).toBeInstanceOf(Assessment)
    expect(assessment).toMatchObject({
      id: assessment.id,
      studentId: assessment.studentId,
      courseId: assessment.courseId,
      poleId: assessment.poleId,
      disciplineId: assessment.disciplineId,
      vf: assessment.vf,
      vfe: assessment.vfe,
      avi: assessment.avi,
      avii: assessment.avii,
    })
  })
})