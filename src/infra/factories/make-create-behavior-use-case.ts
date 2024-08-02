import { CreateBehaviorUseCase } from "@/domain/boletim/app/use-cases/create-behavior.ts";
import { PrismaBehaviorsRepository } from "../database/repositories/prisma-behaviors-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";

export function makeCreateBehaviorUseCase() {
  const behaviorsRepository = new PrismaBehaviorsRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const studentsRepository = new PrismaStudentsRepository()
  return new CreateBehaviorUseCase(
    behaviorsRepository,
    coursesRepository,
    studentsRepository
  )  
}