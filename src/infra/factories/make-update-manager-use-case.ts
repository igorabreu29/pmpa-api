import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { PrismaManagersPolesRepository } from "../database/repositories/prisma-managers-poles-repository.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { UpdateManagerUseCase } from "@/domain/boletim/app/use-cases/update-manager.ts";

export function makeUpdateManagerUseCase() {
  const managersRepository = new PrismaManagersRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  const managerPolesRepository = new PrismaManagersPolesRepository()

  return new UpdateManagerUseCase (
    managersRepository,
    managerCoursesRepository,
    managerPolesRepository
  )
}