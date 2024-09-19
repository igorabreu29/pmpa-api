import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import type { GetGeralStudentAverageStatusResponse } from "../get-geral-student-average-status.ts";
import type { GenerateBehaviorStatus } from "../get-behavior-average-status.ts";

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

export interface StudentWithBehaviorAverage {
  behaviorAverage: {
    behaviorAverageStatus: GenerateBehaviorStatus[]
    behaviorsCount: number
  }
  studentName: string
  studentBirthday: Date
  studentCivilID: string
  studentPole: {
    id: UniqueEntityId
    name: string
  }
}

export interface PoleAverageClassification {
  poleAverage: {
    poleId: string
    name: string
    average: number
  }
}

export const ranksStudentsByAveragePole = (assessmentsAverage: PoleAverageClassification[]) => {
  return assessmentsAverage.sort((studentA, studentB) => {
    const geralAverageStudentA = studentA.poleAverage.average
    const geralAverageStudentB = studentB.poleAverage.average

    if (geralAverageStudentA !== geralAverageStudentB) {
      return Number(geralAverageStudentB) - Number(geralAverageStudentA)
    }

    return 0
  })
}