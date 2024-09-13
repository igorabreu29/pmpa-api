import { GetAverageClassificationCoursePolesUseCase } from "@/domain/boletim/app/use-cases/get-average-classification-course-poles.ts"
import { PrismaCoursePolesRepository } from "../database/repositories/prisma-course-poles-repository.ts"
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts"
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts"
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts"

export function makeGetAverageClassificationCoursePolesUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const coursePolesRepository = new PrismaCoursePolesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase()
  return new GetAverageClassificationCoursePolesUseCase(
    coursesRepository,
    coursePolesRepository,
    studentCoursesRepository,
    getStudentAverageInTheCourseUseCase
  )
}