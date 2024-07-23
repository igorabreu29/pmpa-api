import { Either, left, right } from "@/core/either.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Behavior } from "@/domain/boletim/enterprise/entities/behavior.ts";
import dayjs from "dayjs";
import { BehaviorEvent } from "../../enterprise/events/behavior-event.ts";
import { BehaviorsRepository } from "../repositories/behaviors-repository.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { StudentsRepository } from "../repositories/students-repository.ts";
import { ConflictError } from "./errors/conflict-error.ts";

interface CreateBehaviorUseCaseRequest {
  studentId: string
  courseId: string
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
  userId: string
  userIp: string
}

type CreateBehaviorUseCaseResponse = Either<ResourceNotFoundError, null>

export class CreateBehaviorUseCase {
  constructor(
    private behaviorsRepository: BehaviorsRepository,
    private coursesRepository: CoursesRepository,
    private studentsRepository: StudentsRepository
  ) {}

  async execute({
    studentId,
    courseId,
    january, 
    february,
    march,
    april,
    may, 
    jun,
    july,
    august, 
    september,
    october,
    november,
    december,
    userIp,
    userId
  }: CreateBehaviorUseCaseRequest): Promise<CreateBehaviorUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    if (dayjs(course.endsAt.value).isBefore(new Date())) return left(new ConflictError('Course has been finished.'))
      
    const student = await this.studentsRepository.findById(studentId)
    if (!student) return left(new ResourceNotFoundError('Student not found.'))

    const behaviorAlreadyAdded = await this.behaviorsRepository.findByStudentIdAndCourseId({ studentId, courseId }) 
    if (behaviorAlreadyAdded) return left(new ResourceNotFoundError('Behaviors already exist.'))

    const behavior = Behavior.create({
      studentId: new UniqueEntityId(studentId),
      courseId: new UniqueEntityId(courseId),
      january,
      february,
      march,
      april,
      may,
      jun,
      july,
      august,
      september,
      october,
      november,
      december,
    })
    behavior.addDomainBehaviorEvent(new BehaviorEvent({ behavior, reporterId: userId, reporterIp: userIp }))
    await this.behaviorsRepository.create(behavior)

    return right(null)
  }
}