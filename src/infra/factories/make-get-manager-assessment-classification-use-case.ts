import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { GetManagerAssessmentClassificationUseCase } from "@/domain/boletim/app/use-cases/get-manager-assessment-classification.ts";

export function makeGetManagerAssessmentClassificationUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase()
  return new GetManagerAssessmentClassificationUseCase(
    coursesRepository,
    managerCoursesRepository,
    studentCoursesRepository,
    getStudentAverageInTheCourseUseCase
  )
}