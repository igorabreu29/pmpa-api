import { FetchCourseDisciplinesUseCase } from "@/domain/boletim/app/use-cases/fetch-course-disciplines.ts";
import { PrismaCourseDisciplinesRepository } from "../database/repositories/prisma-course-disciplines-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeFetchCourseDisciplinesUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const coursedisciplinesRepository = new PrismaCourseDisciplinesRepository()
  return new FetchCourseDisciplinesUseCase(
    coursesRepository,
    coursedisciplinesRepository
  )
}