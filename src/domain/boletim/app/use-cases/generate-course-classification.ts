import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { StudentClassficationByModule } from "../types/generate-students-classification.js";
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import type { ClassificationsRepository } from "../repositories/classifications-repository.ts";
import { Classification } from "../../enterprise/entities/classification.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import type { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

interface GenerateCourseClassificationUseCaseRequest {
  courseId: string
  page?: number
  hasBehavior?: boolean
}

type GenerateCourseClassificationUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidCourseFormulaError
  | NotAllowedError, null>

export class GenerateCourseClassificationUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
    private getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase,
    private classificationsRepository: ClassificationsRepository,
  ) {}

  async execute({ courseId, page, hasBehavior = true }: GenerateCourseClassificationUseCaseRequest): Promise<GenerateCourseClassificationUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const { studentsCourse: students } = await this.studentsCoursesRepository.findManyDetailsByCourseId({ courseId, isEnabled: true })

    const { classifications } = await this.classificationsRepository.findManyByCourseId({ courseId: course.id.toValue() })

    const studentsWithAverageOrError = await Promise.all(students.map(async (student) => {
      const studentAverage = await this.getStudentAverageInTheCourseUseCase.execute({
        studentId: student.studentId.toValue(),
        courseId,
        isPeriod: course.isPeriod,
        hasBehavior
      })

      if (studentAverage.isLeft()) return studentAverage.value
      
      return {
        studentAverage: studentAverage.value.grades,
        studentBirthday: student.birthday,
        studentId: student.studentId.toValue(),
        poleId: student.poleId.toValue(),
      }
    }))

    const error = studentsWithAverageOrError.find(item => item instanceof ResourceNotFoundError)
    if (error) return left(error)

    switch (course.formula) {
      case 'CGS': 
        const studentsWithAverageCGS = studentsWithAverageOrError as StudentClassficationByModule[]

        if (!classifications.length) {
          const classificationsCGS = studentsWithAverageCGS.map((item, index) => {
            const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

            return Classification.create({
              courseId: course.id,
              studentId: new UniqueEntityId(item.studentId),
              poleId: new UniqueEntityId(item.poleId),

              studentBirthday: new Date(item.studentBirthday ?? new Date()),
              behaviorsCount: item.studentAverage.averageInform.behaviorsCount,
              concept: item.studentAverage.averageInform.studentAverageStatus.concept,
              status: item.studentAverage.averageInform.studentAverageStatus.status,
              average: generalAverage || 0, 
              assessmentsCount: item.studentAverage.assessmentsCount,
              assessments: item.studentAverage.assessments,
            })
          })
          await this.classificationsRepository.createMany(classificationsCGS)
        }

        if (classifications.length) {
          const classificationsCGS = studentsWithAverageCGS.map((item, index) => {
            const classification = classifications.find(classification => classification.studentId.toValue() === item.studentId)
            const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

            return Classification.create({
              courseId: course.id,
              studentId: new UniqueEntityId(item.studentId),
              poleId: new UniqueEntityId(item.poleId),

              studentBirthday: new Date(item.studentBirthday ?? new Date()),
              behaviorsCount: item.studentAverage.averageInform.behaviorsCount,
              concept: item.studentAverage.averageInform.studentAverageStatus.concept,
              status: item.studentAverage.averageInform.studentAverageStatus.status,
              average: generalAverage || 0, 
              assessmentsCount: item.studentAverage.assessmentsCount,
              assessments: item.studentAverage.assessments,
            }, classification?.id)
          })

          await this.classificationsRepository.saveMany(classificationsCGS)
        }

        return right(null)
      case 'CAS': 
      const studentsWithAverageCAS = studentsWithAverageOrError as StudentClassficationByModule[]

      if (!classifications.length) {
        const classificationsCAS = studentsWithAverageCAS.map((item, index) => {
          const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

          return Classification.create({
            courseId: course.id,
            studentId: new UniqueEntityId(item.studentId),
            poleId: new UniqueEntityId(item.poleId),
            studentBirthday: new Date(item.studentBirthday ?? new Date()),
            behaviorsCount: item.studentAverage.averageInform.behaviorsCount,
            concept: item.studentAverage.averageInform.studentAverageStatus.concept,
            status: item.studentAverage.averageInform.studentAverageStatus.status,
            average: generalAverage || 0, 
            assessmentsCount: item.studentAverage.assessmentsCount,
            assessments: item.studentAverage.assessments,
          })
        })
        await this.classificationsRepository.createMany(classificationsCAS)
      }

      if (classifications.length) {
        const classificationsCAS = studentsWithAverageCAS.map((item, index) => {
          const classification = classifications.find(classification => classification.studentId.toValue() === item.studentId)
          const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

          return Classification.create({
            courseId: course.id,
            studentId: new UniqueEntityId(item.studentId),
            poleId: new UniqueEntityId(item.poleId),
            studentBirthday: new Date(item.studentBirthday ?? new Date()),
            behaviorsCount: item.studentAverage.averageInform.behaviorsCount,
            concept: item.studentAverage.averageInform.studentAverageStatus.concept,
            status: item.studentAverage.averageInform.studentAverageStatus.status,
            average: generalAverage || 0, 
            assessmentsCount: item.studentAverage.assessmentsCount,
            assessments: item.studentAverage.assessments,
          }, classification?.id)
        })

        await this.classificationsRepository.saveMany(classificationsCAS)
      }

      return right(null)
      case 'CFP': 
      const studentsWithAverageCFP = studentsWithAverageOrError as StudentClassficationByModule[]

      if (!classifications.length) {
        const classificationsCFP = studentsWithAverageCFP.map((item, index) => {
          const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

          return Classification.create({
            courseId: course.id,
            studentId: new UniqueEntityId(item.studentId),
            poleId: new UniqueEntityId(item.poleId),
            studentBirthday: new Date(item.studentBirthday ?? new Date()),
            behaviorsCount: item.studentAverage.averageInform.behaviorsCount,
            concept: item.studentAverage.averageInform.studentAverageStatus.concept,
            status: item.studentAverage.averageInform.studentAverageStatus.status,
            average: generalAverage || 0, 
            assessmentsCount: item.studentAverage.assessmentsCount,
            assessments: item.studentAverage.assessments,
          })
        })
        await this.classificationsRepository.createMany(classificationsCFP)
      }

      if (classifications.length) {
        const classificationsCFP = studentsWithAverageCFP.map((item, index) => {
          const classification = classifications.find(classification => classification.studentId.toValue() === item.studentId)
          const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

          return Classification.create({
            courseId: course.id,
            studentId: new UniqueEntityId(item.studentId),
            poleId: new UniqueEntityId(item.poleId),
            studentBirthday: new Date(item.studentBirthday ?? new Date()),
            behaviorsCount: item.studentAverage.averageInform.behaviorsCount,
            concept: item.studentAverage.averageInform.studentAverageStatus.concept,
            status: item.studentAverage.averageInform.studentAverageStatus.status,
            average: generalAverage || 0, 
            assessmentsCount: item.studentAverage.assessmentsCount,
            assessments: item.studentAverage.assessments,
          }, classification?.id)
        })

        await this.classificationsRepository.saveMany(classificationsCFP)
      }

      return right(null)
      case 'CHO': 
      const studentsWithAverageCHO = studentsWithAverageOrError as StudentClassficationByModule[]

      if (!classifications.length) {
        const classificationsCHO = studentsWithAverageCHO.map((item, index) => {
          const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

          return Classification.create({
            courseId: course.id,
            studentId: new UniqueEntityId(item.studentId),
            poleId: new UniqueEntityId(item.poleId),
            studentBirthday: new Date(item.studentBirthday ?? new Date()),
            behaviorsCount: item.studentAverage.averageInform.behaviorsCount,
            concept: item.studentAverage.averageInform.studentAverageStatus.concept,
            status: item.studentAverage.averageInform.studentAverageStatus.status,
            average: generalAverage || 0, 
            assessmentsCount: item.studentAverage.assessmentsCount,
            assessments: item.studentAverage.assessments,
          })
        })
        await this.classificationsRepository.createMany(classificationsCHO)
      }

      if (classifications.length) {
        const classificationsCHO = studentsWithAverageCHO.map((item, index) => {
          const classification = classifications.find(classification => classification.studentId.toValue() === item.studentId)
          const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

          return Classification.create({
            courseId: course.id,
            studentId: new UniqueEntityId(item.studentId),
            poleId: new UniqueEntityId(item.poleId),
            studentBirthday: new Date(item.studentBirthday ?? new Date()),
            behaviorsCount: item.studentAverage.averageInform.behaviorsCount,
            concept: item.studentAverage.averageInform.studentAverageStatus.concept,
            status: item.studentAverage.averageInform.studentAverageStatus.status,
            average: generalAverage || 0, 
            assessmentsCount: item.studentAverage.assessmentsCount,
            assessments: item.studentAverage.assessments,
          }, classification?.id)
        })

        await this.classificationsRepository.saveMany(classificationsCHO)
      }
      return right(null)
      case 'CFO': 
      const studentsWithAverageCFO = studentsWithAverageOrError as StudentClassficationByModule[]

      if (!classifications.length) {
        const classificationsCFO = studentsWithAverageCFO.map((item, index) => {
          const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

          return Classification.create({
            courseId: course.id,
            studentId: new UniqueEntityId(item.studentId),
            poleId: new UniqueEntityId(item.poleId),
            studentBirthday: new Date(item.studentBirthday ?? new Date()),
            behaviorsCount: item.studentAverage.averageInform.behaviorsCount,
            concept: item.studentAverage.averageInform.studentAverageStatus.concept,
            status: item.studentAverage.averageInform.studentAverageStatus.status,
            average: generalAverage || 0, 
            assessmentsCount: item.studentAverage.assessmentsCount,
            assessments: item.studentAverage.assessments,
          })
        })
        await this.classificationsRepository.createMany(classificationsCFO)
      }

      if (classifications.length) {
        const classificationsCFO = studentsWithAverageCFO.map((item, index) => {
          const classification = classifications.find(classification => classification.studentId.toValue() === item.studentId)
          const generalAverage = Number(item.studentAverage.averageInform.geralAverage)

          return Classification.create({
            courseId: course.id,
            studentId: new UniqueEntityId(item.studentId),
            poleId: new UniqueEntityId(item.poleId),
            studentBirthday: new Date(item.studentBirthday ?? new Date()),
            behaviorsCount: item.studentAverage.averageInform.behaviorsCount,
            concept: item.studentAverage.averageInform.studentAverageStatus.concept,
            status: item.studentAverage.averageInform.studentAverageStatus.status,
            average: generalAverage || 0, 
            assessmentsCount: item.studentAverage.assessmentsCount,
            assessments: item.studentAverage.assessments,
          }, classification?.id)
        })
        
        await this.classificationsRepository.saveMany(classificationsCFO)
      }

      return right(null)
      default: 
        return left(new InvalidCourseFormulaError(`Esta fórmula: ${course.formula} é inválida.`))
    }
  }
}