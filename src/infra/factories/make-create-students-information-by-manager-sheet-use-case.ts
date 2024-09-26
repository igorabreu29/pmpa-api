import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { XLSXSheeter } from "../files/xlsx-sheeter.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { CreateStudentsInformationByManagerSheetUseCase } from "@/domain/boletim/app/use-cases/create-students-information-by-manager-sheet.ts";

export function makeCreateStudentsInformationByManagerSheetUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  const studentPolesRepository = new PrismaStudentsPolesRepository()
  const sheeter = new XLSXSheeter()
  
  return new CreateStudentsInformationByManagerSheetUseCase(
    coursesRepository,
    managerCoursesRepository,
    studentPolesRepository,
    sheeter
  )
}