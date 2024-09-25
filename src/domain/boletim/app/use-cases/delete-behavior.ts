import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { BehaviorsRepository } from "../repositories/behaviors-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { BehaviorEvent } from "../../enterprise/events/behavior-event.ts";
import { BehaviorDeletedEvent } from "../../enterprise/events/behavior-deleted-event.ts";

interface DeleteBehaviorUseCaseUseCaseRequest {
  id: string
  userId: string
  userIp: string

  role: Role
}

type DeleteBehaviorUseCaseUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class DeleteBehaviorUseCaseUseCase {
  constructor(
    private behaviorsRepository: BehaviorsRepository
  ) {}

  async execute({
    id,
    userId,
    userIp,
    role
  }: DeleteBehaviorUseCaseUseCaseRequest): Promise<DeleteBehaviorUseCaseUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const behavior = await this.behaviorsRepository.findById({ id }) 
    if (!behavior) return left(new ResourceNotFoundError('Comportamento não encontrado!'))

    behavior.addDomainBehaviorEvent(new BehaviorDeletedEvent({
      behavior,
      reporterId: userId,
      reporterIp: userIp
    }))
      
    await this.behaviorsRepository.delete(behavior)
    return right(null)
  }
}