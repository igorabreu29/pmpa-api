import { Either, left, right } from "@/core/either.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ConflictError } from "./errors/conflict-error.ts";

interface UpdateAssessmentUseCaseUseCaseRequest {
  id: string
  vf?: number
  avi?: number
  avii?: number
  vfe?: number
}

type UpdateAssessmentUseCaseUseCaseResponse = Either<ResourceNotFoundError, null>

export class UpdateAssessmentUseCaseUseCase {
  constructor ( 
    private assessmentsRepository: AssessmentsRepository
  ) {}

  async execute({
    id,
    vf,
    vfe,
    avi,
    avii
  }: UpdateAssessmentUseCaseUseCaseRequest): Promise<UpdateAssessmentUseCaseUseCaseResponse> {
    const assessment = await this.assessmentsRepository.findById({ id }) 
    if (!assessment) return left(new ResourceNotFoundError('Assessment not found.'))
    
    assessment.vf = vf || assessment.vf
    assessment.vfe = vfe || assessment.vfe
    assessment.avi = avi || assessment.avi
    assessment.avii = avii || assessment.avii

    if (avi && !assessment.avi) return left(new ConflictError('Invalid size number'))
    if (avii && !assessment.avii) return left(new ConflictError('Conflict between expected format or size number'))
    if (vfe && !assessment.vfe) return left(new ConflictError('Invalid size number'))

    await this.assessmentsRepository.update(assessment)

    return right(null)
  }
}