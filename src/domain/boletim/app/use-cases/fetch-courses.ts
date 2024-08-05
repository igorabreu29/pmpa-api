import { right, type Either } from "@/core/either.ts";
import type { Course } from "../../enterprise/entities/course.ts";
import type { CoursesRepository } from "../repositories/courses-repository.ts";

interface FetchCoursesUseCaseRequest {
  page: number
}

type FetchCoursesUseCaseResponse = Either<null, {
  courses: Course[],
  pages: number
  totalItems: number
}>
 
export class FetchCoursesUseCase {
  constructor(
    private coursesRepository: CoursesRepository
  ) {}

  async execute({ page }: FetchCoursesUseCaseRequest): Promise<FetchCoursesUseCaseResponse> {
    const { courses, pages, totalItems } = await this.coursesRepository.findMany(page)

    return right({
      courses,
      pages,
      totalItems
    })
  }
}