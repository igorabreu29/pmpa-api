import { left, right, type Either } from "@/core/either.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Sheeter } from "../files/sheeter.ts";
import { StudentsPolesRepository } from "../repositories/students-poles-repository.ts";
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";

interface CreateStudentsInformationByManagerSheetUseCaseRequest {
  courseId: string
  managerId: string
}

type CreateStudentsInformationByManagerSheetUseCaseResponse = Either<ResourceNotFoundError, {
  filename: string
}>

export class CreateStudentsInformationByManagerSheetUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private managerCoursesRepository: ManagersCoursesRepository,
    private studentPolesRepository: StudentsPolesRepository,
    private sheeter: Sheeter
  ) {}

  async execute({ courseId, managerId }: CreateStudentsInformationByManagerSheetUseCaseRequest): Promise<CreateStudentsInformationByManagerSheetUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const managerCourse = await this.managerCoursesRepository.findDetailsByManagerAndCourseId({ managerId, courseId: course.id.toValue() })
    if (!managerCourse) return left(new ResourceNotFoundError('Gerente não está presente no curso!'))

    const { studentsPole: studentPolesDetails } = await this.studentPolesRepository.findManyDetailsByPoleId({
      poleId: managerCourse.poleId.toValue()
    })
    
    const students = studentPolesDetails.filter(studentPoleDetails => studentPoleDetails.courseId.equals(course.id))

    const studentsInformation = await Promise.all(students.map(async (studentCourseDetails) => {
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
      'POLO',
    ], sheetName: `${course.name.value} - Informações dos estudantes.xlsx` })

    return right({
      filename
    })
  }
}