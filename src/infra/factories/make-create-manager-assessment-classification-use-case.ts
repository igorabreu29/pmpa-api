import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { XLSXSheeter } from "../files/xlsx-sheeter.ts";
import { CreateManagerAssessmentClassificationSheetUseCase } from "@/domain/boletim/app/use-cases/create-manager-assessment-classification-sheet.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { makeGetManagerAssessmentClassificationUseCase } from "./make-get-manager-assessment-classification-use-case.ts";

export function makeCreateManagerAssessmentClassificationSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  const getManagerAssessmentClassification = makeGetManagerAssessmentClassificationUseCase()
  const sheeter = new XLSXSheeter()

  return new CreateManagerAssessmentClassificationSheetUseCase(
    coursesRepository,
    managerCoursesRepository,
    getManagerAssessmentClassification,
    sheeter
  )
}