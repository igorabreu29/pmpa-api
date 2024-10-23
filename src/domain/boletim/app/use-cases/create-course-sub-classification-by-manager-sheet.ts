import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../files/sheeter.ts";
import type { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import type { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import type { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";
import type { GetCourseSubClassificationByPoleUseCase } from "./get-course-sub-classification-by-pole.ts";

interface CreateCourseSubClassificationByManagerSheetUseCaseRequest {
  courseId: string
  managerId: string
  disciplineModule: number
  hasBehavior?: boolean
}

type CreateCourseSubClassificationByManagerSheetUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  filename: string
}>

export class CreateCourseSubClassificationByManagerSheetUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private managerCoursesRepository: ManagersCoursesRepository,
    private getCourseSubClassificationByPole: GetCourseSubClassificationByPoleUseCase,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId, managerId, hasBehavior = true, disciplineModule }: CreateCourseSubClassificationByManagerSheetUseCaseRequest): Promise<CreateCourseSubClassificationByManagerSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const managerCourse = await this.managerCoursesRepository.findDetailsByManagerAndCourseId({
      courseId: course.id.toValue(),
      managerId
    })
    if (!managerCourse) return left(new ResourceNotFoundError('Gerente não está presente no curso..'))

    const classification = await this.getCourseSubClassificationByPole.execute({
      courseId: course.id.toValue(),
      managerId: managerCourse.managerId.toValue(),
      hasBehavior,
      disciplineModule,
    })

    if (classification.isLeft()) {
      const error = classification.value
      return left(error)
    }

    const { students, classifications } = classification.value

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
      sheetName: hasBehavior ? `${course.name.value} - Sub Classificação.xlsx` : `${course.name.value} - Sub Classificação Sem Comportamento.xlsx`
    })

    return right({
      filename
    })
  }
}