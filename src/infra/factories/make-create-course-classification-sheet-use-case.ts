import { CreateCourseClassificationSheetUseCase } from "@/domain/boletim/app/use-cases/create-course-classification-sheet.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { XLSXSheeter } from "../sheet/xlsx-sheeter.ts";
import { makeGetCourseClassificationUseCase } from "./make-get-course-classification-use-case.ts";

export function makeCreateCourseClassificationSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const getCourseClassification = makeGetCourseClassificationUseCase()
  const sheeter = new XLSXSheeter()

  return new CreateCourseClassificationSheetUseCase(
    coursesRepository,
    studentCoursesRepository,
    getCourseClassification,
    sheeter
  )
}