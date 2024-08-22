import { Either, left, right } from "@/core/either.ts"
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"

interface FetchCourseStudentsUseCaseRequest {
  courseId: string
  username?: string
  cpf?: string
  isEnabled?: boolean
  page: number
  perPage: number
}

type FetchCourseStudentsUseCaseResponse = Either<ResourceNotFoundError, {
  students: StudentCourseDetails[]
  pages: number
  totalItems: number
}>

export class FetchCourseStudentsUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private studentsCoursesRepository: StudentsCoursesRepository,
  ) {}

  async execute({ courseId, page, cpf, isEnabled = false, username, perPage }: FetchCourseStudentsUseCaseRequest): Promise<FetchCourseStudentsUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const { studentsCourse, pages, totalItems } = await this.studentsCoursesRepository.findManyDetailsByCourseId({
      courseId,
      page,
      username,
      isEnabled,
      cpf,
      perPage,
    })

    return right({ students: studentsCourse, pages, totalItems })
  }
}