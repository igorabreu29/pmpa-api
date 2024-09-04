import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { GetCourseAssessmentClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-assessment-classification.ts";
import { PrismaCoursePolesRepository } from "../database/repositories/prisma-course-poles-repository.ts";
import { PrismaAssessmentsRepository } from "../database/repositories/prisma-assessments-repository.ts";

export function makeGetCourseAssessmentClassificationUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const coursePolesRepository = new PrismaCoursePolesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const assessmentsRepository = new PrismaAssessmentsRepository()
  return new GetCourseAssessmentClassificationUseCase(
    coursesRepository,
    coursePolesRepository,
    studentCoursesRepository,
    assessmentsRepository
  )
}