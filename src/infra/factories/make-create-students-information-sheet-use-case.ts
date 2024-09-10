import { GetStudentsInformationSheetUseCase } from "@/domain/boletim/app/use-cases/get-students-information-sheet.ts";
import { PrismaAssessmentsRepository } from "../database/repositories/prisma-assessments-repository.ts";
import { PrismaCourseDisciplinesRepository } from "../database/repositories/prisma-course-disciplines-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { XLSXSheeter } from "../sheet/xlsx-sheeter.ts";

export function makeGetStudentsInformationSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const courseDisciplinesRepository = new PrismaCourseDisciplinesRepository()
  const assessmentsRepository = new PrismaAssessmentsRepository()
  const sheeter = new XLSXSheeter()
  
  return new GetStudentsInformationSheetUseCase(
    coursesRepository,
    studentCoursesRepository,
    courseDisciplinesRepository,
    assessmentsRepository,
    sheeter
  )
}