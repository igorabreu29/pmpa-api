import { left, right, type Either } from "@/core/either.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

interface DeleteCourseUseCaseRequest {
  id: string
}

type DeleteCourseUseCaseResponse = Either<ResourceNotFoundError, null>

export class DeleteCourseUseCase {
  constructor(
    private coursesRepository: CoursesRepository
  ) {}

  async execute({
    id,
  }: DeleteCourseUseCaseRequest): Promise<DeleteCourseUseCaseResponse> {
    const course = await this.coursesRepository.findById(id)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    await this.coursesRepository.delete(course)

    return right(null)
  }
}