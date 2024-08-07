import { Either, left, right } from "@/core/either.ts"
import { AssessmentsRepository } from "../repositories/assessments-repository.ts"
import { BehaviorsRepository } from "../repositories/behaviors-repository.ts"
import { generateBehaviorAverage } from "../utils/generate-behavior-average.ts"
import { generateAssessmentAverage } from "../utils/generate-assessment-average.ts"
import { GenerateBehaviorStatus } from "../utils/get-behavior-average-status.ts"
import { GetGeralStudentAverageStatusResponse } from "../utils/get-geral-student-average-status.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts"
import { AssessmentWithModule, formulas } from "../utils/verify-formula.ts"

interface GetStudentAverageInTheCourseUseCaseRequest {
  studentId: string
  courseId: string
  isPeriod: boolean
}

interface Month {
  january?: number | null
  february?: number | null
  march?: number | null
  april?: number | null
  may?: number | null
  jun?: number | null
  july?: number | null
  august?: number | null
  september?: number | null
  october?: number | null
  november?: number | null
  december?: number | null
}

type GetStudentAverageInTheCourseUseCaseResponse = Either<ResourceNotFoundError, {
  grades: {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[]
      behaviorsCount: number
      studentAverageStatus: GetGeralStudentAverageStatusResponse
    }

    assessments: {
      [x: string]: AssessmentWithModule[]
    },
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
  },

  behaviorMonths: Month[]
}>

export class GetStudentAverageInTheCourseUseCase {
  constructor (
    private assessmentsRepository: AssessmentsRepository,
    private behaviorsRepository: BehaviorsRepository,
    private courseDisciplineRepository: CoursesDisciplinesRepository
  ) {}

  async execute({
    studentId,
    courseId,
    isPeriod
}: GetStudentAverageInTheCourseUseCaseRequest): Promise<GetStudentAverageInTheCourseUseCaseResponse> {
    const assessments = await this.assessmentsRepository.findManyByStudentIdAndCourseId({
      studentId,
      courseId
    })
    
    const behaviors = await this.behaviorsRepository.findManyByStudentIdAndCourseId({ studentId, courseId })
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

    const behaviorAverage = generateBehaviorAverage({ behaviorMonths, isPeriod })

    const assessmentWithDisciplineModule = await Promise.all(assessments.map(async assessment => {
      const studentCondition = generateAssessmentAverage({ 
        vf: !assessment.vf ? -1 : assessment.vf, 
        avi: !assessment.avi ? -1 : assessment.avi,
        avii: !assessment.avii ? -1 : assessment.avii, 
        vfe: assessment.vfe
      })

      const courseDiscipline = await this.courseDisciplineRepository.findByCourseIdAndDisciplineIdWithDiscipline({
        courseId: assessment.courseId.toValue(), 
        disciplineId: assessment.disciplineId.toValue() 
      })
      if (!courseDiscipline) return null

      return {
        id: assessment.id.toValue(),
        module: courseDiscipline.module,
        disciplineName: courseDiscipline.disciplineName,
        ...studentCondition,
      }
    }))

    const courseWithoutModule = assessmentWithDisciplineModule.some(item => item === null)
    if (courseWithoutModule) return left(new ResourceNotFoundError('Course does not have module.'))

    const gradesByFormula = formulas[isPeriod ? 'period' : 'module']({
      assessments: assessmentWithDisciplineModule,
      behaviorAverage,
    })

    return right({
      grades: gradesByFormula,
      behaviorMonths
    })
  }
}