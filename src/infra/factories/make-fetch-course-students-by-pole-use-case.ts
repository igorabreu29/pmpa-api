import { FetchCourseStudentsByPole } from "@/domain/boletim/app/use-cases/fetch-course-students-by-pole.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";

export function makeFetchCourseStudentsByPoleUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const polesRepository = new PrismaPolesRepository()
  const studentPolesRepository = new PrismaStudentsPolesRepository()
  return new FetchCourseStudentsByPole(
    coursesRepository,
    polesRepository,
    studentPolesRepository
  )
}