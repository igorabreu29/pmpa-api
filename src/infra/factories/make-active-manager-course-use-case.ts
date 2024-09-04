import { ActiveManagerCourseUseCase } from "@/domain/boletim/app/use-cases/active-manager-course.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeActiveManagerCourseUseCase() {
  const managersRepository = new PrismaManagersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  return new ActiveManagerCourseUseCase(
    managersRepository,
    coursesRepository,
    managerCoursesRepository
  )
}