import { FetchCourseBehaviorsUseCase } from "@/domain/boletim/app/use-cases/fetch-course-behaviors.ts";
import { PrismaBehaviorsRepository } from "../database/repositories/prisma-behaviors-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeFetchCourseBehaviorsUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const behaviorsRepository = new PrismaBehaviorsRepository()
  return new FetchCourseBehaviorsUseCase(
    coursesRepository,
    behaviorsRepository
  )
}