import { UpdateBehaviorUseCaseUseCase } from "@/domain/boletim/app/use-cases/update-behavior.ts"
import { PrismaBehaviorsRepository } from "../database/repositories/prisma-behaviors-repository.ts"

export function makeUpdateBehaviorUseCase() {
  const behaviorsRepository = new PrismaBehaviorsRepository()
  return new UpdateBehaviorUseCaseUseCase(
    behaviorsRepository,
  )  
}