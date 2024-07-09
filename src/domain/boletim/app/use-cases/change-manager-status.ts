import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ManagersRepository } from "../repositories/managers-repository.ts";

interface ChangeManagerStatusUseCaseRequest {
  id: string
  status: boolean
}

type ChangeManagerStatusUseCaseResponse = Either<ResourceNotFoundError, null>

export class ChangeManagerStatusUseCase {
  constructor (
    private managersRepository: ManagersRepository
  ) {}

  async execute({ id, status }: ChangeManagerStatusUseCaseRequest): Promise<ChangeManagerStatusUseCaseResponse> {
    const manager = await this.managersRepository.findById(id)
    if (!manager) return left(new ResourceNotFoundError('Manager not found.'))

    manager.active = status
    await this.managersRepository.save(manager)

    return right(null)
  }
}