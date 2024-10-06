import { FetchCourseDisciplinesUseCase } from "@/domain/boletim/app/use-cases/fetch-course-disciplines.ts";
import { PrismaCourseDisciplinesRepository } from "../database/repositories/prisma-course-disciplines-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaAssessmentsRepository } from "../database/repositories/prisma-assessments-repository.ts";
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts";
import { FetchCourseAssessmentsUseCase } from "@/domain/boletim/app/use-cases/fetch-course-assessments.ts";

export function makeFetchCourseAssessmentsUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const disciplinesRepository = new PrismaDisciplinesRepository()
  const courseDisciplinesRepository = new PrismaCourseDisciplinesRepository()
  const assessmentsRepository = new PrismaAssessmentsRepository()
    
  return new FetchCourseAssessmentsUseCase(
    coursesRepository,
    disciplinesRepository,
    courseDisciplinesRepository,
    assessmentsRepository
  )
}