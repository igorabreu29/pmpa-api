import { Either, left, right } from "@/core/either.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Role } from "../../enterprise/entities/authenticate.ts";
import { AssessmentRemovedGradeEvent } from "../../enterprise/events/assessment-removed-grade-event.ts";
import type { BehaviorsRepository } from "../repositories/behaviors-repository.ts";
import { BehaviorRemovedGradeEvent } from "../../enterprise/events/behavior-removed-grade.ts";

interface RemoveBehaviorGradeUseCaseRequest {
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

type RemoveBehaviorGradeUseCaseResponse = Either<
  | ResourceNotFoundError
  | NotAllowedError, null>

export class RemoveBehaviorGradeUseCase {
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
  }: RemoveBehaviorGradeUseCaseRequest): Promise<RemoveBehaviorGradeUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const behavior = await this.behaviorsRepository.findById({ id })
    if (!behavior) return left(new ResourceNotFoundError('Av não encontrada.'))

    behavior.january = january ? null : behavior.january
    behavior.february = february ? null : behavior.february
    behavior.march = march ? null : behavior.march
    behavior.april = april ? null : behavior.april
    behavior.may = may ? null : behavior.may
    behavior.jun = jun ? null : behavior.jun
    behavior.july = july ? null : behavior.july
    behavior.august = august ? null : behavior.august
    behavior.september = september ? null : behavior.september
    behavior.october = october ? null : behavior.october
    behavior.november = november ? null : behavior.november
    behavior.december = december ? null : behavior.december
        
    behavior.addDomainBehaviorEvent(new BehaviorRemovedGradeEvent({
      behavior,
      reporterId: userId,
      reporterIp: userIp
    }))
    
    await this.behaviorsRepository.update(behavior)

    return right(null)
  }
}