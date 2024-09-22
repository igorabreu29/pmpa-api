import { ValidateHistoricUseCase } from "@/domain/boletim/app/use-cases/validate-historic.ts";
import { BcryptHasher } from "../cryptography/bcrypt-hasher.ts";
import { PrismaCourseHistoricsRepository } from "../database/repositories/prisma-course-historics-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeValidateCourseHistoricUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const courseHistoricsRepository = new PrismaCourseHistoricsRepository()
  const hasher = new BcryptHasher()

  return new ValidateHistoricUseCase(
    coursesRepository,
    courseHistoricsRepository,
    hasher
  )
}