import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { AdministratorsRepository } from "../repositories/administrators-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";

interface DisableAdministratorUseCaseRequest {
  id: string
  reason: string

  role: Role
  userId: string
  userIp: string
}

type DisableAdministratorUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class DisableAdministratorUseCase {
  constructor (
    private administratorsRepository: AdministratorsRepository
  ) {}

  async execute({ id, reason, role, userId, userIp }: DisableAdministratorUseCaseRequest): Promise<DisableAdministratorUseCaseResponse> {
    if (role !== 'dev') return left(new NotAllowedError())

    const administrator = await this.administratorsRepository.findById(id)
    if (!administrator) return left(new ResourceNotFoundError('Administrator does not be present on the course.'))

    administrator.isActive = false

    // administratorCourse.addDomainAdministratorCourseEvent(
    //   new ChangeAdministratorStatusEvent({
    //     administratorCourse,
    //     reason,
    //     reporterId: userId,
    //     reporterIp: userIp
    //   })
    // )

    await this.administratorsRepository.save(administrator)

    return right(null)
  }
}