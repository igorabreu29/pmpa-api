import { Either, left, right } from "@/core/either.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { AssessmentEvent } from "../../enterprise/events/assessment-event.ts";
import { AssessmentDeletedEvent } from "../../enterprise/events/assessment-deleted-event.ts";

interface DeleteAssessmentUseCaseUseCaseRequest {
  id: string
  userId: string
  userIp: string

  role: Role
}

type DeleteAssessmentUseCaseUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

export class DeleteAssessmentUseCaseUseCase {
  constructor (
    private assessmentsRepository: AssessmentsRepository
  ) {}

  async execute({ id, userId, userIp, role }: DeleteAssessmentUseCaseUseCaseRequest): Promise<DeleteAssessmentUseCaseUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())
    
    const assessment = await this.assessmentsRepository.findById({ id }) 
    if (!assessment) return left(new ResourceNotFoundError('Av não encontrada.'))

    assessment.addDomainAssessmentEvent(new AssessmentDeletedEvent({
      assessment,
      reporterId: userId,
      reporterIp: userIp
    }))

    await this.assessmentsRepository.delete(assessment)
    return right(null)
  }
}