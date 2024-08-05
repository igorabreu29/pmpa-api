import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { GetLoginConfirmationMetricsByManager } from "@/domain/boletim/app/use-cases/get-login-confirmation-metrics-by-manager.ts";

export function makeFetchLoginConfirmationMetricsByManagerUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const managersCoursesRepository = new PrismaManagersCoursesRepository()
  const studentPolesRepository = new PrismaStudentsPolesRepository()
  return new GetLoginConfirmationMetricsByManager(
    coursesRepository,
    managersCoursesRepository,
    studentPolesRepository
  )
}