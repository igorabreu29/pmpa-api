import { ActiveStudentCourseUseCase } from "@/domain/boletim/app/use-cases/active-student-course.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeActiveStudentCourseUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  return new ActiveStudentCourseUseCase(
    studentsRepository,
    coursesRepository,
    studentCoursesRepository
  )
}