import { CreateCoursePoleUseCase } from "@/domain/boletim/app/use-cases/create-course-pole.ts";
import { PrismaCoursePolesRepository } from "../database/repositories/prisma-course-poles-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts";

export function makeCreateCoursePoleUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const polesRepository = new PrismaPolesRepository()
  const coursePolesRepository = new PrismaCoursePolesRepository()
  return new CreateCoursePoleUseCase(
    coursesRepository,
    polesRepository,
    coursePolesRepository
  )
}