import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";
import { ChangeManagerStatusEvent } from "../../enterprise/events/change-manager-status-event.ts";

interface DisableManagerCourseUseCaseRequest {
  id: string
  courseId: string
  reason: string

  role: Role
  userId: string
  userIp: string
}

type DisableManagerCourseUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class DisableManagerCourseUseCase {
  constructor (
    private managersRepository: ManagersRepository,
    private coursesRepository: CoursesRepository,
    private managerCoursesRepository: ManagersCoursesRepository
  ) {}

  async execute({ id, courseId, reason, role, userId, userIp }: DisableManagerCourseUseCaseRequest): Promise<DisableManagerCourseUseCaseResponse> {
    if (role === 'manager') return left(new NotAllowedError())

    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const manager = await this.managersRepository.findById(id)
    if (!manager) return left(new ResourceNotFoundError('Gerente não encontrado.'))

    const managerCourse = await this.managerCoursesRepository.findByManagerIdAndCourseId({
      courseId,
      managerId: id
    })
    if (!managerCourse) return left(new ResourceNotFoundError('Gerente não está presente no curso!'))

    managerCourse.isActive = false
    managerCourse.reason = reason

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