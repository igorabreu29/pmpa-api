import { DisableStudentCourseUseCase } from "@/domain/boletim/app/use-cases/disable-student-course.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeDisableStudentCourseUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  return new DisableStudentCourseUseCase(
    studentsRepository,
    coursesRepository,
    studentCoursesRepository
  )
}