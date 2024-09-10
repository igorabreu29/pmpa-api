import { RemoveBehaviorGradeUseCase } from "@/domain/boletim/app/use-cases/remove-behavior-grade.ts";
import { PrismaBehaviorsRepository } from "../database/repositories/prisma-behaviors-repository.ts";

export function makeRemoveBehaviorGradeUseCase() {
  const behaviorsRepository = new PrismaBehaviorsRepository()
  return new RemoveBehaviorGradeUseCase(
    behaviorsRepository
  )
}