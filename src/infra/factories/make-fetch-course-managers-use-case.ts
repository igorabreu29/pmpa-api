import { FetchCourseManagersUseCase } from "@/domain/boletim/app/use-cases/fetch-course-managers.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";

export function makeFetchCourseManagersUseCase() {
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  const coursesRepository = new PrismaCoursesRepository()
  return new FetchCourseManagersUseCase(
    managerCoursesRepository,
    coursesRepository
  )
}