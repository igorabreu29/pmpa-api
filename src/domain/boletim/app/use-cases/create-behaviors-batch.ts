import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { BehaviorsRepository } from "../repositories/behaviors-repository.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import { Either, left, right } from "@/core/either.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import dayjs from "dayjs";
import { Behavior } from "../../enterprise/entities/behavior.ts";
import { BehaviorsBatchRepository } from "../repositories/behaviors-batch-repository.ts";
import { BehaviorBatch } from "../../enterprise/entities/behavior-batch.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import type { Role } from "../../enterprise/entities/authenticate.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import type { GenerateClassification } from "../classification/generate-classification.ts";

interface StudentBehavior {
  cpf: string
  january?: number | null
  february?: number | null
  march?: number | null
  april?: number | null
  may?: number | null
  jun?: number | null
  july?: number | null
  august?: number | null
  september?: number | null
  october?: number | null
  november?: number | null
  december?: number | null

  module: number
  currentYear: number
}

interface CreateBehaviorBatchUseCaseRequest {
  studentBehaviors: StudentBehavior[]
  courseId: string
  userId: string
  userIp: string,
  fileLink: string
  fileName: string

  role: Role
}

type CreateBehaviorBatchUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | ResourceAlreadyExistError,
  null
>

export class CreateBehaviorsBatchUseCase {
  constructor (
    private behaviorsRepository: BehaviorsRepository,
    private coursesRepository: CoursesRepository,
    private studentsRepository: StudentsRepository,
    private behaviorsBatchRepository: BehaviorsBatchRepository,
    private generateClassification: GenerateClassification
  ) {}

  async execute({
    studentBehaviors,
    courseId,
    fileLink,
    fileName,
    userId,
    userIp,
    role
  }: CreateBehaviorBatchUseCaseRequest): Promise<CreateBehaviorBatchUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))
    if (dayjs(course.endsAt.value).isBefore(new Date())) return left(new ConflictError('Curso finalizado!'))

    const studentBehaviorsOrError = await Promise.all(studentBehaviors.map(async (studentBehavior) => {
      const student = await this.studentsRepository.findByCPF(studentBehavior.cpf)
      if (!student) return new ResourceNotFoundError(`${studentBehavior.cpf} não existente!`)

      const behaviorAlreadyExist = await this.behaviorsRepository.findByStudentAndCourseIdAndYearAndModule({
        courseId: course.id.toValue(),
        studentId: student.id.toValue(),
        year: studentBehavior.currentYear,
        module: studentBehavior.module
      })

      if (behaviorAlreadyExist) return new ResourceAlreadyExistError(`Comportamento já lançada para o estudante: ${student.username.value}(${student.cpf.value})!`)

      const behavior = Behavior.create({
        courseId: course.id,
        studentId: student.id,
        january: studentBehavior.january,
        february: studentBehavior.february,
        march: studentBehavior.march,
        april: studentBehavior.april,
        may: studentBehavior.may,
        jun: studentBehavior.jun,
        july: studentBehavior.july,
        august: studentBehavior.august,
        september: studentBehavior.september,
        october: studentBehavior.october,
        november: studentBehavior.november,
        december: studentBehavior.december,
        currentYear: studentBehavior.currentYear,
        module: studentBehavior.module
      })

      return behavior
    }))

    const error = studentBehaviorsOrError.find(item => item instanceof Error)
    if (error) return left(error)

    const behaviors = studentBehaviorsOrError as Behavior[]
    const behaviorBatch = BehaviorBatch.create({
      courseId: course.id,
      userId: new UniqueEntityId(userId),
      userIp,
      behaviors,
      fileName,
      fileLink
    })
    await this.behaviorsBatchRepository.create(behaviorBatch)

    await this.generateClassification.run({ courseId: course.id.toValue() })

    return right(null)
  }
}