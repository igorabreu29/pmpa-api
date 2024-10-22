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
  decimalPlaces?: number
  conceptType?: number
  hasBehavior?: boolean
  disciplineModule?: number
}

export interface BehaviorMonths {
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
  module: number
}

type GetStudentAverageInTheCourseUseCaseResponse = Either<ResourceNotFoundError, {
  grades: {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[]
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
      behaviorAverageStatus: GenerateBehaviorStatus[]
      behaviorsCount: number
      studentAverageStatus: GetGeralStudentAverageStatusResponse
    }

    assessments: (AssessmentWithModule | null)[],
    assessmentsCount: number
  },

  behaviorMonths: BehaviorMonths[]
}>

export interface BehaviorAverage {
  behaviorAverage: {
    behaviorAverageStatus: GenerateBehaviorStatus[];
    behaviorsCount: number;
  }
}

export class GetStudentAverageInTheCourseUseCase {
  constructor (
    private assessmentsRepository: AssessmentsRepository,
    private behaviorsRepository: BehaviorsRepository,
    private courseDisciplineRepository: CoursesDisciplinesRepository
  ) {}

  async execute({
    studentId,
    courseId,
    isPeriod,
    disciplineModule,
    hasBehavior = true,
    conceptType,
    decimalPlaces
}: GetStudentAverageInTheCourseUseCaseRequest): Promise<GetStudentAverageInTheCourseUseCaseResponse> {
    const assessments = await this.assessmentsRepository.findManyByStudentIdAndCourseId({
      studentId,
      courseId
    })

    let { behaviorAverage }: BehaviorAverage = {
      behaviorAverage: {
        behaviorAverageStatus: [],
        behaviorsCount: 0
      }
    }

    let behaviorMonths: BehaviorMonths[] = []

    if (hasBehavior) {
      const behaviors = await this.behaviorsRepository.findManyByStudentIdAndCourseId({ studentId, courseId })
      behaviorMonths = behaviors.map(({
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
        module
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
        module
      }))

      behaviorAverage = generateBehaviorAverage({ behaviorMonths, isPeriod, decimalPlaces })
    }

    const assessmentWithDisciplineModule = await Promise.all(assessments.map(async assessment => {
      const courseDiscipline = await this.courseDisciplineRepository.findByCourseIdAndDisciplineIdWithDiscipline({
        courseId: assessment.courseId.toValue(), 
        disciplineId: assessment.disciplineId.toValue() 
      })
      if (!courseDiscipline) return null

      return {
        vf: assessment.vf,
        avi: assessment.avi,
        avii: assessment.avii,
        vfe: assessment.vfe,
        average: assessment.average,
        status: assessment.status,
        isRecovering: assessment.isRecovering,
        id: assessment.id.toValue(),
        module: courseDiscipline.module,
        disciplineName: courseDiscipline.disciplineName,
        courseId: assessment.courseId.toValue(),
        disciplineId: assessment.disciplineId.toValue(),
      }
    }))

    const courseWithoutModule = assessmentWithDisciplineModule.some(item => item === null)
    if (courseWithoutModule) return left(new ResourceNotFoundError('Disciplina do curso não existente.'))

    if (disciplineModule) {
      const gradesByFormula = formulas['sub']({
        assessments: assessmentWithDisciplineModule,
        behaviorAverage: hasBehavior ? behaviorAverage : undefined,
        disciplineModule,
        decimalPlaces
      })

      return right({
        grades: gradesByFormula,
        behaviorMonths: hasBehavior ? behaviorMonths : []
      })
    }

    const gradesByFormula = formulas[isPeriod ? 'period' : 'module']({
      assessments: assessmentWithDisciplineModule,
      behaviorAverage: hasBehavior ? behaviorAverage : undefined,
      decimalPlaces,
      conceptType
    })

    return right({
      grades: gradesByFormula,
      behaviorMonths: hasBehavior ? behaviorMonths : []
    })
  }
}