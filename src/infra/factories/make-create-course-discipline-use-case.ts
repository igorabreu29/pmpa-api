import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaCourseDisciplinesRepository } from "../database/repositories/prisma-course-disciplines-repository.ts";
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts";
import { CreateCourseDisciplineUseCase } from "@/domain/boletim/app/use-cases/create-course-discipline.ts";

export function makeCreateCourseDisciplineUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const disciplinesRepository = new PrismaDisciplinesRepository()
  const courseDisciplinesRepository = new PrismaCourseDisciplinesRepository()
  return new CreateCourseDisciplineUseCase(
    coursesRepository,
    disciplinesRepository,
    courseDisciplinesRepository
  )
}