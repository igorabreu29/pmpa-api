import { Either, left, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { PolesRepository } from "../repositories/poles-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { CoursesPoleRepository } from "../repositories/courses-poles-repository.ts";

interface DeleteCoursePoleUseCaseRequest {
  courseId: string
  poleId: string
}

type DeleteCoursePoleUseCaseResponse = Either<ResourceNotFoundError, null>

export class DeleteCoursePoleUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private polesRepository: PolesRepository,
    private coursesPolesRepository: CoursesPoleRepository
  ) {}

  async execute({
    courseId,
    poleId,
  }: DeleteCoursePoleUseCaseRequest): Promise<DeleteCoursePoleUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))

    const pole = await this.polesRepository.findById(poleId)
    if (!pole) return left(new ResourceNotFoundError('Pólo não encontrado!'))

    const coursePole = await this.coursesPolesRepository.findByCourseIdAndPoleId({ courseId, poleId })
    if (!coursePole) return left(new ResourceNotFoundError('Pólo do curso não encontrado!'))

    await this.coursesPolesRepository.delete(coursePole)

    return right(null)
  }
}