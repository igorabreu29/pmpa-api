import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import type { GetGeralStudentAverageStatusResponse } from "../get-geral-student-average-status.ts";

export interface StudentWithAssessmentAverage {
    assessmentsAverage: {
      studentAverage: number
      studentAverageWithStatus: GetGeralStudentAverageStatusResponse
      isStudentRecovering: boolean
    };
    studentBirthday: Date;
    studentName: string;
    studentCivilID: string;
    studentPole: {
        id: UniqueEntityId
        name: string
    };
}

export interface AssessmentClassification {
  assessmentAverageByPole: {
    poleId: string
    name: string
    average: number
    studentAverageStatus: GetGeralStudentAverageStatusResponse
  }
}

export const ranksStudentsByAssessmentAverage = (assessmentsAverage: AssessmentClassification[]) => {
  return assessmentsAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.assessmentAverageByPole.average
    const geralAverageStudentB = studentB.assessmentAverageByPole.average

    if (geralAverageStudentA !== geralAverageStudentB) {
      return Number(geralAverageStudentB) - Number(geralAverageStudentA)
    }

    return 0
  })
}