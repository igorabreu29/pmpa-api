import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { AdministratorsRepository } from "../repositories/administrators-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

interface ChangeAdministratorStatusUseCaseRequest {
  id: string
  status: boolean

  role: Role
}

type ChangeAdministratorStatusUseCaseResponse = Either<ResourceNotFoundError, null>

export class ChangeAdministratorStatusUseCase {
  constructor (
    private administratorsRepository: AdministratorsRepository
  ) {}

  async execute({ id, status, role }: ChangeAdministratorStatusUseCaseRequest): Promise<ChangeAdministratorStatusUseCaseResponse> {
    if (role !== 'dev') return left(new NotAllowedError())

    const administrator = await this.administratorsRepository.findById(id)
    if (!administrator) return left(new ResourceNotFoundError('Administrator not found.'))

    administrator.active = status
    await this.administratorsRepository.save(administrator)

    return right(null)
  }
}