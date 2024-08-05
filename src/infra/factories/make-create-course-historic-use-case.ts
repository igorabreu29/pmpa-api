import { PrismaCourseHistoricsRepository } from "../database/repositories/prisma-course-historics-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { CreateCourseHistoricUseCase } from "@/domain/boletim/app/use-cases/create-course-historic.ts";

export function makeCreateCourseHistoricUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const courseHistoricRepository = new PrismaCourseHistoricsRepository()
  return new CreateCourseHistoricUseCase(
    coursesRepository,
    courseHistoricRepository
  )
}