import { left, right, type Either } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { ManagersRepository } from "../repositories/managers-repository.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ManagerEvent } from "../../enterprise/events/manager-event.ts";

interface DeleteManagerUseCaseRequest {
  userId: string
  userIp: string

  id: string
  role: string
}

type DeleteManagerUseCaseResponse = Either<
  | ResourceNotFoundError
  | NotAllowedError,
  null
>

export class DeleteManagerUseCase {
  constructor(
    private managersRepository: ManagersRepository,
  ) {}

  async execute({ id, role, userId, userIp }: DeleteManagerUseCaseRequest): Promise<DeleteManagerUseCaseResponse> {
    const manager = await this.managersRepository.findById(id)
    if (!manager) return left(new ResourceNotFoundError('Manager not found.'))
    if (role === 'student' || role === 'manager') return left(new NotAllowedError())

    await this.managersRepository.delete(manager)
    
    manager.addDomainManagerEvent(
      new ManagerEvent({
        manager,
        reporterId: userId,
        reporterIp: userIp
      })
    )
  
    return right(null)
  }
}