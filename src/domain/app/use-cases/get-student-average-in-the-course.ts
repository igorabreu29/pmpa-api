import { Formule } from "@/domain/enterprise/entities/course.ts"
import { Role } from "@/domain/enterprise/entities/user.ts"
import { AssessmentsRepository } from "../repositories/assessments-repository.ts"
import { Either, right } from "@/core/either.ts"
import { Assessment } from "@/domain/enterprise/entities/assessment.ts"
import { BehaviorsRepository } from "../repositories/behaviors-repository.ts"
import { generateBehaviorAverage } from "../utils/generate-behavior-average.ts"
import { generateAssessmentAverage } from "../utils/generate-assessment-average.ts"
import { AssessmentWithModule, AssessmentsPerPeriod, formules } from "../utils/verify-formule.ts"
import { GenerateBehaviorStatus } from "../utils/get-behavior-average-status.ts"
import { GetGeralStudentAverageStatusResponse } from "../utils/get-geral-student-average-status.ts"
import { CourseDisciplinesRepository } from "../repositories/course-discipline-repository.ts"

interface GetStudentAverageInTheCourseUseCaseRequest {
  courseId?: string
  userRole?: Role
  studentId: string
  studentCourseId: string
  courseFormule: Formule
}

type GetStudentAverageInTheCourseUseCaseResponse = Either<null, {
  grades: {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[]
      status: GetGeralStudentAverageStatusResponse
    }

    assessments: {
      [x: string]: {
        module: number
        average: number
      }[]
    }
  } | {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[] | GenerateBehaviorStatus
      status: GetGeralStudentAverageStatusResponse
    }

    assessments: AssessmentWithModule[]
  }
}>

export class GetStudentAverageInTheCourseUseCase {
  constructor(
    private assessmentsRepository: AssessmentsRepository,
    private behaviorsRepository: BehaviorsRepository,
    private courseDisciplineRepository: CourseDisciplinesRepository
  ) {}

  async execute({
    courseId,
    userRole,
    studentId,
    studentCourseId,
    courseFormule
}: GetStudentAverageInTheCourseUseCaseRequest): Promise<GetStudentAverageInTheCourseUseCaseResponse> {
    let assessments: Assessment[]
    if (userRole === 'manager' && courseId === studentCourseId) {
      assessments = await this.assessmentsRepository.findManyByStudentIdAndCourseId({ 
        userRole,
        courseId, 
        studentId, 
        studentCourseId 
      })
    }

    assessments = await this.assessmentsRepository.findManyByStudentIdAndCourseId({
      studentId,
      studentCourseId
    })

    const behaviors = await this.behaviorsRepository.findManyByStudentIdAndCourseId({ studentId, courseId: studentCourseId })
    const behaviorMonths = behaviors.map(({
      january,
      february,
      march,
      april,
      may,
      jun,
      july,
      august,
      september,
      october,
      november,
      december,
    }) => ({
      january,
      february,
      march,
      april,
      may,
      jun,
      july,
      august,
      september,
      october,
      november,
      december,
    }))

    const behaviorAverage = generateBehaviorAverage({ behaviorMonths, formule: courseFormule })

    const assessmentDisciplineModule = await Promise.all(assessments.map(async assessment => {
      const studentCondition = generateAssessmentAverage({ 
        vf: assessment.vf, 
        avi: assessment.avi as number, 
        avii: assessment.avii as number, 
        vfe: assessment.vfe
      })

      const courseDiscipline = await this.courseDisciplineRepository.findByCourseIdAndDisciplineId({
        courseId: assessment.courseId.toValue(), 
        disciplineId: assessment.disciplineId.toValue() 
      })

      return {
        id: assessment.id.toValue(),
        module: Number(courseDiscipline?.module),
        ...studentCondition
      }
    }))

    const gradesByFormule = formules[courseFormule]({
      assessments: assessmentDisciplineModule,
      behaviorAverage
    })  

    return right({
      grades: gradesByFormule
    })
  }
}