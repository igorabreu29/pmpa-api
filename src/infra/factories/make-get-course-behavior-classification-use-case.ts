import { GetCourseClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-classification.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsCoursesRepository } from "../database/repositories/prisma-students-courses-repository.ts";
import { GetCourseBehaviorClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-behavior-classification.ts";
import { PrismaCoursePolesRepository } from "../database/repositories/prisma-course-poles-repository.ts";
import { PrismaBehaviorsRepository } from "../database/repositories/prisma-behaviors-repository.ts";

export function makeGetCourseBehaviorClassificationUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const coursePolesRepository = new PrismaCoursePolesRepository()
  const studentCoursesRepository = new PrismaStudentsCoursesRepository()
  const behaviorsRepository = new PrismaBehaviorsRepository()
  return new GetCourseBehaviorClassificationUseCase(
    coursesRepository,
    coursePolesRepository,
    studentCoursesRepository,
    behaviorsRepository
  )
}