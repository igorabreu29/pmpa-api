import { FetchLoginConfirmationMetrics } from "@/domain/boletim/app/use-cases/fetch-login-confirmation-metrics.ts";
import { PrismaCoursePolesRepository } from "../database/repositories/prisma-course-poles-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";

export function makeFetchLoginConfirmationMetricsUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const coursesPolesRepository = new PrismaCoursePolesRepository()
  const studentsCoursesRepository = new PrismaStudentsCoursesRepository()
  return new FetchLoginConfirmationMetrics(
    coursesRepository,
    coursesPolesRepository,
    studentsCoursesRepository
  )
}