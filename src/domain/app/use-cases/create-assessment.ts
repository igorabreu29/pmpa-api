import { Either, left, right } from "@/core/either.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Assessment } from "@/domain/enterprise/entities/assessment.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface CreateAssessmentUseCaseRequest {
  studentId: string
  courseId: string
  poleId: string
  disciplineId: string
  vf: number
  vfe: number | null
  avi?: number
  avii?: number
}

type CreateAssessmentUseCaseResponse = Either<ResourceNotFoundError, null>

export class CreateAssessmentUseCase {
  constructor(
    private assessmentsRepository: AssessmentsRepository
  ) {}

  async execute({
    studentId,
    courseId,
    poleId,
    disciplineId,
    vf,
    vfe,
    avi,
    avii
  }: CreateAssessmentUseCaseRequest): Promise<CreateAssessmentUseCaseResponse> {
    const assessmentAlreadyAdded = await this.assessmentsRepository.findByStudentIdAndCourseId({ studentId, studentCourseId: courseId }) 
    if (assessmentAlreadyAdded) return left(new ResourceNotFoundError('Assessment already exist.'))

    const assessment = Assessment.create({
      studentId: new UniqueEntityId(studentId),
      courseId: new UniqueEntityId(courseId),
      poleId: new UniqueEntityId(poleId),
      disciplineId: new UniqueEntityId(disciplineId),
      vf,
      vfe,
      avi,
      avii
    })
    await this.assessmentsRepository.create(assessment)

    return right(null)
  }
}