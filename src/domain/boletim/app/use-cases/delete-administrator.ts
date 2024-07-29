import { left, right, type Either } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { AdministratorsRepository } from "../repositories/administrators-repository.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { AdministratorEvent } from "../../enterprise/events/administrator-event.ts";

interface DeleteAdministratorUseCaseRequest {
  userId: string
  userIp: string

  id: string
  role: string
}

type DeleteAdministratorUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

export class DeleteAdministratorUseCase {
  constructor(
    private administratorsRepository: AdministratorsRepository,
  ) {}

  async execute({ id, role, userId, userIp}: DeleteAdministratorUseCaseRequest): Promise<DeleteAdministratorUseCaseResponse> {
    if (role !== 'dev') return left(new NotAllowedError())
      
    const administrator = await this.administratorsRepository.findById(id)
    if (!administrator) return left(new ResourceNotFoundError('Administrator not found.'))
    
    await this.administratorsRepository.delete(administrator)

    administrator.addDomainAdministratorEvent(
      new AdministratorEvent({
        administrator,
        reporterId: userId, 
        reporterIp: userIp
      })
    )

    return right(null)
  }
}