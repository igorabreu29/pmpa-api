import { GetCourseUseCase } from "@/domain/boletim/app/use-cases/get-course.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";

export function makeGetCourseUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  return new GetCourseUseCase(coursesRepository)
}