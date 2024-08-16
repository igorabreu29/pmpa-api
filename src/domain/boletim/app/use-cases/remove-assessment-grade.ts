import { Either, left, right } from "@/core/either.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { Role } from "../../enterprise/entities/authenticate.ts";
import { AssessmentEvent } from "../../enterprise/events/assessment-event.ts";

interface RemoveAssessmentGradeUseCaseRequest {
  id: string
  vf?: number
  avi?: number
  avii?: number
  vfe?: number

  userId: string
  userIp: string

  role: Role
}

type RemoveAssessmentGradeUseCaseResponse = Either<
  | ResourceNotFoundError
  | NotAllowedError, null>

export class RemoveAssessmentGradeUseCase {
  constructor(
    private assessmentsRepository: AssessmentsRepository
  ) {}

  async execute({
    id,
    vf,
    avi,
    avii,
    vfe,
    userId,
    userIp,
    role
  }: RemoveAssessmentGradeUseCaseRequest): Promise<RemoveAssessmentGradeUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const assessment = await this.assessmentsRepository.findById({ id })
    if (!assessment) return left(new ResourceNotFoundError('Assessment not found.'))

    assessment.vf = vf ? null : assessment.vf
    assessment.avi = avi ? null : assessment.avi
    assessment.avii = avii ? null : assessment.avii
    assessment.vfe = vfe ? null : assessment.vfe
    
    assessment.addDomainAssessmentEvent(new AssessmentEvent({
      assessment,
      reporterId: userId,
      reporterIp: userIp
    }))

    await this.assessmentsRepository.update(assessment)

    return right(null)
  }
}