import { DeleteStudentCourseUseCase } from "@/domain/boletim/app/use-cases/delete-student-course.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";

export function makeDeleteStudentCourseUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const studentsRepository = new PrismaStudentsRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  return new DeleteStudentCourseUseCase(
    coursesRepository,
    studentsRepository,
    studentCoursesRepository
  )
}