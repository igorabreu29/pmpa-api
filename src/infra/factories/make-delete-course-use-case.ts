import { DeleteCourseUseCase } from "@/domain/boletim/app/use-cases/delete-course.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeDeleteCourseUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  return new DeleteCourseUseCase(coursesRepository)
}