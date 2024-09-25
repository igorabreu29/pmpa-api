import { left, right, type Either } from "@/core/either.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import type { Formula } from "../../enterprise/entities/course.ts";
import { InvalidDateError } from "@/core/errors/domain/invalid-date.ts";
import { EndsAt } from "../../enterprise/entities/value-objects/ends-at.ts";

interface UpdateCourseUseCaseRequest {
  id: string
  name?: string
  formula?: Formula
  startAt?: Date
  endsAt?: Date
}

type UpdateCourseUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidNameError
  | InvalidDateError, null>

export class UpdateCourseUseCase {
  constructor(
    private coursesRepository: CoursesRepository
  ) {}

  async execute({
    id,
    name,
    formula,
    startAt,
    endsAt
  }: UpdateCourseUseCaseRequest): Promise<UpdateCourseUseCaseResponse> {
    const course = await this.coursesRepository.findById(id)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const nameOrError = Name.create(name ?? course.name.value)
    if (nameOrError.isLeft()) return left(nameOrError.value)

    const endsAtOrError = EndsAt.create(endsAt ?? course.endsAt.value)
    if (endsAtOrError.isLeft()) return left(endsAtOrError.value)

    course.name = nameOrError.value
    course.startAt = startAt ?? course.startAt
    course.endsAt = endsAtOrError.value
    course.formula = formula ?? course.formula
    course.isPeriod = !['CAS', 'CHO', 'CFP', 'CGS'].includes(course.formula)

    await this.coursesRepository.save(course)

    return right(null)
  }
}