import { ChangeStudentStatusUseCase } from "@/domain/boletim/app/use-cases/change-student-status.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";

export function makeChangeStudentStatusUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const studentCoursesReposiory = new PrismaStudentsCoursesRepository()
  return new ChangeStudentStatusUseCase(
    studentsRepository,
    coursesRepository,
    studentCoursesReposiory
  )
}