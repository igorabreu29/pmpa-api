import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts";
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { GetCourseClassificationByPoleUseCase } from "@/domain/boletim/app/use-cases/get-course-classification-by-pole.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { PrismaClassificationsRepository } from "../database/repositories/prisma-classifications-repository.ts";

export function makeGetCourseClassificationByPoleUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const polesRepository = new PrismaPolesRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const classificationsRepository = new PrismaClassificationsRepository()
  return new GetCourseClassificationByPoleUseCase(
    coursesRepository,
    polesRepository,
    managerCoursesRepository,
    studentCoursesRepository,
    classificationsRepository
  )
}