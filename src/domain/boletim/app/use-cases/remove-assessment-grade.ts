import { Either, left, right } from "@/core/either.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { Role } from "../../enterprise/entities/authenticate.ts";
import { AssessmentEvent } from "../../enterprise/events/assessment-event.ts";
import { AssessmentRemovedGradeEvent } from "../../enterprise/events/assessment-removed-grade-event.ts";

interface RemoveAssessmentGradeUseCaseRequest {
  studentId: string
  disciplineId: string
  courseId: string
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
    studentId,
    disciplineId,
    courseId,
    vf,
    avi,
    avii,
    vfe,
    userId,
    userIp,
    role
  }: RemoveAssessmentGradeUseCaseRequest): Promise<RemoveAssessmentGradeUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const assessment = await this.assessmentsRepository.findByStudentAndDisciplineAndCourseId({ courseId, disciplineId, studentId })
    if (!assessment) return left(new ResourceNotFoundError('Assessment not found.'))

    assessment.vf = vf ? null : assessment.vf
    assessment.avi = avi ? null : assessment.avi
    assessment.avii = avii ? null : assessment.avii
    assessment.vfe = vfe ? null : assessment.vfe
        
    assessment.addDomainAssessmentEvent(new AssessmentRemovedGradeEvent({
      assessment,
      reporterId: userId,
      reporterIp: userIp
    }))
    
    await this.assessmentsRepository.update(assessment)

    return right(null)
  }
}