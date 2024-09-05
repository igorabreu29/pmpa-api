import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { GetCourseManagerUseCase } from "@/domain/boletim/app/use-cases/get-course-manager.ts";

export function makeGetCourseManagerUseCase() {
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  const coursesRepository = new PrismaCoursesRepository()
  return new GetCourseManagerUseCase(
    coursesRepository,
    managerCoursesRepository
  )
}