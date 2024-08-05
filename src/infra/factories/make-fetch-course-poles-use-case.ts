import { FetchCoursePolesUseCase } from "@/domain/boletim/app/use-cases/fetch-course-poles.ts";
import { PrismaCoursePolesRepository } from "../database/repositories/prisma-course-poles-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeFetchCoursePolesUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const coursePolesRepository = new PrismaCoursePolesRepository()
  return new FetchCoursePolesUseCase(
    coursesRepository,
    coursePolesRepository
  )
}