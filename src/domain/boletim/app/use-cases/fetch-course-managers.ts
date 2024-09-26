import { Either, left, right } from "@/core/either.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts"
import { ManagerCourseDetails } from "../../enterprise/entities/value-objects/manager-course-details.ts"

interface FetchCourseManagersUseCaseRequest {
  courseId: string
  username?: string
  cpf?: string
  isEnabled?: boolean
  page?: number
  perPage?: number
}

type FetchCourseManagersUseCaseResponse = Either<ResourceNotFoundError, {
  managers: ManagerCourseDetails[]
  pages?: number
  totalItems?: number
}>

export class FetchCourseManagersUseCase {
  constructor (
    private managersCoursesRepository: ManagersCoursesRepository,
    private coursesRepository: CoursesRepository
  ) {}

  async execute({ courseId, page, cpf, isEnabled, username, perPage }: FetchCourseManagersUseCaseRequest): Promise<FetchCourseManagersUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const { managersCourse, pages, totalItems} = await this.managersCoursesRepository.findManyDetailsByCourseId({
      courseId,
      page,
      username,
      isEnabled,
      cpf,
      perPage,
    })

    return right({ managers: managersCourse, pages, totalItems })
  }
}