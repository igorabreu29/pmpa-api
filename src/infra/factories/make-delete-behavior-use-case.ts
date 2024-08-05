import { PrismaBehaviorsRepository } from "../database/repositories/prisma-behaviors-repository.ts"
import { DeleteBehaviorUseCaseUseCase } from "@/domain/boletim/app/use-cases/delete-behavior.ts"

export function makeDeleteBehaviorUseCase() {
  const behaviorsRepository = new PrismaBehaviorsRepository()
  return new DeleteBehaviorUseCaseUseCase(
    behaviorsRepository,
  )  
}