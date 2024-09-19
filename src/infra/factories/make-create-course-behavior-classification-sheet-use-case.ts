import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { XLSXSheeter } from "../files/xlsx-sheeter.ts";
import { CreateCourseBehaviorClassificationSheetUseCase } from "@/domain/boletim/app/use-cases/create-course-behavior-classification-sheet.ts";
import { makeGetCourseBehaviorClassificationUseCase } from "./make-get-course-behavior-classification-use-case.ts";

export function makeCreateCourseBehaviorClassificationSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const getCourseBehaviorClassification = makeGetCourseBehaviorClassificationUseCase()
  const sheeter = new XLSXSheeter()

  return new CreateCourseBehaviorClassificationSheetUseCase(
    coursesRepository,
    getCourseBehaviorClassification,
    sheeter
  )
}