import { GenerateBehaviorStatus } from "../utils/get-behavior-average-status.ts";
import { GetGeralStudentAverageStatusResponse } from "../utils/get-geral-student-average-status.ts";
import { AssessmentWithModule } from "../utils/verify-formula.ts";

export interface StudentClassficationByPeriod {
  studentAverage: {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[]
      behaviorsCount: number
      studentAverageStatus: GetGeralStudentAverageStatusResponse
    }

    assessmentsPerPeriod: {
      [x: string]: AssessmentWithModule[]
    }
    assessments: AssessmentWithModule[]
    assessmentsCount: number
  }
  studentId?: string
  studentBirthday?: Date
  studentName?: string
  studentCivilOrMilitaryId?: string
  studentPole?: string
}

export interface StudentClassficationByModule {
  studentAverage: {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[]
      behaviorsCount: number
      studentAverageStatus: GetGeralStudentAverageStatusResponse
    }
  
    assessments: AssessmentWithModule[]
    assessmentsCount: number
  }
  studentId?: string
  studentBirthday?: Date
  studentName?: string
  studentCivilOrMilitaryId?: string
  studentPole?: string
}