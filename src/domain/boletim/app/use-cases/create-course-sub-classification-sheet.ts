import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../files/sheeter.ts";
import type { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import type { GetCourseSubClassificationUseCase } from "./get-course-sub-classification.ts";

interface CreateCourseSubClassificationSheetUseCaseRequest {
  courseId: string
  hasBehavior?: boolean
  disciplineModule: number
}

type CreateCourseSubClassificationSheetUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  filename: string
}>

export class CreateCourseSubClassificationSheetUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private getCourseSubClassification: GetCourseSubClassificationUseCase,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId, hasBehavior = true, disciplineModule }: CreateCourseSubClassificationSheetUseCaseRequest): Promise<CreateCourseSubClassificationSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const classification = await this.getCourseSubClassification.execute({
      courseId: course.id.toValue(),
      hasBehavior,
      disciplineModule
    })

    if (classification.isLeft()) {
      const error = classification.value
      return left(error)
    }

    const { classifications, students } = classification.value

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
      sheetName: hasBehavior ? `${course.name.value} - Sub Classificação Geral.xlsx` : `${course.name.value} - Sub Classificação Geral Sem Comportamento.xlsx`
    })

    return right({
      filename
    })
  }
}