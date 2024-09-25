import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Course } from "../../enterprise/entities/course.ts";

interface GetCourseUseCaseRequest {
  id: string
}

type GetCourseUseCaseResponse = Either<ResourceNotFoundError, {
  course: Course
}>

export class GetCourseUseCase {
  constructor(
    private coursesRepository: CoursesRepository
  ) {}

  async execute({ id }: GetCourseUseCaseRequest): Promise<GetCourseUseCaseResponse> {
    const course = await this.coursesRepository.findById(id)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    return right({
      course
    })
  }
}