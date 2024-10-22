import { CreateBehaviorsBatchUseCase } from "@/domain/boletim/app/use-cases/create-behaviors-batch.ts"
import { PrismaBehaviorsRepository } from "../database/repositories/prisma-behaviors-repository.ts"
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts"
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts"
import { PrismaBehaviorsBatchRepository } from "../database/repositories/prisma-behaviors-batch-repository.ts"
import { GenerateClassificationJob } from "../classification/generate-classification.ts"

export function makeCreateBehaviorsBatchUseCase() {
  const behaviorsRepository = new PrismaBehaviorsRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const studentsRepository = new PrismaStudentsRepository()
  const behaviorsBatchRepository = new PrismaBehaviorsBatchRepository()
  const generateClassification = new GenerateClassificationJob()

  return new CreateBehaviorsBatchUseCase(
    behaviorsRepository,
    coursesRepository,
    studentsRepository,
    behaviorsBatchRepository,
    generateClassification
  )  
}