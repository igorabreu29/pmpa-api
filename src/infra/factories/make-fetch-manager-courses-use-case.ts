import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { FetchManagerCoursesUseCase } from "@/domain/boletim/app/use-cases/fetch-manager-courses.ts";

export function makeFetchManagerCoursesUseCase() {
  const managersRepository = new PrismaManagersRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  return new FetchManagerCoursesUseCase(
    managersRepository,
    managerCoursesRepository,
  )
}