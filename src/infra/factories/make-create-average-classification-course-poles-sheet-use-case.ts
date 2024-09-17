import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { XLSXSheeter } from "../sheet/xlsx-sheeter.ts";
import { makeGetAverageClassificationCoursePolesUseCase } from "./make-get-average-classification-course-poles-use-case.ts";
import { CreateAverageClassificationCoursePolesSheetUseCase } from "@/domain/boletim/app/use-cases/create-average-classification-course-poles-sheet.ts";

export function makeCreateAverageClassificationCoursePolesSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const getAverageClassificationCoursePolesSheet = makeGetAverageClassificationCoursePolesUseCase()
  const sheeter = new XLSXSheeter()

  return new CreateAverageClassificationCoursePolesSheetUseCase(
    coursesRepository,
    getAverageClassificationCoursePolesSheet,
    sheeter
  )
}