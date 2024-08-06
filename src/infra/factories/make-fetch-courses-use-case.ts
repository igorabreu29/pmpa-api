import { FetchCoursesUseCase } from "@/domain/boletim/app/use-cases/fetch-courses.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeFetchCoursesUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  return new FetchCoursesUseCase(
    coursesRepository
  )
}