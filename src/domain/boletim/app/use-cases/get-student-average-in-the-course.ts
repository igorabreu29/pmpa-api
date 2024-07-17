import { Either, left, right } from "@/core/either.ts"
import { Formule } from "@/domain/boletim/enterprise/entities/course.ts"
import { AssessmentsRepository } from "../repositories/assessments-repository.ts"
import { BehaviorsRepository } from "../repositories/behaviors-repository.ts"
import { generateBehaviorAverage } from "../utils/generate-behavior-average.ts"
import { generateAssessmentAverage } from "../utils/generate-assessment-average.ts"
import { AssessmentWithModule, formules } from "../utils/verify-formule.ts"
import { GenerateBehaviorStatus } from "../utils/get-behavior-average-status.ts"
import { GetGeralStudentAverageStatusResponse } from "../utils/get-geral-student-average-status.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts"

interface GetStudentAverageInTheCourseUseCaseRequest {
  studentId: string
  courseId: string
  courseFormule: Formule
}

type GetStudentAverageInTheCourseUseCaseResponse = Either<ResourceNotFoundError, {
  grades: {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[]
      behaviorsCount: number
      status: GetGeralStudentAverageStatusResponse
    }

    assessments: {
      [x: string]: {
        module: number
        average: number
      }[]
    },
    assessmentsCount: number
  } | {
    averageInform: {
      geralAverage: number | string;
      behaviorAverageStatus: GenerateBehaviorStatus[] | GenerateBehaviorStatus
      behaviorsCount: number
      status: GetGeralStudentAverageStatusResponse
    }

    assessments: (AssessmentWithModule | null)[],
    assessmentsCount: number
  },
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
    courseFormule
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

    const behaviorAverage = generateBehaviorAverage({ behaviorMonths, formule: courseFormule })

    const assessmentWithDisciplineModule = await Promise.all(assessments.map(async assessment => {
      const studentCondition = generateAssessmentAverage({ 
        vf: assessment.vf, 
        avi: assessment.avi ?? -1,
        avii: assessment.avii ?? -1, 
        vfe: assessment.vfe
      })

      const courseDiscipline = await this.courseDisciplineRepository.findByCourseIdAndDisciplineId({
        courseId: assessment.courseId.toValue(), 
        disciplineId: assessment.disciplineId.toValue() 
      })

      if (!courseDiscipline) return null

      return {
        id: assessment.id.toValue(),
        module: Number(courseDiscipline?.module),
        ...studentCondition
      }
    }))

    const courseWithoutModule = assessmentWithDisciplineModule.some(item => item === null)
    if (courseWithoutModule) return left(new ResourceNotFoundError('Course does not have module.'))

    const gradesByFormule = formules[courseFormule]({
      assessments: assessmentWithDisciplineModule,
      behaviorAverage,
    })  

    return right({
      grades: gradesByFormule,
    })
  }
}