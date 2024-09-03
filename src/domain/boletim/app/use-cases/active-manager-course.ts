import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";
import { ChangeManagerStatusEvent } from "../../enterprise/events/change-manager-status-event.ts";

interface ActiveManagerCourseUseCaseRequest {
  id: string
  courseId: string
  reason: string

  role: Role
  userId: string
  userIp: string
}

type ActiveManagerCourseUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class ActiveManagerCourseUseCase {
  constructor (
    private managersRepository: ManagersRepository,
    private coursesRepository: CoursesRepository,
    private managerCoursesRepository: ManagersCoursesRepository
  ) {}

  async execute({ id, courseId, reason, role, userId, userIp }: ActiveManagerCourseUseCaseRequest): Promise<ActiveManagerCourseUseCaseResponse> {
    if (role === 'manager' || role === 'student') return left(new NotAllowedError())

    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const manager = await this.managersRepository.findById(id)
    if (!manager) return left(new ResourceNotFoundError('Manager not found.'))

    const managerCourse = await this.managerCoursesRepository.findByManagerIdAndCourseId({
      courseId,
      managerId: id
    })
    if (!managerCourse) return left(new ResourceNotFoundError('Manager does not be present on the course.'))

    managerCourse.isActive = true

    managerCourse.addDomainManagerCourseEvent(
      new ChangeManagerStatusEvent({
        managerCourse,
        reason,
        reporterId: userId,
        reporterIp: userIp
      })
    )

    await this.managerCoursesRepository.updateStatus(managerCourse)

    return right(null)
  }
}