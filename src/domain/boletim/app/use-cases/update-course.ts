import { left, right, type Either } from "@/core/either.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import type { Formula } from "../../enterprise/entities/course.ts";

interface UpdateCourseUseCaseRequest {
  id: string
  name?: string
  formula?: Formula
}

type UpdateCourseUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidNameError, null>

export class UpdateCourseUseCase {
  constructor(
    private coursesRepository: CoursesRepository
  ) {}

  async execute({
    id,
    name,
    formula,
  }: UpdateCourseUseCaseRequest): Promise<UpdateCourseUseCaseResponse> {
    const course = await this.coursesRepository.findById(id)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const nameOrError = Name.create(name ?? course.name.value)
    if (nameOrError.isLeft()) return left(nameOrError.value)

    course.name = nameOrError.value
    course.formula = formula ?? course.formula
    course.isPeriod = !['CAS', 'CHO', 'CFP', 'CGS'].includes(course.formula)

    await this.coursesRepository.save(course)

    return right(null)
  }
}