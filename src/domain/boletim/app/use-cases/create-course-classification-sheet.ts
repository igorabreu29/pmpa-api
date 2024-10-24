import { Either, left, right } from "@/core/either.ts";
import { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../files/sheeter.ts";
import type { GetCourseClassificationUseCase } from "./get-course-classification.ts";
import type { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";

interface CreateCourseClassificationSheetUseCaseRequest {
  courseId: string
  hasBehavior?: boolean
}

type CreateCourseClassificationSheetUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  filename: string
}>

export class CreateCourseClassificationSheetUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private studentCoursesRepository: StudentsCoursesRepository,
    private getCourseClassification: GetCourseClassificationUseCase,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId, hasBehavior = true }: CreateCourseClassificationSheetUseCaseRequest): Promise<CreateCourseClassificationSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const result = await this.getCourseClassification.execute({
      courseId: course.id.toValue(),
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
      sheetName: hasBehavior ? `${course.name.value} - Classificação Geral.xlsx` : `${course.name.value} - Classificação Geral Sem Comportamento.xlsx`
    })

    return right({
      filename
    })
  }
}