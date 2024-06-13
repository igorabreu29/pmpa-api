import { Either, right } from "@/core/either.ts";
import { CoursesRepository } from "../repositories/courses-repository.ts";
import { Course } from "@/domain/enterprise/entities/course.ts";

type FetchCoursesUseCaseResponse = Either<null, {
  courses: Course[]
}>

export class FetchCoursesUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(): Promise<FetchCoursesUseCaseResponse> {
    const courses = await this.coursesRepository.fetchCourses()
    return right({ courses })
  }
}