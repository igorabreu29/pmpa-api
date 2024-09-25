import { left, right, type Either } from "@/core/either.ts";
import type { BehaviorsRepository } from "../repositories/behaviors-repository.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { Behavior } from "../../enterprise/entities/behavior.ts";

interface FetchCourseBehaviorsUseCaseRequest {
  courseId: string
}

type FetchCourseBehaviorsUseCaseResponse = Either<ResourceNotFoundError, {
  behaviors: Behavior[]
}>

export class FetchCourseBehaviorsUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private behaviorsRepository: BehaviorsRepository
  ) {}

  async execute({ courseId }: FetchCourseBehaviorsUseCaseRequest): Promise<FetchCourseBehaviorsUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.')) 

    const behaviors = await this.behaviorsRepository.findManyByCourseId({
      courseId: course.id.toValue()
    })

    return right({
      behaviors
    })
  }
}