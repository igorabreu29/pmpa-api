import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../files/sheeter.ts";
import type { GetCourseAssessmentClassificationUseCase } from "./get-course-assessment-classification.ts";

interface CreateCourseAssessmentClassificationSheetUseCaseRequest {
  courseId: string
}

type CreateCourseAssessmentClassificationSheetUseCaseResponse = Either<ResourceNotFoundError, {
  filename: string
}>

export class CreateCourseAssessmentClassificationSheetUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private getCourseAssessmentClassification: GetCourseAssessmentClassificationUseCase,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId }: CreateCourseAssessmentClassificationSheetUseCaseRequest): Promise<CreateCourseAssessmentClassificationSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const classification = await this.getCourseAssessmentClassification.execute({
      courseId: course.id.toValue()
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
      sheetName: `${course.name.value} - Classificação Geral Sem Comportamento.xlsx`
    })

    return right({
      filename
    })
  }
}