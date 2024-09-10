import { CreateCourseSummarySheetUseCase } from "@/domain/boletim/app/use-cases/create-course-summary-sheet.ts";
import { PrismaCourseDisciplinesRepository } from "../database/repositories/prisma-course-disciplines-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { XLSXSheeter } from "../sheet/xlsx-sheeter.ts";

export function makeCreateCourseSummarySheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const courseDisciplinesRepository = new PrismaCourseDisciplinesRepository()
  const sheeter = new XLSXSheeter()

  return new CreateCourseSummarySheetUseCase(
    coursesRepository,
    courseDisciplinesRepository,
    sheeter
  )
}