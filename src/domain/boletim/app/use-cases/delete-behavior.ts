import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { BehaviorsRepository } from "../repositories/behaviors-repository.ts";

interface DeleteBehaviorUseCaseUseCaseRequest {
  id: string
}

type DeleteBehaviorUseCaseUseCaseResponse = Either<ResourceNotFoundError, null>

export class DeleteBehaviorUseCaseUseCase {
  constructor(
    private behaviorsRepository: BehaviorsRepository
  ) {}

  async execute({
    id
  }: DeleteBehaviorUseCaseUseCaseRequest): Promise<DeleteBehaviorUseCaseUseCaseResponse> {
    const behavior = await this.behaviorsRepository.findById({ id }) 
    if (!behavior) return left(new ResourceNotFoundError('Behavior not found.'))
    
    await this.behaviorsRepository.delete(behavior)
    return right(null)
  }
}