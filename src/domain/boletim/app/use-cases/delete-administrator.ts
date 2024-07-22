import { left, right, type Either } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { AdministratorsRepository } from "../repositories/administrators-repository.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

interface DeleteAdministratorUseCaseRequest {
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

  async execute({ id, role }: DeleteAdministratorUseCaseRequest): Promise<DeleteAdministratorUseCaseResponse> {
    const administrator = await this.administratorsRepository.findById(id)
    if (!administrator) return left(new ResourceNotFoundError('Administrator not found.'))
    if (role !== 'dev') return left(new NotAllowedError())
    
    await this.administratorsRepository.delete(administrator)
    return right(null)
  }
}