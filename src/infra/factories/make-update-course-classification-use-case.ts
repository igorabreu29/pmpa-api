import { PrismaClassificationsRepository } from "../database/repositories/prisma-classifications-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { UpdateCourseClassificationUseCase } from "@/domain/boletim/app/use-cases/update-course-classification.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts";

export function makeUpdateCourseClassificationUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase()
  const classificationsRepository = new PrismaClassificationsRepository()
  return new UpdateCourseClassificationUseCase(
    coursesRepository,
    getStudentAverageInTheCourseUseCase,
    classificationsRepository
  )
}