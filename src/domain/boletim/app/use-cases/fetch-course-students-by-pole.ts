import { Either, left, right } from "@/core/either.ts"
import { StudentWithCourseAndPole } from "../../enterprise/entities/value-objects/student-with-course-and-pole.ts"
import { ManagerRole } from "../../enterprise/entities/manager.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { PolesRepository } from "../repositories/poles-repository.ts"
import { StudentsCoursesRepository } from "../repositories/students-courses-repository.ts"

interface FetchCourseStudentsByPoleRequest {
  courseId: string
  poleId: string
  role: ManagerRole
  page: number
  perPage: number
}

type FetchCourseStudentsByPoleResponse = Either<ResourceNotFoundError, {
  students: StudentWithCourseAndPole[]
  pages: number
  totalItems: number
}>

export class FetchCourseStudentsByPole {
  constructor (
    private studentsCoursesRepository: StudentsCoursesRepository,
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository
  ) {}

  async execute({ courseId, poleId, role, page, perPage }: FetchCourseStudentsByPoleRequest): Promise<FetchCourseStudentsByPoleResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pole not found.'))

    const { studentsCourse, pages, totalItems} = await this.studentsCoursesRepository.findManyByCourseIdAndPoleIdWithCourseAndPole({
      courseId,
      poleId,
        page,
      perPage,
    })

    return right({ students: studentsCourse, pages, totalItems })
  }
}