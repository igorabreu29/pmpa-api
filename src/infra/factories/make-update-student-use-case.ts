import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { UpdateStudentUseCase } from "@/domain/boletim/app/use-cases/update-student.ts";

export function makeUpdateStudentUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const studentPolesRepository = new PrismaStudentsPolesRepository()

  return new UpdateStudentUseCase (
    studentsRepository,
    studentCoursesRepository,
    studentPolesRepository
  )
}