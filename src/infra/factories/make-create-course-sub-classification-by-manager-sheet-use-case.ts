import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { XLSXSheeter } from "../files/xlsx-sheeter.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { makeGetCourseSubClassificationByPoleUseCase } from "./make-get-course-sub-classification-by-pole-use-case.ts";
import { CreateCourseSubClassificationByManagerSheetUseCase } from "@/domain/boletim/app/use-cases/create-course-sub-classification-by-manager-sheet.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";

export function makeCreateCourseSubClassificationByManagerSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  const studentPolesRepository = new PrismaStudentsPolesRepository()
  const getCourseSubClassificationByPole = makeGetCourseSubClassificationByPoleUseCase()
  const sheeter = new XLSXSheeter()

  return new CreateCourseSubClassificationByManagerSheetUseCase(
    coursesRepository,
    managerCoursesRepository,
    studentPolesRepository,
    getCourseSubClassificationByPole,
    sheeter
  )
}