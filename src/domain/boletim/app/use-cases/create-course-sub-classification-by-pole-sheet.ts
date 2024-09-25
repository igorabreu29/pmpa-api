import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../files/sheeter.ts";
import type { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import type { GetCourseClassificationByPoleUseCase } from "./get-course-classification-by-pole.ts";
import type { PolesRepository } from "../repositories/poles-repository.ts";
import type { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import type { GetCourseSubClassificationByPoleUseCase } from "./get-course-sub-classification-by-pole.ts";

interface CreateCourseSubClassificationByPoleSheetUseCaseRequest {
  courseId: string
  poleId: string
  disciplineModule: number
  hasBehavior?: boolean
}

type CreateCourseSubClassificationByPoleSheetUseCaseResponse = Either<ResourceNotFoundError | InvalidCourseFormulaError, {
  filename: string
}>

export class CreateCourseSubClassificationByPoleSheetUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private studentPolesRepository: StudentsPolesRepository,
    private getCourseSubClassificationByPole: GetCourseSubClassificationByPoleUseCase,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId, poleId, hasBehavior = true, disciplineModule }: CreateCourseSubClassificationByPoleSheetUseCaseRequest): Promise<CreateCourseSubClassificationByPoleSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pole not found.'))

    const { studentsPole  } = await this.studentPolesRepository.findManyDetailsByPoleId({ poleId: pole.id.toValue() })

    const students = studentsPole.filter(studentPole => studentPole.courseId.equals(course.id))

    const classification = await this.getCourseSubClassificationByPole.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      hasBehavior,
      disciplineModule
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
      sheetName: hasBehavior ? `${course.name.value} - Sub Classificação Por Polo.xlsx` : `${course.name.value} - Sub Classificação Por Polo Sem Comportamento.xlsx`
    })

    return right({
      filename
    })
  }
}