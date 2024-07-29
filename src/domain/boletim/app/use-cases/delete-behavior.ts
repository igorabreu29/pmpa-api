import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { BehaviorsRepository } from "../repositories/behaviors-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

interface DeleteBehaviorUseCaseUseCaseRequest {
  id: string

  role: Role
}

type DeleteBehaviorUseCaseUseCaseResponse = Either<ResourceNotFoundError, null>

export class DeleteBehaviorUseCaseUseCase {
  constructor(
    private behaviorsRepository: BehaviorsRepository
  ) {}

  async execute({
    id,
    role
  }: DeleteBehaviorUseCaseUseCaseRequest): Promise<DeleteBehaviorUseCaseUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const behavior = await this.behaviorsRepository.findById({ id }) 
    if (!behavior) return left(new ResourceNotFoundError('Behavior not found.'))
    
    await this.behaviorsRepository.delete(behavior)
    return right(null)
  }
}