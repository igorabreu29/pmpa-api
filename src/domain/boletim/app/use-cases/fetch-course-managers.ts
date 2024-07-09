import { Either, left, right } from "@/core/either.ts"
import { StudentWithCourseAndPole } from "../../enterprise/entities/value-objects/student-with-course-and-pole.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { ManagersRepository } from "../repositories/managers-repository.ts"
import { ManagerWithCourseAndPole } from "../../enterprise/entities/value-objects/manager-with-course-and-pole.ts"
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts"

interface FetchCourseManagersUseCaseRequest {
  courseId: string
  page: number
  perPage: number
}

type FetchCourseManagersUseCaseResponse = Either<ResourceNotFoundError, {
  managers: ManagerWithCourseAndPole[]
  pages: number
  totalItems: number
}>

export class FetchCourseManagersUseCase {
  constructor (
    private managersCoursesRepository: ManagersCoursesRepository,
    private coursesRepository: CoursesRepository
  ) {}

  async execute({ courseId, page, perPage }: FetchCourseManagersUseCaseRequest): Promise<FetchCourseManagersUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const { managersCourse, pages, totalItems} = await this.managersCoursesRepository.findManyByCourseIdWithCourseAndPole({
      courseId,
      page,
      perPage,
    })

    return right({ managers: managersCourse, pages, totalItems })
  }
}