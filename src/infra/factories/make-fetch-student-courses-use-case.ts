import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { FetchStudentCoursesUseCase } from "@/domain/boletim/app/use-cases/fetch-student-courses.ts";

export function makeFetchStudentCoursesUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  return new FetchStudentCoursesUseCase(
    studentsRepository,
    studentCoursesRepository,
  )
}