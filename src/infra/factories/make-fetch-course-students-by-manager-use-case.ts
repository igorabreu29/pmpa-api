import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaManagersCoursesRepository } from "../database/repositories/prisma-managers-courses-repository.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";
import { FetchCourseStudentsByManagerUseCase } from "@/domain/boletim/app/use-cases/fetch-course-students-by-manager.ts";

export function makeFetchCourseStudentsByManagerUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const managerCoursesRepository = new PrismaManagersCoursesRepository()
  const studentPolesRepository = new PrismaStudentsPolesRepository()
  return new FetchCourseStudentsByManagerUseCase(
    coursesRepository,
    managerCoursesRepository,
    studentPolesRepository
  )
}