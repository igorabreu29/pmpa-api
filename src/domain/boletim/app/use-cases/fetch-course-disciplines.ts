import { Either, left, right } from "@/core/either.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import type { CoursesDisciplinesRepository } from "../repositories/courses-disciplines-repository.ts";
import type { CourseWithDiscipline } from "../../enterprise/entities/value-objects/course-with-discipline.ts";

interface FetchCourseDisciplinesUseCaseRequest {
  courseId: string,
}

type FetchCourseDisciplinesUseCaseResponse = Either<ResourceNotFoundError, {
  disciplines: CourseWithDiscipline[]
}>

export class FetchCourseDisciplinesUseCase {
  constructor (
    private coursesRepository: CoursesRepository,
    private courseDisciplinesRepository: CoursesDisciplinesRepository
  ) {}

  async execute({ courseId }: FetchCourseDisciplinesUseCaseRequest): Promise<FetchCourseDisciplinesUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) return left(new ResourceNotFoundError('Course not found.'))
    
    const disciplines = await this.courseDisciplinesRepository.findManyByCourseIdWithDiscipliine({ courseId: course.id.toValue() })
    return right({
      disciplines
    })
  }
}