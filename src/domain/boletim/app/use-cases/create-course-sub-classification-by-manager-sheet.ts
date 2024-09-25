import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../files/sheeter.ts";
import type { InvalidCourseFormulaError } from "./errors/invalid-course-formula-error.ts";
import type { GetCourseClassificationByPoleUseCase } from "./get-course-classification-by-pole.ts";
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
    private studentPolesRepository: StudentsPolesRepository,
    private getCourseSubClassificationByPole: GetCourseSubClassificationByPoleUseCase,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId, managerId, hasBehavior = true, disciplineModule }: CreateCourseSubClassificationByManagerSheetUseCaseRequest): Promise<CreateCourseSubClassificationByManagerSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const managerCourse = await this.managerCoursesRepository.findDetailsByManagerAndCourseId({
      courseId: course.id.toValue(),
      managerId
    })
    if (!managerCourse) return left(new ResourceNotFoundError('Manager is not present in this course'))

    const { studentsPole } = await this.studentPolesRepository.findManyDetailsByPoleId({ poleId: managerCourse.poleId.toValue() })

    const students = studentsPole.filter(studentPole => studentPole.courseId.equals(course.id))

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