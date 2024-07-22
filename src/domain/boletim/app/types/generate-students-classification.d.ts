import { GenerateBehaviorStatus } from "../utils/get-behavior-average-status.ts";
import { GetGeralStudentAverageStatusResponse } from "../utils/get-geral-student-average-status.ts";
import { AssessmentWithModule } from "../utils/verify-formula.ts";

export interface StudentClassficationByPeriod {
  studentAverage: {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[]
      behaviorsCount: number
      status: GetGeralStudentAverageStatusResponse
    }

    assessments: {
      [x: string]: AssessmentWithModule[]
    }
    assessmentsCount: number
  }
  studentBirthday?: Date
  studentCivilID?: number
}

export interface StudentClassficationByModule {
  studentAverage: {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[] | GenerateBehaviorStatus
      behaviorsCount: number
      status: GetGeralStudentAverageStatusResponse
    }
  
    assessments: AssessmentWithModule[]
    assessmentsCount: number
  }
  studentBirthday?: Date
  studentCivilID?: number
}