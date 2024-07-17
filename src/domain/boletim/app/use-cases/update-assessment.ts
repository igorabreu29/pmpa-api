import { Either, left, right } from "@/core/either.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { Assessment } from "../../enterprise/entities/assessment.ts";
import { AssessmentEvent } from "../../enterprise/events/assessment-event.ts";

interface UpdateAssessmentUseCaseUseCaseRequest {
  id: string
  userId: string
  userIp: string
  vf?: number
  avi?: number
  avii?: number
  vfe?: number
}

type UpdateAssessmentUseCaseUseCaseResponse = Either<ResourceNotFoundError | ConflictError, null>

export class UpdateAssessmentUseCaseUseCase {
  constructor ( 
    private assessmentsRepository: AssessmentsRepository
  ) {}

  async execute({
    id,
    userId,
    userIp,
    vf,
    vfe,
    avi,
    avii,
  }: UpdateAssessmentUseCaseUseCaseRequest): Promise<UpdateAssessmentUseCaseUseCaseResponse> {
    const assessment = await this.assessmentsRepository.findById({ id }) 
    if (!assessment) return left(new ResourceNotFoundError('Assessment not found.'))

    const assessmentOrError = Assessment.create({
      courseId: assessment.courseId,
      disciplineId: assessment.disciplineId,
      studentId: assessment.studentId,
      vf: vf || assessment.vf,
      avi: avi || assessment.avi,
      avii: avii || assessment.avii,
      vfe: vfe || assessment.vfe
    }, assessment.id)
    if (assessmentOrError.isLeft()) return left(assessmentOrError.value)
    const assessmentCreated = assessmentOrError.value

    assessmentCreated.addDomainAssessmentEvent(new AssessmentEvent({
      assessment: assessmentCreated,
      reporterId: userId,
      reporterIp: userIp
    }))

    await this.assessmentsRepository.update(assessmentCreated)

    return right(null)
  }
}