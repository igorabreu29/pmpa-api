import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { XLSXSheeter } from "../sheet/xlsx-sheeter.ts";
import { CreateCourseAssessmentClassificationSheetUseCase } from "@/domain/boletim/app/use-cases/create-course-assessment-classification-sheet.ts";
import { makeGetCourseAssessmentClassificationUseCase } from "./make-get-course-assessment-classification-use-case.ts";

export function makeCreateCourseAssessmentClassificationSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const getCourseAssessmentClassification = makeGetCourseAssessmentClassificationUseCase()
  const sheeter = new XLSXSheeter()

  return new CreateCourseAssessmentClassificationSheetUseCase(
    coursesRepository,
    getCourseAssessmentClassification,
    sheeter
  )
}