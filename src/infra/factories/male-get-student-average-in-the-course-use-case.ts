import { GetStudentAverageInTheCourseUseCase } from "@/domain/boletim/app/use-cases/get-student-average-in-the-course.ts";
import { PrismaAssessmentsRepository } from "../database/repositories/prisma-assessments-repository.ts";
import { PrismaBehaviorsRepository } from "../database/repositories/prisma-behaviors-repository.ts";
import { PrismaCourseDisciplinesRepository } from "../database/repositories/prisma-course-disciplines-repository.ts";

export function makeGetStudentAverageInTheCourseUseCase() {
  const assessmentsRepository = new PrismaAssessmentsRepository()
  const behaviorsRepository = new PrismaBehaviorsRepository()
  const courseDisciplinesRepository = new PrismaCourseDisciplinesRepository()
  return new GetStudentAverageInTheCourseUseCase(
    assessmentsRepository,
    behaviorsRepository,
    courseDisciplinesRepository
  )
}