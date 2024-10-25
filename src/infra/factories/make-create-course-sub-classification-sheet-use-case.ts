import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { XLSXSheeter } from "../files/xlsx-sheeter.ts";
import { CreateCourseSubClassificationSheetUseCase } from "@/domain/boletim/app/use-cases/create-course-sub-classification-sheet.ts";
import { makeGetCourseSubClassificationUseCase } from "./make-get-course-sub-classification-use-case.ts";

export function makeCreateCourseSubClassificationSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const getCourseSubClassification = makeGetCourseSubClassificationUseCase()
  const sheeter = new XLSXSheeter()

  return new CreateCourseSubClassificationSheetUseCase(
    coursesRepository,
    getCourseSubClassification,
    sheeter
  )
}