import { GenerateCourseClassificationUseCase } from "@/domain/boletim/app/use-cases/generate-course-classification.ts";
import { PrismaClassificationsRepository } from "../database/repositories/prisma-classifications-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts";

export function makeGenerateCourseClassificationUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const studentsCoursesRepository = new PrismaStudentsCoursesRepository()
  const getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase()
  const classificationsRepository = new PrismaClassificationsRepository()
  return new GenerateCourseClassificationUseCase(
    coursesRepository,
    studentsCoursesRepository,
    getStudentAverageInTheCourseUseCase,
    classificationsRepository
  )
}