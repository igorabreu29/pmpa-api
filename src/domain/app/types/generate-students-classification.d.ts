import { GenerateBehaviorStatus } from "../utils/get-behavior-average-status.ts";
import { GetGeralStudentAverageStatusResponse } from "../utils/get-geral-student-average-status.ts";
import { AssessmentWithModule } from "../utils/verify-formule.ts";

export interface StudentClassficationByPeriod {
  studentAverage: {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[]
      status: GetGeralStudentAverageStatusResponse
    }

    assessments: {
      [x: string]: AssessmentWithModule[]
    }
  }
  studentBirthday?: Date
}

export interface StudentClassficationByModule {
  studentAverage: {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[] | GenerateBehaviorStatus
      status: GetGeralStudentAverageStatusResponse
    }

    assessments: AssessmentWithModule[]
  }
  studentBirthday?: Date
}