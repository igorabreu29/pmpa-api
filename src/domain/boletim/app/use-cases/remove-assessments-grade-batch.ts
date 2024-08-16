import { Either, left, right } from "@/core/either.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { DisciplinesRepository } from "../repositories/disciplines-repository.ts"
import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts"
import { AssessmentsRepository } from "../repositories/assessments-repository.ts"
import { AssessmentBatch } from "../../enterprise/entities/assessment-batch.ts"
import { AssessmentsBatchRepository } from "../repositories/assessments-batch-repository.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { ConflictError } from "./errors/conflict-error.ts"
import { StudentsRepository } from "../repositories/students-repository.ts"
import dayjs from "dayjs"
import type { Role } from "../../enterprise/entities/authenticate.ts"
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts"

interface StudentAssessment {
  cpf: string
  disciplineName: string
  vf?: number
  avi?: number
  avii?: number
  vfe?: number
}

export interface RemoveAssessmentsGradeBatchUseCaseRequest {
  studentAssessments: StudentAssessment[]
  courseId: string
  userId: string
  userIp: string,
  fileLink: string
  fileName: string
  
  role: Role
}

type RemoveAssessmentsGradeBatchUseCaseResponse = Either<ResourceNotFoundError| NotAllowedError | ConflictError, null>

export class RemoveAssessmentsGradeBatchUseCase {
  constructor (
    private studentsRepository: StudentsRepository,
    private coursesRepository: CoursesRepository,
    private disciplinesRepository: DisciplinesRepository,
    private assessmentsRepository: AssessmentsRepository,
    private assessmentsBatchRepository: AssessmentsBatchRepository,
  ) {}

  async execute({ studentAssessments, courseId, userIp, userId, fileLink, fileName, role }: RemoveAssessmentsGradeBatchUseCaseRequest): Promise<RemoveAssessmentsGradeBatchUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())
    
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    if (dayjs(course.endsAt.value).isBefore(new Date())) return left(new ConflictError('Course has been finished.'))

    const assessmentsBatchOrError = await Promise.all(studentAssessments.map(async (studentAssessment) => {
      const student = await this.studentsRepository.findByCPF(studentAssessment.cpf)
      if (!student) return new ResourceNotFoundError('Student not found.')

      const discipline = await this.disciplinesRepository.findByName(studentAssessment.disciplineName)
      if (!discipline) return new ResourceNotFoundError('Discipline not found.')

      const assessment = await this.assessmentsRepository.findByStudentAndDisciplineAndCourseId({
        studentId: student.id.toValue(),
        disciplineId: discipline.id.toValue(),
        courseId: course.id.toValue()
      })
      if (!assessment) return new ResourceNotFoundError('Assessment not found.')

      assessment.vf = studentAssessment.vf === -1 ? null : assessment.vf
      assessment.avi = studentAssessment.avi === -1 ? null : assessment.avi
      assessment.avii = studentAssessment.avii === -1 ? null : assessment.avii,
      assessment.vfe = studentAssessment.vfe === -1 ? null : assessment.vfe

      return assessment
    }))

    const error = assessmentsBatchOrError.find(item => item instanceof Error)
    if (error) return left(error)

    const assessments = assessmentsBatchOrError as Assessment[]
    const assessmentBatch = AssessmentBatch.create({
      courseId: new UniqueEntityId(courseId),
      userId: new UniqueEntityId(userId),
      assessments,
      userIp,
      fileLink,
      fileName
    })
    await this.assessmentsBatchRepository.save(assessmentBatch)

    return right(null)
  }
}