import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";
import { AdministratorsRepository } from "../repositories/administrators-repository.ts";

interface ChangeAdministratorStatusUseCaseRequest {
  id: string
  status: boolean
}

type ChangeAdministratorStatusUseCaseResponse = Either<ResourceNotFoundError, null>

export class ChangeAdministratorStatusUseCase {
  constructor (
    private administratorsRepository: AdministratorsRepository
  ) {}

  async execute({ id, status }: ChangeAdministratorStatusUseCaseRequest): Promise<ChangeAdministratorStatusUseCaseResponse> {
    const administrator = await this.administratorsRepository.findById(id)
    if (!administrator) return left(new ResourceNotFoundError('Administrator not found.'))

    administrator.active = status
    await this.administratorsRepository.save(administrator)

    return right(null)
  }
}