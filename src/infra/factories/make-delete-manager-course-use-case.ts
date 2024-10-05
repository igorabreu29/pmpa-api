import { DeleteManagerCourseUseCase } from "@/domain/boletim/app/use-cases/delete-manager-course.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";

export function makeDeleteManagerCourseUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const managersRepository = new PrismaManagersRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  return new DeleteManagerCourseUseCase(
    coursesRepository,
    managersRepository,
    managerCoursesRepository
  )
}