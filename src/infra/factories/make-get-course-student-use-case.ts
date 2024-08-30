import { FetchCourseStudentsUseCase } from "@/domain/boletim/app/use-cases/fetch-course-students.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { GetCourseStudentUseCase } from "@/domain/boletim/app/use-cases/get-course-student.ts";

export function makeGetCourseStudentUseCase() {
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const coursesRepository = new PrismaCoursesRepository()
  return new GetCourseStudentUseCase(
    coursesRepository,
    studentCoursesRepository
  )
}