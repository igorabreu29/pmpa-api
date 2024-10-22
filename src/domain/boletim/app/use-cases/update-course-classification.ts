import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { StudentClassficationByModule } from "../types/generate-students-classification.js";
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import type { ClassificationsRepository } from "../repositories/classifications-repository.ts";
import { Classification } from "../../enterprise/entities/classification.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import type { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

interface UpdateCourseClassificationUseCaseRequest {
  courseId: string
  page?: number
  hasBehavior?: boolean
}

type UpdateCourseClassificationUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidCourseFormulaError
  | NotAllowedError, null>

export class UpdateCourseClassificationUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase,
    private classificationsRepository: ClassificationsRepository,
  ) {}

  async execute({ courseId, page, hasBehavior = true }: UpdateCourseClassificationUseCaseRequest): Promise<UpdateCourseClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const { classifications } = await this.classificationsRepository.findManyByCourseId({ courseId: course.id.toValue() })

    const studentsWithAverageOrError = await Promise.all(classifications.map(async (classification) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        studentId: classification.studentId.toValue(),
        courseId,
        isPeriod: course.isPeriod,
        hasBehavior
      })

      if (studentAverage.isLeft()) return studentAverage.value
      
      return {
        studentAverage: studentAverage.value.grades,
        classificationId: classification.id.toValue(),
        studentId: classification.studentId.toValue(),
        studentBirthday: classification.studentBirthday
      }
    }))

    const error = studentsWithAverageOrError.find(item => item instanceof ResourceNotFoundError)
    if (error) return left(error)

    switch (course.formula) {
      case 'CGS': 
        const studentsWithAverageCGS = studentsWithAverageOrError as StudentClassficationByModule[]

        const classificationsCGS = studentsWithAverageCGS.map(item => {
          const generalAverage = Number(item.studentAverage.averageInform.geralAverage)


          return Classification.create({
            courseId: course.id,
            studentId: new UniqueEntityId(item.studentId),
            behavior: item.studentAverage.averageInform.behaviorAverageStatus.map(behavior => {
              return {
                ...behavior,
                behaviorsCount: item.studentAverage.averageInform.behaviorsCount
              }
            }),
            concept: item.studentAverage.averageInform.studentAverageStatus.concept,
            status: item.studentAverage.averageInform.studentAverageStatus.status,
            average: generalAverage || 0, 
            assessmentsCount: item.studentAverage.assessmentsCount,
            assessments: item.studentAverage.assessments,
            studentBirthday: new Date(item.studentBirthday ?? new Date())
          }, new UniqueEntityId(item.classificationId))
        })

        await this.classificationsRepository.saveMany(classificationsCGS)
        return right(null)
      case 'CAS': 
      const studentsWithAverageCAS = studentsWithAverageOrError as StudentClassficationByModule[]

      const classificationsCAS = studentsWithAverageCAS.map(item => {
        const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

        return Classification.create({
          courseId: course.id,
          studentId: new UniqueEntityId(item.studentId),
          behavior: item.studentAverage.averageInform.behaviorAverageStatus.map(behavior => {
            return {
              ...behavior,
              behaviorsCount: item.studentAverage.averageInform.behaviorsCount
            }
          }),
          concept: item.studentAverage.averageInform.studentAverageStatus.concept,
          status: item.studentAverage.averageInform.studentAverageStatus.status,
          average: generalAverage || 0, 
          assessmentsCount: item.studentAverage.assessmentsCount,
          assessments: item.studentAverage.assessments,
          studentBirthday: new Date(item.studentBirthday ?? new Date())
        }, new UniqueEntityId(item.classificationId))
      })

      await this.classificationsRepository.saveMany(classificationsCAS)
      return right(null)
      case 'CFP': 
      const studentsWithAverageCFP = studentsWithAverageOrError as StudentClassficationByModule[]

      const classificationsCFP = studentsWithAverageCFP.map(item => {
        const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

        return Classification.create({
          courseId: course.id,
          studentId: new UniqueEntityId(item.studentId),
          behavior: item.studentAverage.averageInform.behaviorAverageStatus.map(behavior => {
            return {
              ...behavior,
              behaviorsCount: item.studentAverage.averageInform.behaviorsCount
            }
          }),
          concept: item.studentAverage.averageInform.studentAverageStatus.concept,
          status: item.studentAverage.averageInform.studentAverageStatus.status,
          average: generalAverage || 0, 
          assessmentsCount: item.studentAverage.assessmentsCount,
          assessments: item.studentAverage.assessments,
          studentBirthday: new Date(item.studentBirthday ?? new Date())       
        }, new UniqueEntityId(item.classificationId))
      })

      await this.classificationsRepository.saveMany(classificationsCFP)
      return right(null)
      case 'CHO': 
      const studentsWithAverageCHO = studentsWithAverageOrError as StudentClassficationByModule[]

      const classificationsCHO = studentsWithAverageCHO.map(item => {
        const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

        return Classification.create({
          courseId: course.id,
          studentId: new UniqueEntityId(item.studentId),
          behavior: item.studentAverage.averageInform.behaviorAverageStatus.map(behavior => {
            return {
              ...behavior,
              behaviorsCount: item.studentAverage.averageInform.behaviorsCount
            }
          }),
          concept: item.studentAverage.averageInform.studentAverageStatus.concept,
          status: item.studentAverage.averageInform.studentAverageStatus.status,
          average: generalAverage || 0, 
          assessmentsCount: item.studentAverage.assessmentsCount,
          assessments: item.studentAverage.assessments,
          studentBirthday: new Date(item.studentBirthday ?? new Date())        
        }, new UniqueEntityId(item.classificationId))
      })

      await this.classificationsRepository.saveMany(classificationsCHO)
      return right(null)
      case 'CFO': 
      const studentsWithAverageCFO = studentsWithAverageOrError as StudentClassficationByModule[]

      const classificationsCFO = studentsWithAverageCFO.map(item => {
        const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

        return Classification.create({
          courseId: course.id,
          studentId: new UniqueEntityId(item.studentId),
          behavior: item.studentAverage.averageInform.behaviorAverageStatus.map(behavior => {
            return {
              ...behavior,
              behaviorsCount: item.studentAverage.averageInform.behaviorsCount
            }
          }),
          concept: item.studentAverage.averageInform.studentAverageStatus.concept,
          status: item.studentAverage.averageInform.studentAverageStatus.status,
          average: generalAverage || 0, 
          assessmentsCount: item.studentAverage.assessmentsCount,
          assessments: item.studentAverage.assessments,
          studentBirthday: new Date(item.studentBirthday ?? new Date())
        }, new UniqueEntityId(item.classificationId))
      })

      await this.classificationsRepository.saveMany(classificationsCFO)
      return right(null)
      default: 
        return left(new InvalidCourseFormulaError(`Esta fórmula: ${course.formula} é inválida.`))
    }
  }
}