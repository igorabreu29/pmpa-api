import { GetCourseClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-classification.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts";
import { PrismaClassificationsRepository } from "../database/repositories/prisma-classifications-repository.ts";

export function makeGetCourseClassificationUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const classificationsRepository = new PrismaClassificationsRepository()
  const getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase()
  return new GetCourseClassificationUseCase(
    coursesRepository,
    studentCoursesRepository,
    classificationsRepository,
    getStudentAverageInTheCourseUseCase
  )
}