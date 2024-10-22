import { Either, left, right } from "@/core/either.ts";
import { AssessmentsRepository } from "../repositories/assessments-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import { DisciplinesRepository } from "../repositories/disciplines-repository.ts";

import dayjs from "dayjs";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { AssessmentEvent } from "../../enterprise/events/assessment-event.ts";
import type { GenerateClassification } from "../classification/generate-classification.ts";

interface CreateAssessmentUseCaseRequest {
  userId: string
  studentId: string
  courseId: string
  disciplineId: string
  vf: number | null
  avi?: number
  avii?: number
  vfe?: number
  userIp: string

  role: Role
}

type CreateAssessmentUseCaseResponse = Either<ResourceNotFoundError | ResourceAlreadyExistError | ConflictError, null>

export class CreateAssessmentUseCase {
  constructor (
    private assessmentsRepository: AssessmentsRepository,
    private coursesRepository: CoursesRepository,
    private disciplinesRepository: DisciplinesRepository,
    private studentsRepository: StudentsRepository,
    private generateClassification: GenerateClassification
  ) {}

  async execute({
    userId,
    studentId,
    courseId,
    disciplineId,
    vf,
    avi,
    avii,
    vfe,
    userIp,
    role
  }: CreateAssessmentUseCaseRequest): Promise<CreateAssessmentUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())
      
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    if (dayjs(course.endsAt.value).isBefore(new Date())) return left(new ConflictError('Curso finalizado!'))

    const discipline = await this.disciplinesRepository.findById(disciplineId)
    if (!discipline) return left(new ResourceNotFoundError('Disciplina não encontrada!'))

    const student = await this.studentsRepository.findById(studentId)
    if (!student) return left(new ResourceNotFoundError('Estudante não encontrado.'))

    const assessmentAlreadyAdded = await this.assessmentsRepository.findByStudentAndDisciplineAndCourseId({ studentId, courseId, disciplineId }) 
    if (assessmentAlreadyAdded) return left(new ResourceAlreadyExistError('Av já existente.'))

    const assessmentOrError = Assessment.create({
      studentId: new UniqueEntityId(studentId),
      courseId: new UniqueEntityId(courseId),
      disciplineId: new UniqueEntityId(disciplineId),
      vf,
      avi,
      avii,
      vfe
    })
    if (assessmentOrError.isLeft()) return left(assessmentOrError.value)
    const assessment = assessmentOrError.value

    assessment.addDomainAssessmentEvent(new AssessmentEvent({
      assessment,
      courseName: course.name.value,
      disciplineName: discipline.name.value,
      studentName: student.username.value,
      reporterId: userId,
      reporterIp: userIp
    }))

    await this.assessmentsRepository.create(assessment)
    await this.generateClassification.run({ courseId: course.id.toValue() })

    return right(null)
  }
}