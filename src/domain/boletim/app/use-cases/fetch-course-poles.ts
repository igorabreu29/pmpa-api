import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Pole } from "../../enterprise/entities/pole.ts";
import { CoursesPoleRepository } from "../repositories/courses-poles-repository.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";

interface FetchCoursePolesUseCaseRequest {
  courseId: string
}

type FetchCoursePolesUseCaseResponse = Either<ResourceNotFoundError, {
  poles: Pole[]
}>

export class FetchCoursePolesUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private coursePolesRepository: CoursesPoleRepository
  ) {}

  async execute({ courseId }: FetchCoursePolesUseCaseRequest): Promise<FetchCoursePolesUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Curso não existente.'))
    
    const poles = await this.coursePolesRepository.findManyByCourseId({ courseId: course.id.toValue() })
    return right({
      poles
    })
  }
}