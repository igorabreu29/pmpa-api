import { DisableManagerCourseUseCase } from "@/domain/boletim/app/use-cases/disable-manager-course.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeDisableManagerCourseUseCase() {
  const managersRepository = new PrismaManagersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  return new DisableManagerCourseUseCase(
    managersRepository,
    coursesRepository,
    managerCoursesRepository
  )
}