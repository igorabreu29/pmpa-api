import { left, right, type Either } from "@/core/either.ts";
import type { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import type { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts";
import { generateAssessmentAverage } from "../utils/generate-assessment-average.ts";
import { Sheeter } from "../files/sheeter.ts";

interface CreateStudentsInformationSheetUseCaseRequest {
  courseId: string
}

type CreateStudentsInformationSheetUseCaseResponse = Either<ResourceNotFoundError, {
  filename: string
}>

export class CreateStudentsInformationSheetUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private studentCoursesRepository: StudentsCoursesRepository,
    private courseDisciplinesRepository: CoursesDisciplinesRepository,
    private assessmentsRepository: AssessmentsRepository,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId }: CreateStudentsInformationSheetUseCaseRequest): Promise<CreateStudentsInformationSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const { studentsCourse: studentCoursesDetails } = await this.studentCoursesRepository.findManyDetailsByCourseId({
      courseId: course.id.toValue(),
    })

    const studentsInformation = await Promise.all(studentCoursesDetails.map(async (studentCourseDetails) => {
      return {
          username: studentCourseDetails.username,
          email: studentCourseDetails.email,
          cpf: studentCourseDetails.cpf,
          birthday: studentCourseDetails.birthday,
          civilId: studentCourseDetails.civilId,
          assignedAt: studentCourseDetails.assignedAt,
          militaryId: studentCourseDetails.militaryId,
          state: studentCourseDetails.state,
          county: studentCourseDetails.county,
          fatherName: studentCourseDetails.parent?.fatherName,
          motherName: studentCourseDetails.parent?.motherName,
          course: studentCourseDetails.course,
          pole: studentCourseDetails.pole,
      }
    }))

    const { filename } = this.sheeter.write({ rows: studentsInformation, keys: [
      'NOME COMPLETO',
      'E-MAIL',
      'CPF',
      'DATA DE NASCIMENTO',
      'RG CIVIL',
      'DATA DE ADIÇÃO',
      'RG MILITAR',
      'ESTADO',
      'MUNICÍPIO',
      'NOME DO PAI',
      'NOME DA MÃE',
      'CURSO',
      'PÓLO',
    ], sheetName: `${course.name.value} - Informações dos estudantes.xlsx` })

    return right({
      filename
    })
  }
}