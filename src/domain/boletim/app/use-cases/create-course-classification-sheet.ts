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
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const { studentsCourse: students } = await this.studentCoursesRepository.findManyDetailsByCourseId({ courseId: course.id.toValue() })

    const classification = await this.getCourseClassification.execute({
      courseId: course.id.toValue(),
      hasBehavior,
    })

    if (classification.isLeft()) {
      const error = classification.value
      return left(error)
    }

    const { studentsWithAverage } = classification.value

    const { filename } = this.sheeter.write({
      keys: [
        'CLASSIFICAÇÃO',
        'E-MAIL',
        'CPF',
        'NOME',
        'DATA DE NASCIMENTO',
        'MÉDIA FINAL',
        'CONCEITO',
        'PÓLO',
        'RG CIVIL',
        'RG MILITAR',
        'PAI',
        'MÃE',
        'UF',
        'MUNICÍPIO',
        'OBSERVAÇÃO'
      ],
      rows: studentsWithAverage.map((studentWithAverage, index) => {
        const student = students.find(item => item.username === studentWithAverage.studentName)

        return {
          classification: index + 1,
          email: student?.email,
          cpf: student?.cpf,
          username: student?.username,
          birthday: student?.birthday,
          average: studentWithAverage.studentAverage.averageInform.geralAverage,
          concept: studentWithAverage.studentAverage.averageInform.studentAverageStatus.concept,
          pole: student?.pole,
          civilId: student?.civilId,
          militaryId: student?.militaryId,
          fatherName: student?.parent?.fatherName,
          motherName: student?.parent?.motherName,
          state: student?.state,
          county: student?.county,
          status: studentWithAverage.studentAverage.averageInform.studentAverageStatus.status
        }
      }),
      sheetName: hasBehavior ? `${course.name.value} - Classificação Geral.xlsx` : `${course.name.value} - Classificação Geral Sem Comportamento.xlsx`
    })

    return right({
      filename
    })
  }
}