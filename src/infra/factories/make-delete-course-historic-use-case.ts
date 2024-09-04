import { DeleteCourseHistoricUseCase } from "@/domain/boletim/app/use-cases/delete-course-historic.ts"
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts"
import { PrismaCourseHistoricsRepository } from "../database/repositories/prisma-course-historics-repository.ts"

export function makeDeleteCourseHistoricUseCase() {
  const courseHistoricRepository = new PrismaCourseHistoricsRepository()
  return new DeleteCourseHistoricUseCase (
    courseHistoricRepository
  )
}