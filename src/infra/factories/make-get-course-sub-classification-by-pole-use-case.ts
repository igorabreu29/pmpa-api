import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts";
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { GetCourseClassificationByPoleUseCase } from "@/domain/boletim/app/use-cases/get-course-classification-by-pole.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { GetCourseSubClassificationByPoleUseCase } from "@/domain/boletim/app/use-cases/get-course-sub-classification-by-pole.ts";

export function makeGetCourseSubClassificationByPoleUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const polesRepository = new PrismaPolesRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  const studentPolesRepository = new PrismaStudentsPolesRepository()
  const getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase()
  return new GetCourseSubClassificationByPoleUseCase(
    coursesRepository,
    polesRepository,
    managerCoursesRepository,
    studentPolesRepository,
    getStudentAverageInTheCourseUseCase
  )
}