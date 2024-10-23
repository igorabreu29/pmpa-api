import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../files/sheeter.ts";
import type { GetManagerAssessmentClassificationUseCase } from "./get-manager-assessment-classification.ts";
import type { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";

interface CreateManagerAssessmentClassificationSheetUseCaseRequest {
  courseId: string
  managerId: string
}

type CreateManagerAssessmentClassificationSheetUseCaseResponse = Either<ResourceNotFoundError, {
  filename: string
}>

export class CreateManagerAssessmentClassificationSheetUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private managerCoursesRepository: ManagersCoursesRepository,
    private getManagerAssessmentClassification: GetManagerAssessmentClassificationUseCase,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId, managerId }: CreateManagerAssessmentClassificationSheetUseCaseRequest): Promise<CreateManagerAssessmentClassificationSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const managerCourse = await this.managerCoursesRepository.findDetailsByManagerAndCourseId({
      courseId: course.id.toValue(),
      managerId: managerId
    })
    if (!managerCourse) return left(new ResourceNotFoundError('O gerente não está presente no curso.'))

    const result = await this.getManagerAssessmentClassification.execute({
      courseId: course.id.toValue(),
      managerId: managerCourse.managerId.toValue()
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
      sheetName: `${course.name.value} - Classificação Sem Comportamento.xlsx`
    })

    return right({
      filename
    })
  }
}