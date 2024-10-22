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
  january?: number
  february?: number
  march?: number
  april?: number
  may?: number
  jun?: number
  july?: number
  august?: number
  september?: number
  october?: number
  november?: number
  december?: number
  currentYear: number
  module: number
}

interface UpdateBehaviorsBatchUseCaseRequest {
  studentBehaviors: StudentBehavior[]
  courseId: string
  userId: string
  userIp: string,
  fileLink: string
  fileName: string

  role: Role
}

type UpdateBehaviorsBatchUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | ResourceAlreadyExistError,
  null
>

export class UpdateBehaviorsBatchUseCase {
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
  }: UpdateBehaviorsBatchUseCaseRequest): Promise<UpdateBehaviorsBatchUseCaseResponse> {
    if (role === 'student') return left(new NotAllowedError())

    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))
    if (dayjs(course.endsAt.value).isBefore(new Date())) return left(new ConflictError('Curso finalizado!'))

    const studentBehaviorsOrError = await Promise.all(studentBehaviors.map(async (studentBehavior) => {
      const student = await this.studentsRepository.findByCPF(studentBehavior.cpf)
      if (!student) return new ResourceNotFoundError(`${studentBehavior.cpf} não encontrado!`)
        
      const behavior = await this.behaviorsRepository.findByStudentAndCourseIdAndYearAndModule({ 
        studentId: student.id.toValue(), 
        courseId: course.id.toValue(),
        year: studentBehavior.currentYear,
        module: studentBehavior.module
      }) 
      if (!behavior) return new ResourceNotFoundError('Comportamento não encontrado .')

      behavior.january =  studentBehavior.january ?? behavior.january
      behavior.february =  studentBehavior.february ?? behavior.february
      behavior.march =  studentBehavior.march ?? behavior.march
      behavior.april =  studentBehavior.april ?? behavior.april
      behavior.may =  studentBehavior.may ?? behavior.may
      behavior.jun =  studentBehavior.jun ?? behavior.jun
      behavior.july =  studentBehavior.july ?? behavior.july
      behavior.august =  studentBehavior.august ?? behavior.august
      behavior.september =  studentBehavior.september ?? behavior.september
      behavior.october =  studentBehavior.october ?? behavior.october
      behavior.november =  studentBehavior.november ?? behavior.november
      behavior.december =  studentBehavior.december ?? behavior.december

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
    await this.behaviorsBatchRepository.save(behaviorBatch)

    await this.generateClassification.run({ courseId: course.id.toValue() })

    return right(null)
  }
}