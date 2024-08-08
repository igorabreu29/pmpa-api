import { ChangeManagerStatusUseCase } from "@/domain/boletim/app/use-cases/change-manager-status.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";

export function makeChangeManagerStatusUseCase() {
  const managersRepository = new PrismaManagersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const managerCoursesReposiory = new PrismaManagersCoursesRepository()
  return new ChangeManagerStatusUseCase(
    managersRepository,
    coursesRepository,
    managerCoursesReposiory
  )
}