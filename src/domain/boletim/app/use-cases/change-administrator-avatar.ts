import { left, right, type Either } from "@/core/either.ts";
import type { AdministratorsRepository } from "../repositories/administrators-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface ChangeAdministratorAvatarUseCaseRequest {
  id: string
  fileLink: string
}

type ChangeAdministratorAvatarUseCaseResponse = Either<ResourceNotFoundError, null>

export class ChangeAdministratorAvatarUseCase {
  constructor (
    private administratorsRepository: AdministratorsRepository
  ) {}

  async execute({ id, fileLink }: ChangeAdministratorAvatarUseCaseRequest): Promise<ChangeAdministratorAvatarUseCaseResponse> {
    const administrator = await this.administratorsRepository.findById(id)
    if (!administrator) return left(new ResourceNotFoundError('Administrator not found'))

    administrator.avatarUrl = fileLink
    await this.administratorsRepository.save(administrator)

    return right(null)
  }
}