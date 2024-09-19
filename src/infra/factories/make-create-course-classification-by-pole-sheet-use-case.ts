import { CreateCourseClassificationSheetUseCase } from "@/domain/boletim/app/use-cases/create-course-classification-sheet.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { XLSXSheeter } from "../files/xlsx-sheeter.ts";
import { makeGetCourseClassificationUseCase } from "./make-get-course-classification-use-case.ts";
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { makeGetCourseClassificationByPoleUseCase } from "./make-get-course-classification-by-pole-use-case.ts";
import { CreateCourseClassificationByPoleSheetUseCase } from "@/domain/boletim/app/use-cases/create-course-classification-by-pole-sheet.ts";

export function makeCreateCourseClassificationByPoleSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const polesRepository = new PrismaPolesRepository()
  const studentPolesRepository = new PrismaStudentsPolesRepository()
  const getCourseClassificationByPole = makeGetCourseClassificationByPoleUseCase()
  const sheeter = new XLSXSheeter()

  return new CreateCourseClassificationByPoleSheetUseCase(
    coursesRepository,
    polesRepository,
    studentPolesRepository,
    getCourseClassificationByPole,
    sheeter
  )
}