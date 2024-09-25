import { left, right, type Either } from "@/core/either.ts";
import type { DevelopersRepository } from "../repositories/developers-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface ChangeDeveloperAvatarUseCaseRequest {
  id: string
  fileLink: string
}

type ChangeDeveloperAvatarUseCaseResponse = Either<ResourceNotFoundError, null>

export class ChangeDeveloperAvatarUseCase {
  constructor (
    private developersRepository: DevelopersRepository
  ) {}

  async execute({ id, fileLink }: ChangeDeveloperAvatarUseCaseRequest): Promise<ChangeDeveloperAvatarUseCaseResponse> {
    const developer = await this.developersRepository.findById(id)
    if (!developer) return left(new ResourceNotFoundError('Desenvolvedor não encontrado'))

    developer.avatarUrl = fileLink
    await this.developersRepository.save(developer)

    return right(null)
  }
}