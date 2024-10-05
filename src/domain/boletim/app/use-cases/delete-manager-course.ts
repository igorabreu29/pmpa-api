import { left, right, type Either } from "@/core/either.ts"
import type { CoursesRepository } from "../repositories/courses-repository.ts"
import type { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts"
import type { ManagersRepository } from "../repositories/managers-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { ManagerCourseDeletedEvent } from "../../enterprise/events/manager-course-deleted-event.ts"
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts"

interface DeleteManagerCourseUseCaseRequest {
  courseId: string
  managerId: string

  role: string
  userId: string
  userIp: string
}

type DeleteManagerCourseUseCaseResponse = Either<
  | ResourceNotFoundError
  | NotAllowedError, null>

export class DeleteManagerCourseUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private managersRepository: ManagersRepository,
    private managerCoursesRepository: ManagersCoursesRepository
  ) {}

  async execute({ courseId, managerId, role, userId, userIp }: DeleteManagerCourseUseCaseRequest): Promise<DeleteManagerCourseUseCaseResponse> {
    if (role === 'manager') return left(new NotAllowedError())

    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente!'))

    const manager = await this.managersRepository.findById(managerId)
    if (!manager) return left(new ResourceNotFoundError('Estudante não existente!'))

    const managerCourse = await this.managerCoursesRepository.findByManagerIdAndCourseId({
      courseId: course.id.toValue(),
      managerId: manager.id.toValue()
    })
    if (!managerCourse) return left(new ResourceNotFoundError('O estudante não está presente no curso.'))

    managerCourse.addDomainManagerCourseEvent(
      new ManagerCourseDeletedEvent({
        reporterId: userId,
        reporterIp: userIp,
        managerCourse
      })
    ) 

    await this.managerCoursesRepository.delete(managerCourse)

    return right(null)
  }
}