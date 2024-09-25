import { Either, left, right } from "@/core/either.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import type { StudentsPolesRepository } from "../repositories/students-poles-repository.ts"
import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import type { Name } from "../../enterprise/entities/value-objects/name.ts"
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts"
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts"

interface FetchCourseStudentsByManagerUseCaseRequest {
  courseId: string
  managerId: string
  page?: number
  cpf?: string
  username?: string
  isEnabled?: boolean
  perPage?: number
}

type FetchCourseStudentsByManagerUseCaseResponse = Either<ResourceNotFoundError, {
  studentPoles: StudentCourseDetails[]
  pages?: number
  totalItems?: number
}>

export class FetchCourseStudentsByManagerUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private managerCoursesRepository: ManagersCoursesRepository,
    private studentsPolesRepository: StudentsPolesRepository,
  ) {}

  async execute({ 
    courseId, 
    managerId, 
    cpf, 
    username, 
    isEnabled = true, 
    page, 
    perPage 
  }: FetchCourseStudentsByManagerUseCaseRequest): Promise<FetchCourseStudentsByManagerUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const managerCourse = await this.managerCoursesRepository.findDetailsByManagerAndCourseId({ courseId: course.id.toValue(), managerId })
    if (!managerCourse) return left(new ResourceNotFoundError('Gerente não encontrado.'))

    const { studentsPole, pages, totalItems } = await this.studentsPolesRepository.findManyDetailsByPoleId({ 
      page, 
      perPage, 
      poleId: managerCourse.poleId.toValue(), 
      cpf, 
      username, 
      isEnabled 
    })

    const studentPolesByCourse = studentsPole.filter(studentPole => studentPole.courseId.equals(course.id))

    return right({
      studentPoles: studentPolesByCourse,
      pages,
      totalItems
    })
  }
}