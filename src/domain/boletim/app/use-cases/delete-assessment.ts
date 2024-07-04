import { Either, left, right } from "@/core/either.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface DeleteAssessmentUseCaseUseCaseRequest {
  id: string
}

type DeleteAssessmentUseCaseUseCaseResponse = Either<ResourceNotFoundError, null>

export class DeleteAssessmentUseCaseUseCase {
  constructor(
    private assessmentsRepository: AssessmentsRepository
  ) {}

  async execute({ id }: DeleteAssessmentUseCaseUseCaseRequest): Promise<DeleteAssessmentUseCaseUseCaseResponse> {
    const assessment = await this.assessmentsRepository.findById({ id }) 
    if (!assessment) return left(new ResourceNotFoundError('Assessment not found.'))
    
    await this.assessmentsRepository.delete(assessment)
    return right(null)
  }
}