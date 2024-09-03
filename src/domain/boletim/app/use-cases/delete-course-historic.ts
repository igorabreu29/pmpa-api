import { left, right, type Either } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { CourseHistoricRepository } from "../repositories/course-historic-repository.ts";

interface DeleteCourseHistoricUseCaseRequest {
  courseId: string
}

type DeleteCourseHistoricUseCaseResponse = Either<ResourceNotFoundError, null>

export class DeleteCourseHistoricUseCase {
  constructor(
    private coursehistoricsRepository: CourseHistoricRepository
  ) {}

  async execute({
    courseId,
  }: DeleteCourseHistoricUseCaseRequest): Promise<DeleteCourseHistoricUseCaseResponse> {
    const coursehistoric = await this.coursehistoricsRepository.findByCourseId(courseId)
    if (!coursehistoric) return left(new ResourceNotFoundError('Course historic not found.'))

    await this.coursehistoricsRepository.delete(coursehistoric)

    return right(null)
  }
}