import { DeleteCoursePoleUseCase } from "@/domain/boletim/app/use-cases/delete-course-pole.ts"
import { PrismaCoursePolesRepository } from "../database/repositories/prisma-course-poles-repository.ts"
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts"
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts"

export function makeDeleteCoursePoleUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const polesRepository = new PrismaPolesRepository()
  const coursePolesRepository = new PrismaCoursePolesRepository()
  return new DeleteCoursePoleUseCase(
    coursesRepository,
    polesRepository,
    coursePolesRepository
  )
}