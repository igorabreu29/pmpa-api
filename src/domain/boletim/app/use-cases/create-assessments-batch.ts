import { Either, left, right } from "@/core/either.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { DisciplinesRepository } from "../repositories/disiciplines-repository.ts"
import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts"
import { AssessmentsRepository } from "../repositories/assessments-repository.ts"
import { AssessmentBatch } from "../../enterprise/entities/assessment-batch.ts"
import { AssessmentsBatchRepository } from "../repositories/assessments-batch-repository.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { ConflictError } from "./errors/conflict-error.ts"
import { StudentsRepository } from "../repositories/students-repository.ts"
import dayjs from "dayjs"

interface Error {
  name: string
  message: string
}

interface StudentAssessment {
  cpf: string
  disciplineName: string
  poleName: string
  avi: number | null
  avii: number | null
  vf: number
  vfe: number | null
}

interface CreateAssessmentsBatchUseCaseRequest {
  studentAssessments: StudentAssessment[],
  courseId: string
  userId: string
  userIp: string,
  fileLink: string
  fileName: string
}

type CreateAssessmentsBatchUseCaseResponse = Either<ResourceNotFoundError | Error[], null>

export class CreateAssessmentsBatchUseCase {
  constructor (
    private studentsRepository: StudentsRepository,
    private coursesRepository: CoursesRepository,
    private disciplinesRepository: DisciplinesRepository,
    private assessmentsRepository: AssessmentsRepository,
    private assessmentsBatchRepository: AssessmentsBatchRepository,
  ) {}

  async execute({ studentAssessments, courseId, userIp, userId, fileLink, fileName }: CreateAssessmentsBatchUseCaseRequest): Promise<CreateAssessmentsBatchUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))
    if (dayjs(course.endsAt.value).isBefore(new Date())) return left(new ConflictError('Course has been finished.'))

    const assessmentsBatchOrError = await Promise.all(studentAssessments.map(async (studentAssessment) => {
      const student = await this.studentsRepository.findByCPF(studentAssessment.cpf)
      if (!student) return new ResourceNotFoundError('Student not found.')

      const discipline = await this.disciplinesRepository.findByName(studentAssessment.disciplineName)
      if (!discipline) return new ResourceNotFoundError('Discipline not found.')

      const assessmentAlreadyExistToStudent = await this.assessmentsRepository.findByStudentIdAndCourseId({ studentId: student.id.toValue(), courseId: course.id.toValue() })
      if (assessmentAlreadyExistToStudent) new ResourceAlreadyExistError('Assessment already released to the student')

      const assessmentOrError = Assessment.create({
        courseId: course.id,
        disciplineId: discipline.id,
        studentId: student.id,
        avi: studentAssessment.avi,
        avii: studentAssessment.avii,
        vf: studentAssessment.vf,
        vfe: studentAssessment.vfe
      })
      if (assessmentOrError.isLeft()) return assessmentOrError.value

      return assessmentOrError.value  
    }))

    const errors = assessmentsBatchOrError.filter(item => item instanceof Error)
    if (errors.length) return left(errors.map(error => error))

    const assessments = assessmentsBatchOrError as Assessment[]
    const assessmentBatch = AssessmentBatch.create({
      courseId: new UniqueEntityId(courseId),
      userId: new UniqueEntityId(userId),
      assessments,
      userIp,
      fileLink,
      fileName
    })
    await this.assessmentsBatchRepository.create(assessmentBatch)

    return right(null)
  }
}