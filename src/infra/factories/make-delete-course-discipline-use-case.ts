import { DeleteCourseDisciplineUseCase } from "@/domain/boletim/app/use-cases/delete-course-discipline.ts"
import { PrismaCourseDisciplinesRepository } from "../database/repositories/prisma-course-disciplines-repository.ts"
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts"
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts"

export function makeDeleteCourseDisciplineUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const disciplinesRepository = new PrismaDisciplinesRepository()
  const courseDisciplinesRepository = new PrismaCourseDisciplinesRepository()
  return new DeleteCourseDisciplineUseCase(
    coursesRepository,
    disciplinesRepository,
    courseDisciplinesRepository
  )
}