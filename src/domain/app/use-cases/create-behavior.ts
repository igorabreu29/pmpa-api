import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { BehaviorsRepository } from "../repositories/behaviors-repository.ts";
import { Behavior } from "@/domain/enterprise/entities/behavior.ts";

interface CreateBehaviorUseCaseRequest {
  studentId: string
  courseId: string
  poleId: string
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
  currentYear: number
}

type CreateBehaviorUseCaseResponse = Either<ResourceNotFoundError, null>

export class CreateBehaviorUseCase {
  constructor(
    private behaviorsRepository: BehaviorsRepository
  ) {}

  async execute({
    studentId,
    courseId,
    poleId,
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
    currentYear
  }: CreateBehaviorUseCaseRequest): Promise<CreateBehaviorUseCaseResponse> {
  const behaviorAlreadyAdded = await this.behaviorsRepository.findByStudentIdAndCourseId({ studentId, courseId }) 
    if (behaviorAlreadyAdded) return left(new ResourceNotFoundError('Behaviors already exist.'))

    const behavior = Behavior.create({
      studentId: new UniqueEntityId(studentId),
      courseId: new UniqueEntityId(courseId),
      poleId: new UniqueEntityId(poleId),
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
      currentYear
    })
    await this.behaviorsRepository.create(behavior)

    return right(null)
  }
}