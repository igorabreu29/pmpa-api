import { Either, left, right } from "@/core/either.ts"
import { ManagerCourseDetails } from "../../enterprise/entities/value-objects/manager-course-details.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts"

interface GetCourseManagerUseCaseRequest {
  courseId: string
  id: string
}

type GetCourseManagerUseCaseResponse = Either<ResourceNotFoundError, {
  manager: ManagerCourseDetails
}>

export class GetCourseManagerUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private managersCoursesRepository: ManagersCoursesRepository,
  ) {}

  async execute({ courseId, id }: GetCourseManagerUseCaseRequest): Promise<GetCourseManagerUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const manager = await this.managersCoursesRepository.findByManagerIdAndCourseId({ courseId, managerId: id })
    if (!manager) return left(new ResourceNotFoundError('Manager is not present in the course.'))

    const managerCourseDetails = await this.managersCoursesRepository.findDetailsByManagerAndCourseId({
      courseId,
      managerId: id
    })
    if (!managerCourseDetails) return left(new ResourceNotFoundError('Manager is not present in the course.'))

    return right({
      manager: managerCourseDetails
    })
  }
}