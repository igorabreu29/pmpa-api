import { Either, left, right } from "@/core/either.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";

interface CreateAssessmentUseCaseRequest {
  studentId: string
  courseId: string
  poleId: string
  disciplineId: string
  vf: number
  avi: number | null
  avii: number | null
  vfe: number | null
  userIP: string
}

type CreateAssessmentUseCaseResponse = Either<ResourceNotFoundError | ConflictError, null>

export class CreateAssessmentUseCase {
  constructor (
    private assessmentsRepository: AssessmentsRepository,
    private coursesRepository: CoursesRepository
  ) {}

  async execute({
    studentId,
    courseId,
    poleId,
    disciplineId,
    vf,
    avi,
    avii,
    vfe,
    userIP
  }: CreateAssessmentUseCaseRequest): Promise<CreateAssessmentUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    if (course.endsAt.getTime() < new Date().getTime()) return left(new ConflictError('Course has been finished.'))

    const assessmentAlreadyAdded = await this.assessmentsRepository.findByStudentIdAndCourseId({ studentId, studentCourseId: courseId }) 
    if (assessmentAlreadyAdded) return left(new ResourceNotFoundError('Assessment already exist.'))

    const assessment = Assessment.create({
      studentId: new UniqueEntityId(studentId),
      courseId: new UniqueEntityId(courseId),
      poleId: new UniqueEntityId(poleId),
      disciplineId: new UniqueEntityId(disciplineId),
      vf,
      avi,
      avii,
      vfe,
      userIP
    })

    if (avi && !assessment.avi) return left(new ConflictError('Invalid size number'))
    if (avii && !assessment.avii) return left(new ConflictError('Conflict between expected format or size number'))
    if (vfe && !assessment.vfe) return left(new ConflictError('Invalid size number'))
    await this.assessmentsRepository.create(assessment)

    return right(null)
  }
}