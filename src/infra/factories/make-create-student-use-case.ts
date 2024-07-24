import { CreateStudentUseCase } from "@/domain/boletim/app/use-cases/create-student.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";

export function makeCreateStudentUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  const studentsCoursesRepository = new PrismaStudentsCoursesRepository()
  const studentsPolesRepository = new PrismaStudentsPolesRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const polesRepository = new PrismaPolesRepository() 

  return new CreateStudentUseCase(
    studentsRepository,
    studentsCoursesRepository,
    studentsPolesRepository,
    coursesRepository,
    polesRepository
  )
}