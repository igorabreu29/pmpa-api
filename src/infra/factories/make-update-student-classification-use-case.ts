import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts";
import { PrismaClassificationsRepository } from "../database/repositories/prisma-classifications-repository.ts";
import { UpdateStudentClassificationUseCase } from "@/domain/boletim/app/use-cases/update-student-classification.ts";

export function makeUpdateStudentClassificationUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase()
  const classificationsRepository = new PrismaClassificationsRepository()

  return new UpdateStudentClassificationUseCase(
    coursesRepository,
    getStudentAverageInTheCourseUseCase,
    classificationsRepository
  )
}