import { left, right, type Either } from "@/core/either.ts";
import type { CourseHistoricRepository } from "../repositories/course-historic-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { Hasher } from "../cryptography/hasher.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";
import { ConflictError } from "./errors/conflict-error.ts";

interface ValidateHistoricUseCaseRequest {
  id: string
  hash: string
}

type ValidateHistoricUseCaseResponse = Either<ResourceNotFoundError, {
  message: string
}>

export class ValidateHistoricUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private courseHistoricsRepository: CourseHistoricRepository,
    private hasher: Hasher
  ) {}

  async execute({ id, hash }: ValidateHistoricUseCaseRequest): Promise<ValidateHistoricUseCaseResponse> {
    const courseHistoric = await this.courseHistoricsRepository.findById(id)
    if (!courseHistoric) return left(new ResourceNotFoundError('Course historic not found.'))

    const course = await this.coursesRepository.findById(courseHistoric.courseId.toValue())
    if (!course) return left(new ResourceNotFoundError('Course not found.'))

    const plainText = `${course.name.value} - PMPA`
    const isValid = await this.hasher.compare(plainText, hash)

    if (!isValid) return left(new ConflictError('Invalid text.'))

    return right({
      message: 'Course historic is valid.'
    })
  }
}