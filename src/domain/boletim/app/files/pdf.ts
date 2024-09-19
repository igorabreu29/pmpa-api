import { Course } from "../../enterprise/entities/course.ts"
import { Student } from "../../enterprise/entities/student.ts"
import { CourseWithDiscipline } from "../../enterprise/entities/value-objects/course-with-discipline.ts"
import { GenerateBehaviorStatus } from "../utils/get-behavior-average-status.ts"
import { GetGeralStudentAverageStatusResponse } from "../utils/get-geral-student-average-status.ts"
import { AssessmentWithModule } from "../utils/verify-formula.ts"

interface Row {
  course: Course
  student: Student
  grades: {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[] | GenerateBehaviorStatus
      behaviorsCount: number
      studentAverageStatus: GetGeralStudentAverageStatusResponse
    }

    assessmentsPerPeriod: {
      [x: string]: AssessmentWithModule[]
    },
    assessments: AssessmentWithModule[]
    assessmentsCount: number
  } | {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[] | GenerateBehaviorStatus
      behaviorsCount: number
      studentAverageStatus: GetGeralStudentAverageStatusResponse
    }

    assessments: (AssessmentWithModule | null)[],
    assessmentsCount: number
  }
  courseWithDisciplines: CourseWithDiscipline[]
}

export interface PDFCreateProps {
  rows: Row
}

export interface PDF {
  create: ({ rows }: PDFCreateProps) => Promise<{
    filename: string
  }>
}