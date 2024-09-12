import { PrismaBehaviorsRepository } from "../database/repositories/prisma-behaviors-repository.ts"
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts"
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts"
import { PrismaBehaviorsBatchRepository } from "../database/repositories/prisma-behaviors-batch-repository.ts"
import { RemoveBehaviorsGradeBatchUseCase } from "@/domain/boletim/app/use-cases/remove-behaviors-grade-batch.ts"

export function makeRemoveBehaviorsGradeBatchUseCase() {
  const behaviorsRepository = new PrismaBehaviorsRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const studentsRepository = new PrismaStudentsRepository()
  const behaviorsBatchRepository = new PrismaBehaviorsBatchRepository()
  return new RemoveBehaviorsGradeBatchUseCase(
    behaviorsRepository,
    coursesRepository,
    studentsRepository,
    behaviorsBatchRepository
  )  
}