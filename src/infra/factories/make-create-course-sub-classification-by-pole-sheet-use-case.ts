import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { XLSXSheeter } from "../files/xlsx-sheeter.ts";
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts";
import { CreateCourseSubClassificationByPoleSheetUseCase } from "@/domain/boletim/app/use-cases/create-course-sub-classification-by-pole-sheet.ts";
import { makeGetCourseSubClassificationByPoleUseCase } from "./make-get-course-sub-classification-by-pole-use-case.ts";

export function makeCreateCourseSubClassificationByPoleSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const polesRepository = new PrismaPolesRepository()
  const getCourseSubClassificationByPole = makeGetCourseSubClassificationByPoleUseCase()
  const sheeter = new XLSXSheeter()

  return new CreateCourseSubClassificationByPoleSheetUseCase(
    coursesRepository,
    polesRepository,
    getCourseSubClassificationByPole,
    sheeter
  )
}