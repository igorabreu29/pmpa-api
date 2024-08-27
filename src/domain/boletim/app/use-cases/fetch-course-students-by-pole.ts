import { Either, left, right } from "@/core/either.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { PolesRepository } from "../repositories/poles-repository.ts"
import type { StudentsPolesRepository } from "../repositories/students-poles-repository.ts"
import type { StudentWithPole } from "../../enterprise/entities/value-objects/student-with-pole.ts"
import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import type { Name } from "../../enterprise/entities/value-objects/name.ts"

interface FetchCourseStudentsByPoleRequest {
  courseId: string
  poleId: string
  page: number
  cpf?: string
  username?: string
  isEnabled?: boolean
  perPage: number
}

type FetchCourseStudentsByPoleResponse = Either<ResourceNotFoundError, {
  students: {
    courseId: UniqueEntityId
    course: Name
    studentsPole: StudentWithPole[]
  }
  pages: number
  totalItems: number
}>

export class FetchCourseStudentsByPole {
  constructor (
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private studentsPolesRepository: StudentsPolesRepository,
  ) {}

  async execute({ courseId, poleId, cpf, username, isEnabled = true, page, perPage }: FetchCourseStudentsByPoleRequest): Promise<FetchCourseStudentsByPoleResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pole not found.'))

    const { studentsPole, pages, totalItems } = await this.studentsPolesRepository.findManyByPoleId({ page, perPage, poleId, cpf, username, isEnabled })

    return right({
      students: {
        course: course.name,
        courseId: course.id,
        studentsPole
      },
      pages,
      totalItems
    })
  }
}