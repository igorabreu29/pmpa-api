import { UpdateCourseUseCase } from "@/domain/boletim/app/use-cases/update-course.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeUpdateCourseUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  return new UpdateCourseUseCase(coursesRepository)
}