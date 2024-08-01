import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { CreateManagerUseCase } from "@/domain/boletim/app/use-cases/create-manager.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { PrismaManagersPolesRepository } from "../database/repositories/prisma-managers-poles-repository.ts";

export function makeCreateManagerUseCase() {
  const managersRepository = new PrismaManagersRepository()
  const managersCoursesRepository = new PrismaManagersCoursesRepository()
  const managersPolesRepository = new PrismaManagersPolesRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const polesRepository = new PrismaPolesRepository() 

  return new CreateManagerUseCase (
    managersRepository,
    managersCoursesRepository,
    managersPolesRepository,
    coursesRepository,
    polesRepository
  )
}