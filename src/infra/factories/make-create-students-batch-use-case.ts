import { CreateStudentsBatchUseCase } from "@/domain/boletim/app/use-cases/create-students-batch.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts";
import { PrismaStudentsBatchRepository } from "../database/repositories/prisma-students-batch-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";

export function makeCreateStudentsBatchUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const studentsCoursesRepository = new PrismaStudentsCoursesRepository()
  const polesRepository = new PrismaPolesRepository()
  const studentsPolesRepository = new PrismaStudentsPolesRepository()
  const studentsBatchRepository = new PrismaStudentsBatchRepository()

  return new CreateStudentsBatchUseCase(
    studentsRepository,
    coursesRepository,
    studentsCoursesRepository,
    polesRepository,
    studentsPolesRepository,
    studentsBatchRepository
  )
}