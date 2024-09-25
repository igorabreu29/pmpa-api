import { left, right, type Either } from "@/core/either.ts";
import type { ManagersRepository } from "../repositories/managers-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface ChangeManagerAvatarUseCaseRequest {
  id: string
  fileLink: string
}

type ChangeManagerAvatarUseCaseResponse = Either<ResourceNotFoundError, null>

export class ChangeManagerAvatarUseCase {
  constructor (
    private managersRepository: ManagersRepository
  ) {}

  async execute({ id, fileLink }: ChangeManagerAvatarUseCaseRequest): Promise<ChangeManagerAvatarUseCaseResponse> {
    const manager = await this.managersRepository.findById(id)
    if (!manager) return left(new ResourceNotFoundError('Gerente não encontrado'))

    manager.avatarUrl = fileLink
    await this.managersRepository.save(manager)

    return right(null)
  }
}