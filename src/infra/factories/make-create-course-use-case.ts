import { CreateCourseUseCase } from "@/domain/boletim/app/use-cases/create-course.ts";
import { PrismaCourseDisciplinesRepository } from "../database/repositories/prisma-course-disciplines-repository.ts";
import { PrismaCoursePolesRepository } from "../database/repositories/prisma-course-poles-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeCreateCourseUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const coursePolesRepository = new PrismaCoursePolesRepository()
  const courseDisciplinesRepository = new PrismaCourseDisciplinesRepository()
  return new CreateCourseUseCase(
    coursesRepository,
    coursePolesRepository,
    courseDisciplinesRepository
  )
}