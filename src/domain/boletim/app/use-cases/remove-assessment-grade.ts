import { Either, left, right } from "@/core/either.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { Role } from "../../enterprise/entities/authenticate.ts";
import { AssessmentRemovedGradeEvent } from "../../enterprise/events/assessment-removed-grade-event.ts";
import { Assessment } from "../../enterprise/entities/assessment.ts";

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
    if (!assessment) return left(new ResourceNotFoundError('Av não encontrada.'))

    const previousAssessment = assessment

    assessment.vf = vf ? null : assessment.vf
    assessment.avi = avi ? null : assessment.avi
    assessment.avii = avii ? null : assessment.avii
    assessment.vfe = vfe ? null : assessment.vfe

    const averageAndStatus = Assessment.generateAverageAndStatus({
      vf: !assessment.vf ? -1 : assessment.vf, 
      avi: !assessment.avi ? -1 : assessment.avi,
      avii: !assessment.avii ? -1 : assessment.avii, 
      vfe: !assessment.vfe ? null : assessment.vfe
    })

    assessment.average = averageAndStatus.average || 0
    assessment.status = averageAndStatus.status
    assessment.isRecovering = averageAndStatus.isRecovering
        
    assessment.addDomainAssessmentEvent(new AssessmentRemovedGradeEvent({
      previousAssessment,
      assessment,
      reporterId: userId,
      reporterIp: userIp
    }))
    
    await this.assessmentsRepository.update(assessment)

    return right(null)
  }
}