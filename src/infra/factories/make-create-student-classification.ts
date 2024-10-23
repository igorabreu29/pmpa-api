import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts";
import { PrismaClassificationsRepository } from "../database/repositories/prisma-classifications-repository.ts";
import { CreateStudentClassificationUseCase } from "@/domain/boletim/app/use-cases/create-student-classification.ts";

export function makeCreateStudentClassificationUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase()
  const classificationsRepository = new PrismaClassificationsRepository()

  return new CreateStudentClassificationUseCase(
    coursesRepository,
    studentCoursesRepository,
    getStudentAverageInTheCourseUseCase,
    classificationsRepository
  )
}