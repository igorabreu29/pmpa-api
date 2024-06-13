import { Either, left, right } from "@/core/either.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface UpdateAssessmentUseCaseUseCaseRequest {
  id: string
  vf: number | null
  vfe?: number | null
  avi?: number
  avii?: number
}

type UpdateAssessmentUseCaseUseCaseResponse = Either<ResourceNotFoundError, null>

export class UpdateAssessmentUseCaseUseCase {
  constructor(
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
    await this.assessmentsRepository.update(assessment)

    return right(null)
  }
}