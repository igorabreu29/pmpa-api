import { GetCourseClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-classification.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts";
import { GetCourseSubClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-sub-classification.ts";

export function makeGetCourseSubClassificationUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase()
  return new GetCourseSubClassificationUseCase(
    coursesRepository,
    studentCoursesRepository,
    getStudentAverageInTheCourseUseCase
  )
}