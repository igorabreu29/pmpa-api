import { Either, left, right } from "@/core/either.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { AssessmentEvent } from "../../enterprise/events/assessment-event.ts";

interface DeleteAssessmentUseCaseUseCaseRequest {
  id: string
  userId: string
  userIp: string
}

type DeleteAssessmentUseCaseUseCaseResponse = Either<ResourceNotFoundError, null>

export class DeleteAssessmentUseCaseUseCase {
  constructor (
    private assessmentsRepository: AssessmentsRepository
  ) {}

  async execute({ id, userId, userIp }: DeleteAssessmentUseCaseUseCaseRequest): Promise<DeleteAssessmentUseCaseUseCaseResponse> {
    const assessment = await this.assessmentsRepository.findById({ id }) 
    if (!assessment) return left(new ResourceNotFoundError('Assessment not found.'))

    assessment.addDomainAssessmentEvent(new AssessmentEvent({
      assessment,
      reporterId: userId,
      reporterIp: userIp
    }))

    await this.assessmentsRepository.delete(assessment)
    return right(null)
  }
}