import { Either, left, right } from "@/core/either.ts"
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts"
import { CoursesRepository } from "../repositories/courses-repository.ts"
import { Course, Formule } from "@/domain/boletim/enterprise/entities/course.ts"

interface CreateCourseUseCaseRequest {
  formule: Formule
  name: string
  imageUrl: string
  modules?: number
  periods?: number,
  endsAt: Date
}

type CreateCourseUseCaseResponse = Either<ResourceAlreadyExistError, null>

export class CreateCourseUseCase {
  constructor (
    private coursesRepository: CoursesRepository
  ) {}

  async execute({ formule, name, imageUrl, modules, periods, endsAt }: CreateCourseUseCaseRequest): Promise<CreateCourseUseCaseResponse> {
    const courseAlreadyExist = await this.coursesRepository.findByName(name)
    if (courseAlreadyExist) return left(new ResourceAlreadyExistError('Course already present on the platform.'))

    const course = Course.create({
      formule, 
      name, 
      imageUrl, 
      active: "enabled", 
      modules: modules ?? null, 
      periods: periods ?? null,
      endsAt,
    })
    await this.coursesRepository.create(course)

    return right(null)
  }
}