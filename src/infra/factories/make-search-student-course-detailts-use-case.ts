import { SearchStudentCourseDetailsUseCase } from "@/domain/boletim/app/use-cases/search-student-course-details.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";

export function makeSearchStudentCourseDetailsUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  return new SearchStudentCourseDetailsUseCase(
    coursesRepository,
    studentCoursesRepository
  )
}