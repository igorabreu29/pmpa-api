import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../files/sheeter.ts";
import type { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import type { GetCourseClassificationByPoleUseCase } from "./get-course-classification-by-pole.ts";
import type { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import type { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";

interface CreateCourseClassificationByManagerSheetUseCaseRequest {
  courseId: string
  managerId: string
  hasBehavior?: boolean
}

type CreateCourseClassificationByManagerSheetUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  filename: string
}>

export class CreateCourseClassificationByManagerSheetUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private managerCoursesRepository: ManagersCoursesRepository,
    private getCourseClassificationByPole: GetCourseClassificationByPoleUseCase,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId, managerId, hasBehavior = true }: CreateCourseClassificationByManagerSheetUseCaseRequest): Promise<CreateCourseClassificationByManagerSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const managerCourse = await this.managerCoursesRepository.findDetailsByManagerAndCourseId({
      courseId: course.id.toValue(),
      managerId
    })
    if (!managerCourse) return left(new ResourceNotFoundError('Manager is not present in this course'))

    const result = await this.getCourseClassificationByPole.execute({
      courseId: course.id.toValue(),
      managerId: managerCourse.managerId.toValue(),
      hasBehavior
    })

    if (result.isLeft()) {
      const error = result.value
      return left(error)
    }

    const { classifications, students } = result.value

    const { filename } = this.sheeter.write({
      keys: [
        'CLASSIFICAÇÃO',
        'E-MAIL',
        'CPF',
        'NOME',
        'DATA DE NASCIMENTO',
        'MÉDIA FINAL',
        'CONCEITO',
        'POLO',
        'RG CIVIL',
        'RG MILITAR',
        'PAI',
        'MÃE',
        'UF',
        'MUNICÍPIO',
        'OBSERVAÇÃO'
      ],
      rows: classifications.map((classification, index) => {
        const student = students.find(item => item.studentId.equals(classification.studentId))

        return {
          classification: index + 1,
          email: student?.email,
          cpf: student?.cpf,
          username: student?.username,
          birthday: student?.birthday,
          average: classification.average,
          concept: classification.concept,
          pole: student?.pole,
          civilId: student?.civilId,
          militaryId: student?.militaryId,
          fatherName: student?.parent?.fatherName,
          motherName: student?.parent?.motherName,
          state: student?.state,
          county: student?.county,
          status: classification.status
        }
      }),
      sheetName: hasBehavior ? `${course.name.value} - Classificação Por Polo.xlsx` : `${course.name.value} - Classificação Por Polo Sem Comportamento.xlsx`
    })

    return right({
      filename
    })
  }
}