import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { XLSXSheeter } from "../sheet/xlsx-sheeter.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { makeGetCourseClassificationByPoleUseCase } from "./make-get-course-classification-by-pole-use-case.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { CreateCourseClassificationByManagerSheetUseCase } from "@/domain/boletim/app/use-cases/create-course-classification-by-manager-sheet.ts";

export function makeCreateCourseClassificationByManagerSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  const studentPolesRepository = new PrismaStudentsPolesRepository()
  const getCourseClassificationByPole = makeGetCourseClassificationByPoleUseCase()
  const sheeter = new XLSXSheeter()

  return new CreateCourseClassificationByManagerSheetUseCase(
    coursesRepository,
    managerCoursesRepository,
    studentPolesRepository,
    getCourseClassificationByPole,
    sheeter
  )
}