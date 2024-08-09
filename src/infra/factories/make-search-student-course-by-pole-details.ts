import { SearchStudentCourseDetailsUseCase } from "@/domain/boletim/app/use-cases/search-student-course-details.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts";
import { SearchStudentCourseByPoleDetailsUseCase } from "@/domain/boletim/app/use-cases/search-student-course-by-pole-details.ts";

export function makeSearchStudentCourseByPoleDetailsUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const polesRepository = new PrismaPolesRepository()
  const studentPolesRepository = new PrismaStudentsPolesRepository()
  return new SearchStudentCourseByPoleDetailsUseCase(
    coursesRepository,
    polesRepository,
    studentPolesRepository
  )
}