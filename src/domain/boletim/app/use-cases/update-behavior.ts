import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { BehaviorsRepository } from "../repositories/behaviors-repository.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { BehaviorUpdatedEvent } from "../../enterprise/events/behavior-updated-event.ts";

interface UpdateBehaviorUseCaseUseCaseRequest {
  id: string
  january?: number
  february?: number
  march?: number
  april?: number
  may?: number
  jun?: number
  july?: number
  august?: number
  september?: number
  october?: number
  november?: number
  december?: number
  userId: string
  userIp: string

  role: Role
}

type UpdateBehaviorUseCaseUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class UpdateBehaviorUseCaseUseCase {
  constructor(
    private behaviorsRepository: BehaviorsRepository
  ) {}

  async execute({
    id,
    january,
    february,
    march,
    april,
    may,
    jun,
    july,
    august,
    september,
    october,
    november,
    december, 
    userIp,
    userId,
    role
  }: UpdateBehaviorUseCaseUseCaseRequest): Promise<UpdateBehaviorUseCaseUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const behavior = await this.behaviorsRepository.findById({ id }) 
    if (!behavior) return left(new ResourceNotFoundError('Behavior not found.'))
    
    behavior.january = january || behavior.january
    behavior.february = february || behavior.february
    behavior.march = march || behavior.march
    behavior.april = april || behavior.april
    behavior.may = may || behavior.may
    behavior.jun = jun || behavior.jun
    behavior.july = july || behavior.july
    behavior.august = august || behavior.august
    behavior.september = september || behavior.september
    behavior.october = october || behavior.october
    behavior.november = november || behavior.november
    behavior.december = december || behavior.december

    behavior.addDomainBehaviorEvent(new BehaviorUpdatedEvent({
      behavior,
      reporterId: userId,
      reporterIp: userIp
    }))
    
    await this.behaviorsRepository.update(behavior)

    return right(null)
  }
}